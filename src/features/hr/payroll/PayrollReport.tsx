
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { staff, appointments } from "@/lib/placeholder-data";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./DateRangePicker";
import { addDays, format, isWithinInterval } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileDown, Printer } from "lucide-react";

export function PayrollReport() {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 6, 20),
    to: addDays(new Date(2024, 6, 20), 20),
  });
  const [report, setReport] = useState<any>(null);

  const handleGenerateReport = () => {
    if (!selectedStaffId || !dateRange?.from || !dateRange?.to) {
      // Add a toast notification here in a real app
      console.error("Please select a staff member and a date range.");
      return;
    }

    const staffMember = staff.find((s) => s.id === selectedStaffId);
    if (!staffMember) return;

    const relevantAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        apt.staff === staffMember.name &&
        isWithinInterval(aptDate, { start: dateRange.from!, end: dateRange.to! })
      );
    });

    const totalSales = relevantAppointments.reduce(
      (sum, apt) => sum + apt.price,
      0
    );
    const totalCommission = (totalSales * staffMember.commission) / 100;
    // Base salary would come from a database in a real app
    const baseSalary = 2000;
    const totalEarnings = baseSalary + totalCommission;

    setReport({
      staffMember,
      dateRange,
      appointments: relevantAppointments,
      totalSales,
      totalCommission,
      baseSalary,
      totalEarnings,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">Payroll Report</h1>
          <p className="text-muted-foreground mt-2">
            Generate payroll and commission reports for your staff.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Report Generator */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>
                Select a staff member and date range to generate a report.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-select">Staff Member</Label>
                <Select onValueChange={setSelectedStaffId}>
                  <SelectTrigger id="staff-select">
                    <SelectValue placeholder="Select staff..." />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerateReport} className="w-full">
                Generate Report
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Report Display */}
        <div className="lg:col-span-2">
          {report ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      Payroll for {report.staffMember.name}
                    </CardTitle>
                    <CardDescription>
                      {format(report.dateRange.from, "LLL dd, y")} -{" "}
                      {format(report.dateRange.to, "LLL dd, y")}
                    </CardDescription>
                  </div>
                   <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <FileDown className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                     <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p className="text-2xl font-bold">${report.totalSales.toFixed(2)}</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Commission ({report.staffMember.commission}%)</p>
                        <p className="text-2xl font-bold">${report.totalCommission.toFixed(2)}</p>
                    </div>
                     <div className="p-4 bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary">Total Earnings</p>
                        <p className="text-2xl font-bold text-primary">${report.totalEarnings.toFixed(2)}</p>
                    </div>
                </div>
                
                <h4 className="font-semibold mb-2">Appointments ({report.appointments.length})</h4>
                <div className="border rounded-md max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.appointments.map((apt: any) => (
                        <TableRow key={apt.id}>
                          <TableCell>{apt.date}</TableCell>
                          <TableCell>{apt.service}</TableCell>
                          <TableCell className="text-right">
                            ${apt.price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-96">
              <CardContent>
                <p className="text-muted-foreground">
                  Generate a report to see the results.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
