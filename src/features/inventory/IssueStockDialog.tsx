
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { staff } from "@/lib/placeholder-data";
import { Textarea } from "@/components/ui/textarea";

type IssueStockDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  productName: string;
  onConfirm: (values: { staffId: string; quantity: number, notes?: string }) => void;
};

const formSchema = z.object({
  staffId: z.string({ required_error: "Please select a staff member." }),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  notes: z.string().optional(),
});

export function IssueStockDialog({
  isOpen,
  onOpenChange,
  productName,
  onConfirm,
}: IssueStockDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { staffId: undefined, quantity: 1, notes: "" },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Issue Stock: {productName}</DialogTitle>
              <DialogDescription>
                Issue this product to a staff member. This will be recorded in the audit log.
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., For use at station 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Issuance</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
