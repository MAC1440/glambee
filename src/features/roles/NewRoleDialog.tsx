
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

type NewRoleDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (values: { name: string; description?: string | null; }, isEditing: boolean) => void;
  editingRole: { name: string; description?: string; id?: string } | null;
};

const formSchema = z.object({
  name: z.string().min(3, "Role name must be at least 3 characters."),
  description: z.string().optional().nullable(),
});

export function NewRoleDialog({
  isOpen,
  onOpenChange,
  onSave,
  editingRole,
}: NewRoleDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  });

  // useEffect(() => {
  //   if (isOpen) {
  //     form.reset();
  //   }
  // }, [isOpen, form]);

  useEffect(() => {
    if (isOpen) {
      if (editingRole) {
        form.reset({
          name: editingRole.name || "",
          description: editingRole.description || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [isOpen, editingRole, form]);
  
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values, !!editingRole);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
              <DialogDescription>
                {editingRole ? 'Edit the role details.' : 'Define a new role. You can set its permissions after creating it.'}
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Marketing Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this role can do..." 
                      {...field}
                      value={field.value || ""}
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
              <Button type="submit">{editingRole ? 'Save Changes' : 'Create Role'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

