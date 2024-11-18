"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Label, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MessageSentStatistics } from "@/lib/utils/statisticsUtils";

// DynamicChart component to decide between Bar or Line chart
interface DynamicChartProps {
  data: MessageSentStatistics[];
  from?: string;
  to?: string;
}

export function DynamicChart({ data, from, to }: DynamicChartProps) {
  // Memoize the transformed data
  const chartData = useMemo(() => {
    const maxItems =
      window.innerWidth < 1024 ? 6 : window.innerWidth < 2560 ? 11 : 13;
    return data
      .map(item => ({
        label: item.title,
        count: item.count,
      }))
      .slice(0, maxItems);
  }, [data, window.innerWidth]);

  // dx -> Set it to 10 if small screen, 20 if desktop, 40 if 4k
  const dx = useMemo(
    () =>
      window.innerWidth < 1024 ? -10 : window.innerWidth < 2560 ? -20 : -40,
    [window.innerWidth],
  );

  const isEmpty = useMemo(() => chartData.length === 0, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg 4k:text-5xl">
          הודעות שנשלחו בין {from} ל-{to}
        </CardTitle>
        <CardDescription className="text-sm 4k:text-2xl">
          הודעות שנשלחו לשם ההודעה
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ count: { label: "כמות", color: "hsl(var(--primary))" } }}
        >
          <BarChart width={600} height={300} data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={1}
              axisLine={false}
              className="text-xs 4k:text-2xl 4k:font-semibold"
            />
            <YAxis
              allowDecimals={false}
              tick={{ dx }}
              className="text-xs 4k:text-2xl 4k:font-semibold"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm 4k:text-3xl"></CardFooter>
    </Card>
  );
}
