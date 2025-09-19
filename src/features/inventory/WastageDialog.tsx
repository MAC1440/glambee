
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
import { Textarea } from "@/components/ui/textarea";

type WastageDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  productName: string;
  onConfirm: (values: { quantity: number; reason: string }) => void;
};

const formSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  reason: z.string().min(5, "Please provide a reason for the wastage."),
});

export function WastageDialog({
  isOpen,
  onOpenChange,
  productName,
  onConfirm,
}: WastageDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity: 1, reason: "" },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ quantity: 1, reason: "" });
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Record Wastage: {productName}</DialogTitle>
              <DialogDescription>
                Log items that were damaged, expired, or otherwise unusable. This will be recorded in the audit log.
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Wasted</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Dropped during handling, Expired" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">Confirm Wastage</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
