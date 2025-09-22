
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import type { Template } from "./MessageTemplates";
import { PlusCircle, Trash2 } from "lucide-react";

type TemplateFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "add" | "edit";
  template?: Template;
  onSave: (values: Omit<Template, "id">) => void;
};

const formSchema = z.object({
  name: z.string().min(3, "Template name is too short."),
  contentEn: z.string().min(10, "Content is too short."),
  attachments: z.array(z.object({
      name: z.string().min(1, "Attachment name is required."),
      url: z.string().url("Must be a valid URL."),
  })).optional(),
});

export function TemplateFormDialog({
  isOpen,
  onOpenChange,
  mode,
  template,
  onSave,
}: TemplateFormDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: "",
        contentEn: "",
        attachments: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attachments",
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(
        mode === 'edit' && template ? { ...template, contentEn: template.content } : {
            name: "",
            contentEn: "",
            attachments: [],
        }
      );
    }
  }, [isOpen, mode, template, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const submissionData = {
        name: values.name,
        content: values.contentEn,
        attachments: values.attachments || [],
    };
    onSave(submissionData);
    onOpenChange(false);
  };

  const title = mode === "add" ? "Create New Template" : `Edit "${template?.name}"`;
  const description = "Use placeholders like {CustomerName} for personalization.";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
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
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Appointment Reminder (24hr)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="contentEn"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                        <Textarea className="min-h-[120px]" placeholder="Hi {CustomerName}, this is a reminder..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            
            <div>
                <FormLabel>Attachments (Optional)</FormLabel>
                <div className="p-4 border rounded-md space-y-4 mt-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                        <FormField
                            control={form.control}
                            name={`attachments.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Name</FormLabel>
                                    <Input {...field} placeholder="Attachment Name"/>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`attachments.${index}.url`}
                            render={({ field }) => (
                                <FormItem>
                                     <FormLabel className="sr-only">URL</FormLabel>
                                    <Input {...field} placeholder="https://..."/>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "", url: "" })}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Attachment
                </Button>
                </div>

            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Template</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
