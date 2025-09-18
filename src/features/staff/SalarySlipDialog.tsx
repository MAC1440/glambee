
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import type { StaffMember } from "./Staff";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { salarySlips } from "@/lib/placeholder-data";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SalarySlipDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  staffMember: StaffMember;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];


export function SalarySlipDialog({
  isOpen,
  onOpenChange,
  staffMember,
}: SalarySlipDialogProps) {
    const { toast } = useToast();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    
    const salaryRecord = useMemo(() => {
        return salarySlips.find(
            slip => slip.staffId === staffMember.id &&
            slip.month === selectedMonth &&
            slip.year === selectedYear
        );
    }, [staffMember, selectedMonth, selectedYear]);

    const handleAction = (action: "Download" | "Print") => {
        toast({
            title: `Slip ${action}ed`,
            description: `The salary slip for ${staffMember.name} has been sent to ${action.toLowerCase()}.`
        })
    }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Salary Slip</DialogTitle>
          <DialogDescription>
            Select a period to generate the slip for {staffMember.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
            <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                </SelectContent>
            </Select>
             <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        {salaryRecord ? (
            <div className="border rounded-lg p-4 space-y-3">
                <div className="text-center">
                    <h3 className="font-bold text-lg">SalonFlow Payslip</h3>
                    <p className="text-sm text-muted-foreground">{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
                </div>
                <Separator />
                <div className="flex justify-between">
                    <span className="font-medium">Employee:</span>
                    <span>{staffMember.name}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="font-medium">Role:</span>
                    <span>{staffMember.role}</span>
                </div>
                <Separator />
                <h4 className="font-semibold">Earnings</h4>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Salary:</span>
                    <span>${salaryRecord.baseSalary.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Commission ({staffMember.commission}%):</span>
                    <span>${salaryRecord.commission.toFixed(2)}</span>
                </div>
                 <Separator />
                 <h4 className="font-semibold">Deductions</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes & Others:</span>
                    <span className="text-red-500">-${salaryRecord.deductions.toFixed(2)}</span>
                </div>
                 <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Net Pay:</span>
                    <span>${salaryRecord.totalEarnings.toFixed(2)}</span>
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => handleAction("Print")}>
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button onClick={() => handleAction("Download")}>
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                </DialogFooter>
            </div>
        ): (
            <div className="flex flex-col items-center justify-center h-48 border rounded-lg border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-center text-muted-foreground">No salary record found for this period.</p>
            </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
