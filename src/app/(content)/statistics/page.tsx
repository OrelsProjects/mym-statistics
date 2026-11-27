"use client";

import { useState, useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  subMonths,
  startOfMonth,
  startOfDay,
} from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicChart } from "@/components/ui/messagesSentGraph";
import useStatistics from "@/lib/hooks/useStatistics";
import {
  CallsStatistics,
  MessageSentStatistics,
} from "@/lib/utils/statisticsUtils";
import moment from "moment";
import axios from "axios";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import CustomPieChart from "@/components/ui/chart/pieChart";
import { UnhandledCallList } from "@/app/(content)/statistics/unhandledCallList";
import { HANDLED_MARKS_UNAVAILABLE_MESSAGE } from "@/lib/utils/handledCallMarks";

type DateRange = "daily" | "weekly" | "monthly" | "custom";

function markHandledErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 503) {
    const data = error.response.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && "error" in data) {
      const message = (data as { error?: unknown }).error;
      if (typeof message === "string" && message.trim()) return message;
    }
    return HANDLED_MARKS_UNAVAILABLE_MESSAGE;
  }
  return "שגיאה בסימון השיחות כטופלו";
}

function withoutHiddenMarks(
  data: CallsStatistics,
  hiddenIds: Set<string>,
): CallsStatistics {
  const unhandledCalls = (data.unhandledCalls || []).filter(
    call => !hiddenIds.has(call.id),
  );
  return {
    ...data,
    incoming: data.incoming || 0,
    outgoing: data.outgoing || 0,
    tagged: data.tagged || 0,
    unhandled: unhandledCalls.length,
    unhandledCalls,
  };
}

export default function StatisticsDashboard() {
  const { getMessagesSentStatistics, getCallsStatistics, markCallsHandled } =
    useStatistics();
  const [messagesSentData, setMessageSentData] = useState<
    MessageSentStatistics[]
  >([]);
  const [callsData, setCallsData] = useState<CallsStatistics>({
    incoming: 0,
    outgoing: 0,
    tagged: 0,
    unhandled: 0,
    unhandledCalls: [],
  });
  const [dateRangeType, setDateRangeType] = useState<DateRange>("daily");
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
    from: new Date(),
  });
  const hiddenIds = useRef(new Set<string>());
  const callsRef = useRef(callsData);
  const dateRangeRef = useRef(dateRange);
  const fetchDataRef = useRef<(from: Date, to: Date) => void>(() => {});
  callsRef.current = callsData;
  dateRangeRef.current = dateRange;

  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false); // State to control Calendar visibility

  const fetchData = async (from: Date, to: Date) => {
    try {
      const formattedFrom = format(from, "yyyy-MM-dd");
      const formattedTo = format(to, "yyyy-MM-dd");
      setLoading(true);
      const newMessagesSentDataPromise = getMessagesSentStatistics(
        formattedFrom,
        formattedTo,
      );

      const newCallsDataPromise = getCallsStatistics(
        formattedFrom,
        formattedTo,
      );

      const [newMessagesSentData, newCallsData] = await Promise.all([
        newMessagesSentDataPromise,
        newCallsDataPromise,
      ]);

      setLoading(false);
      setMessageSentData(newMessagesSentData);
      const nextCalls = withoutHiddenMarks(
        {
          incoming: newCallsData.incoming || 0,
          outgoing: newCallsData.outgoing || 0,
          tagged: newCallsData.tagged || 0,
          unhandled: newCallsData.unhandled || 0,
          unhandledCalls: newCallsData.unhandledCalls || [],
        },
        hiddenIds.current,
      );
      callsRef.current = nextCalls;
      setCallsData(nextCalls);
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error("שגיאה בטעינת הנתונים");
        setLoading(false);
      }
    }
  };
  fetchDataRef.current = fetchData;

  const handleMarkHandled = async (ids: string[]) => {
    const fresh = ids.filter(id => id && !hiddenIds.current.has(id));
    if (fresh.length === 0) return;

    const rangeAtClick = {
      from: dateRangeRef.current.from,
      to: dateRangeRef.current.to,
    };
    const idSet = new Set(fresh);
    const snapshot = callsRef.current;
    const removed = snapshot.unhandledCalls.filter(call => idSet.has(call.id));
    fresh.forEach(id => hiddenIds.current.add(id));

    const next = withoutHiddenMarks(snapshot, hiddenIds.current);
    callsRef.current = next;
    setCallsData(next);

    try {
      await markCallsHandled(fresh);
    } catch (error) {
      fresh.forEach(id => hiddenIds.current.delete(id));
      const active = dateRangeRef.current;
      const sameRange =
        active.from.getTime() === rangeAtClick.from.getTime() &&
        (active.to?.getTime() ?? null) === (rangeAtClick.to?.getTime() ?? null);
      if (sameRange && callsRef.current === next) {
        const merged = [...next.unhandledCalls, ...removed].sort((a, b) => {
          if (a.startDate === b.startDate) return 0;
          return a.startDate < b.startDate ? 1 : -1;
        });
        const rolled = withoutHiddenMarks(
          { ...next, unhandledCalls: merged, unhandled: merged.length },
          hiddenIds.current,
        );
        callsRef.current = rolled;
        setCallsData(rolled);
      } else if (active.to) {
        fetchDataRef.current(active.from, active.to);
      }
      if (!axios.isCancel(error)) {
        toast.error(markHandledErrorMessage(error));
      }
    }
  };

  useEffect(() => {
    const now = new Date();
    let from: Date, to: Date;
    switch (dateRangeType) {
      case "daily":
        from = startOfDay(now);
        to = now;
        break;
      case "weekly":
        from = startOfWeek(now);
        to = endOfWeek(now);
        break;
      case "monthly":
        from = startOfMonth(now);
        to = now;
        break;
      default:
        return;
    }
    setDateRange({ from, to });
    fetchData(from, to);
  }, [dateRangeType]);

  useEffect(() => {
    if (dateRangeType !== "custom") return;
    if (dateRange.from && dateRange.to) {
      fetchData(dateRange.from, dateRange.to);
    }
  }, [dateRange, dateRangeType]);

  const handleDateChange = (key: "from" | "to", value: Date) => {
    setDateRange(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const tabsTriggerClassname =
    "text-lg py-0 4k:font-medium 4k:text-4xl 4k:px-8 4k:py-2";

  return (
    <div className="flex flex-col gap-10 items-center justify-start">
      {/* Date selection tabs and calendar */}
      <div className="w-full max-w-4xl 4k:max-w-screen-2xl flex mx-auto flex-col items-start gap-4">
        <Tabs
          value={dateRangeType}
          onValueChange={value => {
            setDateRangeType(value as DateRange);
          }}
        >
          <TabsList className="4k:h-fit 4k:p-3 flex w-fit ml-auto">
            <TabsTrigger
              className={tabsTriggerClassname}
              value="custom"
              onClick={() => {
                // Toggle calendar open/close if "custom" is already selected
                if (dateRangeType === "custom") {
                  setCalendarOpen(!calendarOpen);
                } else {
                  setCalendarOpen(true);
                }
                setDateRangeType("custom");
              }}
            >
              בחירה
            </TabsTrigger>
            <TabsTrigger value="monthly" className={tabsTriggerClassname}>
              החודש
            </TabsTrigger>
            <TabsTrigger value="weekly" className={tabsTriggerClassname}>
              השבוע
            </TabsTrigger>
            <TabsTrigger value="daily" className={tabsTriggerClassname}>
              היום
            </TabsTrigger>
          </TabsList>
          <TabsContent value="custom">
            {dateRangeType === "custom" && (
              <div className="flex flex-row gap-6" dir="rtl">
                <div>
                  <h3 className="text-lg font-bold ml-auto">מתאריך</h3>
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={date =>
                      handleDateChange("from", date || new Date())
                    }
                    className="rounded-md border bg-background"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">עד תאריך</h3>
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={date =>
                      handleDateChange("to", date || new Date())
                    }
                    className="rounded-md border bg-background"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <p className="text-lg 4k:text-4xl font-bold">
          {dateRange.from ? moment(dateRange.from).format("YYYY/MM/DD") : ""}
          {dateRange.to
            ? ` - ${moment(dateRange.to).format("YYYY/MM/DD")}`
            : ""}
        </p>
      </div>

      {/* Messages Sent Statistics Card */}
      <Card className="w-full max-w-4xl 4k:max-w-screen-2xl mx-auto 4k:space-y-6">
        <CardHeader>
          <CardTitle className="text-lg 4k:text-5xl">
            סטטיסטיקות הודעות שנשלחו
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start space-y-2 4k:space-y-16">
          <div className="w-full h-full relative z-10">
            <div
              className={cn(
                "absolute inset-0 bg-background/60 z-50 flex justify-center items-center",
                {
                  hidden: !loading,
                },
              )}
            >
              <Loader2 className="w-24 h-24 text-primary animate-spin" />
            </div>
            <DynamicChart
              data={messagesSentData}
              from={
                dateRange.from
                  ? moment(dateRange.from).format("YYYY-MM-DD")
                  : ""
              }
              to={dateRange.to ? moment(dateRange.to).format("YYYY-MM-DD") : ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* Calls Statistics Card */}
      <Card className="w-full max-w-4xl 4k:max-w-screen-2xl mx-auto 4k:space-y-6">
        <CardHeader>
          <CardTitle className="text-lg 4k:text-5xl">סטטיסטיקת שיחות</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start 4k:space-y-16">
          <div className="w-full h-full relative z-10">
            <div
              className={cn(
                "absolute inset-0 bg-background/60 z-50 flex justify-center items-center",
                {
                  hidden: !loading,
                },
              )}
            >
              <Loader2 className="w-24 h-24 text-primary animate-spin" />
            </div>
            <div className="flex flex-col md:flex-row md:flex-wrap md:justify-between gap-2">
              <CustomPieChart
                loading={loading}
                title="שיחות יוצאות"
                totalItemsTitle="שיחות יוצאות"
                items={[
                  {
                    label: "שיחות יוצאות",
                    value: callsData.outgoing || 0,
                    fill: "#FFC10780",
                  },
                ]}
              />

              <CustomPieChart
                loading={loading}
                title="שיחות נכנסות"
                totalItemsTitle="שיחות נכנסות"
                items={[
                  {
                    label: "שיחות נכנסות",
                    value: callsData.incoming,
                    fill: "#4CAF5080",
                  },
                ]}
              />

              <CustomPieChart
                loading={loading}
                title="שיחות מתוייגות"
                totalItemsTitle="שיחות מתוייגות"
                items={[
                  {
                    label: "שיחות מתוייגות",
                    value: callsData.tagged || 0,
                    fill: "#2196F380",
                  },
                ]}
              />

              <CustomPieChart
                loading={loading}
                title="שיחות שלא טופלו"
                totalItemsTitle="לא טופלו"
                items={[
                  {
                    label: "שיחות שלא טופלו",
                    value: callsData.unhandled || 0,
                    fill: "#E5393580",
                  },
                ]}
              />
            </div>
            <UnhandledCallList
              calls={callsData.unhandledCalls || []}
              onMarkHandled={handleMarkHandled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
