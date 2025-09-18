
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type PerformanceMetric = {
  staffId: string;
  name: string;
  totalSales: number;
  servicesCompleted: number;
  attendanceRate: number;
  avgRating: number;
};

const metricLabels: { [key: string]: string } = {
  totalSales: "Total Sales ($)",
  servicesCompleted: "Services Completed",
  attendanceRate: "Attendance Rate (%)",
  avgRating: "Average Rating",
};

export function PerformanceChart({
  data,
  metric,
}: {
  data: PerformanceMetric[];
  metric: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            metric === "totalSales" ? `$${value}` : value
          }
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Bar
          dataKey={metric}
          name={metricLabels[metric]}
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
