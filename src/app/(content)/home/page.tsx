"use client";

import { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  subMonths,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicChart } from "@/components/ui/messagesSentGraph";
import useStatistics from "@/lib/hooks/useStatistics";
import { MessageSentStatistics } from "@/lib/utils/statisticsUtils";
import moment from "moment";
import axios from "axios";
import { toast } from "react-toastify";
import { cn } from "../../../lib/utils";
import { Loader2 } from "lucide-react";

type DateRange = "daily" | "weekly" | "monthly" | "custom";

export default function StatisticsDashboard() {
  const { getMessagesSentStatistics } = useStatistics();
  const [data, setData] = useState<MessageSentStatistics[]>([]);
  const [dateRangeType, setDateRangeType] = useState<DateRange>("daily");
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
    from: new Date(),
  });

  const [loading, setLoading] = useState(false);

  const fetchData = async (from: Date, to: Date) => {
    try {
      const formattedFrom = format(from, "yyyy-MM-dd");
      const formattedTo = format(to, "yyyy-MM-dd");
      setLoading(true);
      const newData = await getMessagesSentStatistics(
        formattedFrom,
        formattedTo,
      );
      setLoading(false);
      setData(newData);
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error("שגיאה בטעינת הנתונים");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const now = new Date();
    let from: Date, to: Date;
    switch (dateRangeType) {
      case "daily":
        from = startOfWeek(now);
        to = now;
        break;
      case "weekly":
        from = startOfMonth(now);
        to = endOfWeek(now);
        break;
      case "monthly":
        from = subMonths(now, 1);
        to = now;
        break;
      default:
        return;
    }
    setDateRange({ from, to });

    fetchData(from, to);
  }, [dateRangeType]);

  useEffect(() => {
    if (dateRangeType !== "custom") {
      return;
    }
    if (dateRange.from && dateRange.to) {
      fetchData(dateRange.from, dateRange.to);
    }
  }, [dateRange, dateRangeType]);

  return (
    <Card className="w-full max-w-4xl 4k:max-w-screen-2xl mx-auto">
      <CardHeader>
        <CardTitle>סטטיסטיקות הודעות שנשלחו</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start">
        <Tabs
          value={dateRangeType}
          onValueChange={value => setDateRangeType(value as DateRange)}
        >
          <TabsList>
            <TabsTrigger value="custom">בחירה</TabsTrigger>
            <TabsTrigger value="monthly">חודשי</TabsTrigger>
            <TabsTrigger value="weekly">שבועי</TabsTrigger>
            <TabsTrigger value="daily">יומי</TabsTrigger>
          </TabsList>
          <TabsContent value="custom" className="mt-4">
            <div className="flex space-x-4 absolute">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={range => {
                  if (range?.from && range?.to) {
                    setDateRange({
                      from: range.from,
                      to: range.to,
                    });
                  }
                }}
                className="rounded-md border bg-background"
              />
            </div>
          </TabsContent>
        </Tabs>
        <div className="w-full h-full mt-6 relative">
          <div
            className={cn(
              "absolute inset-0 bg-black/60 z-50 flex justify-center items-center",
              {
                hidden: !loading,
              },
            )}
          >
            <Loader2 className="w-24 h-24 text-primary animate-spin" />
          </div>
          <DynamicChart
            data={data}
            from={
              dateRange.from ? moment(dateRange.from).format("YYYY-MM-DD") : ""
            }
            to={dateRange.to ? moment(dateRange.to).format("YYYY-MM-DD") : ""}
          />
        </div>
      </CardContent>
    </Card>
  );
}
