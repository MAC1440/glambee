
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star } from "lucide-react";

type PerformanceMetric = {
  staffId: string;
  name: string;
  totalSales: number;
  servicesCompleted: number;
  attendanceRate: number;
  avgRating: number;
};

export function PerformanceTable({ data }: { data: PerformanceMetric[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff Member</TableHead>
          <TableHead>Services Completed</TableHead>
          <TableHead>Total Sales</TableHead>
          <TableHead>Attendance</TableHead>
          <TableHead className="text-right">Avg. Client Rating</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.staffId}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={`https://picsum.photos/seed/${item.name}/100`}
                    alt="Avatar"
                  />
                  <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{item.name}</div>
              </div>
            </TableCell>
            <TableCell>{item.servicesCompleted}</TableCell>
            <TableCell>${item.totalSales.toFixed(2)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress value={item.attendanceRate} className="w-24" />
                <span className="text-sm text-muted-foreground">
                  {item.attendanceRate}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <span className="font-semibold">{item.avgRating.toFixed(1)}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
