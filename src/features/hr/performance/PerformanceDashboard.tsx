
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { performanceData } from "@/lib/performance-data";
import { PerformanceTable } from "./PerformanceTable";
import { PerformanceChart } from "./PerformanceChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export function PerformanceDashboard() {
  const [chartMetric, setChartMetric] = useState("totalSales");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">
            Staff Performance
          </h1>
          <p className="text-muted-foreground mt-2">
            Review key performance indicators for your team.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>
                Visualize staff performance across key metrics.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="metric-select" className="text-sm font-medium">
                Chart Metric:
              </Label>
              <Select value={chartMetric} onValueChange={setChartMetric}>
                <SelectTrigger id="metric-select" className="w-[180px]">
                  <SelectValue placeholder="Select Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalSales">Total Sales</SelectItem>
                  <SelectItem value="servicesCompleted">
                    Services Completed
                  </SelectItem>
                  <SelectItem value="attendanceRate">
                    Attendance Rate
                  </SelectItem>
                  <SelectItem value="avgRating">Average Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={performanceData} metric={chartMetric} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            Detailed performance data for all staff members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceTable data={performanceData} />
        </CardContent>
      </Card>
    </div>
  );
}
