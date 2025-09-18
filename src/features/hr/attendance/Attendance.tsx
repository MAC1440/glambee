
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { attendanceRecords, staff } from "@/lib/placeholder-data";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type AttendanceRecord = {
  staffId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: "Present" | "Absent" | "Late" | "On Leave";
};

export function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const getStatusColor = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "Absent":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      case "Late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "On Leave":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
    }
  };

  const dailyRecords = attendanceRecords.filter(
    (record) =>
      selectedDate &&
      format(new Date(record.date), "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">Attendance</h1>
          <p className="text-muted-foreground mt-2">
            Track daily attendance for all staff members.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Attendance for{" "}
                {selectedDate ? format(selectedDate, "PPP") : "..."}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyRecords.length > 0 ? (
                    dailyRecords.map((record) => {
                      const staffMember = staff.find(
                        (s) => s.id === record.staffId
                      );
                      if (!staffMember) return null;

                      return (
                        <TableRow key={record.staffId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage
                                  src={`https://picsum.photos/seed/${staffMember.name}/100`}
                                  alt="Avatar"
                                />
                                <AvatarFallback>
                                  {staffMember.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">
                                {staffMember.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{record.clockIn || "N/A"}</TableCell>
                          <TableCell>{record.clockOut || "N/A"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(getStatusColor(record.status))}
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No attendance records for this date.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
