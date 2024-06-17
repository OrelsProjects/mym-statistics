"use client";

import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Day,
  Month,
  PhonecallCountStatistics,
  PhonecallCountStatisticsType,
  Week,
} from "../../../models/statistics";
import { Tabs } from "../../../components/ui/tabs";

export default function Home() {
  const [type, setType] = useState<PhonecallCountStatisticsType>("daily");
  const [phonecallStatistics, setPhonecallStatistics] =
    useState<PhonecallCountStatistics>({});

  const getStats = async (type: PhonecallCountStatisticsType) => {
    if (phonecallStatistics[type]) return;
    const stats = await axios.get<PhonecallCountStatistics>(
      "/api/statistics/callsCount/" + type,
    );
    setPhonecallStatistics({
      ...phonecallStatistics,
      [type]: stats.data[type],
    });
  };

  useEffect(() => {
    getStats(type);
  }, [type]);

  const data = useMemo(() => {
    switch (type) {
      case "daily":
        const dataDaily = Object.keys(phonecallStatistics.daily || {}).map(
          (key: string) => {
            const day = key as Day;
            const value = phonecallStatistics.daily?.[day];
            return {
              name: key,
              uv: value || 0,
            };
          },
        );
        return dataDaily;
      case "weekly":
        const dataWeekly = Object.keys(phonecallStatistics.weekly || {}).map(
          key => {
            const week = key as unknown as Week;
            const value = phonecallStatistics.weekly?.[week];
            return {
              name: key,
              uv: value || 0,
            };
          },
        );
        return dataWeekly;
      case "monthly":
        const dataMonthly = Object.keys(phonecallStatistics.monthly || {}).map(
          key => {
            const month = key as Month;
            const value = phonecallStatistics.monthly?.[month];
            return {
              name: key,
              uv: value || 0,
            };
          },
        );
        return dataMonthly;
      default:
        return [];
    }
  }, [phonecallStatistics, type]);

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        items={[
          { label: "daily", value: "daily" },
          { label: "weekly", value: "weekly" },
          { label: "monthly", value: "monthly" },
        ]}
        onChange={value => setType(value as PhonecallCountStatisticsType)}
        defaultValue={"daily"}
      />

      <AreaChart
        width={730}
        height={250}
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        dataKey={"calls"}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="uv"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorUv)"
        />
        <Area
          type="monotone"
          dataKey="pv"
          stroke="#82ca9d"
          fillOpacity={1}
          fill="url(#colorPv)"
        />
      </AreaChart>
    </div>
  );
}
