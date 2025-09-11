
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
import { departments } from "@/lib/placeholder-data";
import type { StaffMember } from "./Staff";

type StaffFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "add" | "edit";
  staffMember?: StaffMember;
  onSave: (service: Omit<StaffMember, "id" | "salonId">) => void;
};

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  department: z.string({ required_error: "Please select a department." }),
});

export function StaffFormDialog({
  isOpen,
  onOpenChange,
  mode,
  staffMember,
  onSave,
}: StaffFormDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: staffMember?.name || "",
      department: staffMember?.department || undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: staffMember?.name || "",
        department: staffMember?.department || undefined,
      });
    }
  }, [isOpen, staffMember, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
    onOpenChange(false);
  };

  const title =
    mode === "add" ? `Add New Staff Member` : `Edit ${staffMember?.name}`;
  const description =
    mode === "add"
      ? "Fill out the details for the new team member."
      : "Update the team member's details.";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
