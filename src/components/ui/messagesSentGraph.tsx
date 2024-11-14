"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
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
    return data
      .map(item => ({
        label: item.title,
        count: item.count,
      }))
      .slice(0, 10);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          הודעות שנשלחו בין {from} ל-{to}
        </CardTitle>
        <CardDescription>הודעות שנשלחו לשם ההודעה</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ count: { label: "Count", color: "hsl(var(--primary))" } }}
        >
          <BarChart width={600} height={300} data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={1}
              axisLine={false}
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
