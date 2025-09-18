
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
  Select as ShadSelect,
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
import { useEffect, useMemo } from "react";
import { departments, staffRoles, staffSkills } from "@/lib/placeholder-data";
import type { StaffMember } from "./Staff";
import Select from "react-select";

type StaffFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "add" | "edit";
  staffMember?: StaffMember;
  onSave: (service: Omit<StaffMember, "id" | "salonId">) => void;
};

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.string({ required_error: "Please select a role." }),
  department: z.string({ required_error: "Please select a department." }),
  commission: z.coerce.number().min(0, "Commission cannot be negative.").max(100, "Commission cannot exceed 100."),
  shiftTimings: z.string().min(1, "Shift timing is required."),
  skills: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
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
      name: "",
      department: undefined,
      role: undefined,
      commission: 0,
      shiftTimings: "9 AM - 5 PM",
      skills: [],
    },
  });
  
  const skillOptions = useMemo(() => {
    return staffSkills.map(s => ({ value: s, label: s }));
  }, []);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: staffMember?.name || "",
        department: staffMember?.department || undefined,
        role: staffMember?.role || undefined,
        commission: staffMember?.commission || 0,
        shiftTimings: staffMember?.shiftTimings || "9 AM - 5 PM",
        skills: staffMember?.skills.map(s => ({ value: s, label: s })) || [],
      });
    }
  }, [isOpen, staffMember, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const submissionValues = {
        ...values,
        skills: values.skills?.map(s => s.value) || [],
    }
    onSave(submissionValues);
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
      <DialogContent className="sm:max-w-md">
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <ShadSelect
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
                    </ShadSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <ShadSelect
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </ShadSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <Select
                      isMulti
                      options={skillOptions}
                      value={field.value}
                      onChange={field.onChange}
                      className="text-sm"
                      classNamePrefix="select"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="commission"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Commission (%)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 10" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="shiftTimings"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Shift Timings</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., 9 AM - 5 PM" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>


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
