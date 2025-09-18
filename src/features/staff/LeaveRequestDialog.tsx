
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "../hr/payroll/DateRangePicker";
import { addDays } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

type LeaveRequestDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (values: any) => void;
  staffName: string;
};

const formSchema = z.object({
  type: z.string({ required_error: "Please select a request type." }),
  dates: z.object({
      from: z.date(),
      to: z.date(),
  }).optional(),
  reason: z.string().min(10, "Please provide a brief reason."),
});

export function LeaveRequestDialog({
  isOpen,
  onOpenChange,
  onSave,
  staffName,
}: LeaveRequestDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined,
      dates: {
        from: new Date(),
        to: addDays(new Date(), 4),
      },
      reason: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
  };

  const title = `New Request for ${staffName}`;
  const description = "Fill out the details for the leave or loan request.";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a request type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                      <SelectItem value="Loan Request">Loan Request</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dates</FormLabel>
                   <DateRangePicker 
                      value={field.value} 
                      onChange={(range) => field.onChange(range)}
                   />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason / Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly explain the reason for your request..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
