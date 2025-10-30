"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DealWithSalon, DealFormData } from "@/types/deal";

// Helper: convert empty string to null for optional inputs
const emptyToNull = (value: unknown) => (value === "" ? null : value);

const formSchema = z.object({
  title: z.string()
    .min(2, { message: "Title must be at least 2 characters." })
    .max(100, { message: "Title must be less than 100 characters." })
    .refine((val) => val.trim().length > 0, {
      message: "Title cannot be only whitespace."
    })
    .refine((val) => !val.startsWith(' ') && !val.endsWith(' '), {
      message: "Title cannot start or end with spaces."
    }),
  price: z.preprocess(emptyToNull,
    z.number({ invalid_type_error: "Price must be a number." })
      .positive("Price must be greater than zero.")
      .max(999999.99, "Price must be less than $1,000,000.")
      .nullable()
  ),
  discounted_price: z.preprocess(emptyToNull,
    z.number({ invalid_type_error: "Discounted price must be a number." })
      .positive("Discounted price must be greater than zero.")
      .max(999999.99, "Discounted price must be less than $1,000,000.")
      .nullable()
  ),
  prices_may_vary: z.boolean().default(false),
  valid_from: z.preprocess(emptyToNull, z.string().nullable()),
  valid_till: z.preprocess(emptyToNull, z.string().nullable()),
  media_url: z.preprocess(
    emptyToNull,
    z
      .string()
      .url("Please enter a valid URL.")
      .nullable()
  )
    .refine((val) => {
      if (!val) return true;
      // Check if URL ends with common image extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      return imageExtensions.some(ext => val.toLowerCase().endsWith(ext));
    }, {
      message: "Please enter a valid image URL (jpg, jpeg, png, gif, webp, svg)."
    }),
  dealpopup: z.preprocess(emptyToNull, z.boolean().default(false)),
  popup_title: z.preprocess(emptyToNull, z.string().nullable()),
  popup_color: z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Please enter a valid hex color code (e.g., #FF0000).")
      .nullable()
  ),
  popup_template: z.preprocess(emptyToNull, z.string().nullable()),
}).superRefine((data, ctx) => {
  // Popup: title required when enabled
  if (data.dealpopup && (!data.popup_title || data.popup_title.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Popup title is required when popup is enabled.", path: ["popup_title"] });
  }

  // Pricing rules
  if (!data.prices_may_vary) {
    if (data.price == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Price is required when 'Prices May Vary' is disabled.", path: ["price"] });
    }
  }
  if (data.discounted_price != null && data.price == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Provide original price when discounted price is set.", path: ["discounted_price"] });
  }
  if (data.price != null && data.discounted_price != null && data.discounted_price >= data.price) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Discounted price must be less than original price.", path: ["discounted_price"] });
  }

  // Date rules
  if ((data.valid_from && !data.valid_till) || (!data.valid_from && data.valid_till)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Both valid from and valid till are required when setting a validity period.", path: data.valid_from ? ["valid_till"] : ["valid_from"] });
  }
  if (data.valid_from && data.valid_till) {
    const fromDate = new Date(data.valid_from);
    const tillDate = new Date(data.valid_till);
    if (!(fromDate < tillDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid from date must be before valid till date.", path: ["valid_till"] });
    }
    const now = new Date();
    if (!(tillDate > now)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid till date must be in the future.", path: ["valid_till"] });
    }
  }
});

type ServiceFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "add" | "edit";
  deal?: DealWithSalon | null;
  onSave: (deal: DealFormData) => void;
  saving?: boolean;
};

export function DealFormDialog({
  isOpen,
  onOpenChange,
  mode,
  deal,
  onSave,
  saving = false,
}: ServiceFormDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      title: deal?.title || "",
      price: deal?.price || null,
      discounted_price: deal?.discounted_price || null,
      prices_may_vary: deal?.prices_may_vary || false,
      valid_from: deal?.valid_from || null,
      valid_till: deal?.valid_till || null,
      media_url: deal?.media_url || "",
      dealpopup: deal?.dealpopup || false,
      popup_title: deal?.popup_title || "",
      popup_color: deal?.popup_color || "",
      popup_template: deal?.popup_template || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: deal?.title || "",
        price: deal?.price || null,
        discounted_price: deal?.discounted_price || null,
        prices_may_vary: deal?.prices_may_vary || false,
        valid_from: deal?.valid_from || null,
        valid_till: deal?.valid_till || null,
        media_url: deal?.media_url || "",
        dealpopup: deal?.dealpopup || false,
        popup_title: deal?.popup_title || "",
        popup_color: deal?.popup_color || "",
        popup_template: deal?.popup_template || "",
      });
    }
  }, [isOpen, deal, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values as DealFormData);
  };

  const title = mode === "add" ? "Add New Deal" : `Edit ${deal?.title}`;
  const description =
    mode === "add"
      ? "Fill out the details to add a new deal to your salon."
      : "Update the details for this deal.";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summer Hair Care Package" {...field} disabled={saving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Enter original price"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              field.onChange(null);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue) && numValue >= 0) {
                                field.onChange(numValue);
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            // Prevent typing minus sign
                            if (e.key === '-') {
                              e.preventDefault();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const paste = (e.clipboardData || (window as any).clipboardData).getData('text');
                            const sanitized = paste.replace(/-/g, '');
                            const numValue = parseFloat(sanitized);
                            if (sanitized === '' || (!isNaN(numValue) && numValue >= 0)) {
                              field.onChange(sanitized === '' ? null : numValue);
                            }
                          }}
                          disabled={saving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discounted_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discounted Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Enter discounted price"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              field.onChange(null);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue) && numValue >= 0) {
                                field.onChange(numValue);
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            // Prevent typing minus sign
                            if (e.key === '-') {
                              e.preventDefault();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const paste = (e.clipboardData || (window as any).clipboardData).getData('text');
                            const sanitized = paste.replace(/-/g, '');
                            const numValue = parseFloat(sanitized);
                            if (sanitized === '' || (!isNaN(numValue) && numValue >= 0)) {
                              field.onChange(sanitized === '' ? null : numValue);
                            }
                          }}
                          disabled={saving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                <FormField
                control={form.control}
                name="prices_may_vary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            // Clear prices when enabling price variability
                            form.setValue("price", null, { shouldValidate: true, shouldDirty: true });
                            form.setValue("discounted_price", null, { shouldValidate: true, shouldDirty: true });
                          }
                        }}
                        disabled={saving}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Prices May Vary</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Enable this if prices may vary based on location or other factors.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valid_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid From</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value ? field.value.slice(0, 16) : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? value : null);
                          }}
                          min={new Date().toISOString().slice(0, 16)}
                          disabled={saving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valid_till"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Till</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value ? field.value.slice(0, 16) : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? value : null);
                          }}
                          min={new Date().toISOString().slice(0, 16)}
                          disabled={saving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="media_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        {...field}
                        value={field.value || ''}
                        disabled={saving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dealpopup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={saving}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable Popup</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Show this deal as a popup to customers.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("dealpopup") && (
                <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                  <h4 className="text-sm font-medium">Popup Settings</h4>
                  
                  <FormField
                    control={form.control}
                    name="popup_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Popup Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Special Offer!" 
                            {...field} 
                            value={field.value || ''}
                            disabled={saving} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="popup_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Popup Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                {...field}
                                value={field.value || '#000000'}
                                disabled={saving}
                                className="w-16 h-10 p-1"
                              />
                              <Input
                                type="text"
                                placeholder="#000000"
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^#[0-9A-Fa-f]{6}$/.test(value)) {
                                    field.onChange(value || null);
                                  }
                                }}
                                disabled={saving}
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="popup_template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Popup Template</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="template1" 
                              {...field} 
                              value={field.value || ''}
                              disabled={saving} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !form.formState.isValid}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === "add" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  mode === "add" ? "Create Deal" : "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
