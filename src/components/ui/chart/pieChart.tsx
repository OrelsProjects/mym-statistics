"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

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
import { formatNumber } from "../../../lib/utils/number";
import { Skeleton } from "@/components/ui/skeleton"; // Import the Skeleton component

interface ChartItem {
  label: string;
  value: number;
  fill?: string;
}

interface CustomPieChartProps {
  title: string;
  subtitle?: string;
  items: ChartItem[];
  totalItemsTitle: string;
  loading?: boolean; // Add loading prop
}
export default function CustomPieChart({
  title,
  subtitle,
  items,
  totalItemsTitle,
  loading = false, // Default to false
}: CustomPieChartProps) {
  const totalCount = React.useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.value, 0);
  }, [items]);

  const innerRadius = React.useMemo(() => {
    return window.innerWidth >= 2000 ? 130 : 70;
  }, []);

  const totalItemsTitleYOffset = React.useMemo(() => {
    return window.innerWidth >= 2000 ? 38 : 24;
  }, []);

  const chartData = React.useMemo(() => {
    if (totalCount === 0) {
      // Fallback data for when totalCount is 0
      return [
        {
          label: `אין ${title}`,
          value: 1,
          fill: items?.[0]?.fill || "hsl(var(--chart-1))",
        },
      ];
    }
    return items;
  }, [items, totalCount]);

  const chartConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    chartData.forEach((item, index) => {
      config[item.label.toLowerCase()] = {
        label: item.label,
        color: item.fill || `var(--chart-${index})`,
      };
    });
    return config;
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="4k:text-5xl">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <Skeleton className="mx-auto aspect-square w-52 h-52 4k:w-96 4k:h-96" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-52 h-52 4k:w-96 4k:h-96"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                innerRadius={innerRadius}
                outerRadius={innerRadius + 10} // Slight padding for better visibility
                strokeWidth={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl 4k:text-6xl font-bold"
                          >
                            {formatNumber(totalCount)}
                          </tspan>

                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + totalItemsTitleYOffset}
                            className="fill-muted-foreground text-base 4k:text-2xl"
                          >
                            {totalItemsTitle}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
