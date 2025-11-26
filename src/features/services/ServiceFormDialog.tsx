
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useEffect, useState } from "react";
import { fetchCategories, type Category } from "@/lib/api/categoriesApi";
import { Select as ShadSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Service } from "@/types/service";

// Removed unused InventoryItem type

type ServiceFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "add" | "edit";
  service?: Service;
  onSave: (service: Service) => void;
  saving?: boolean;
  categories: Category[];
  loadingCategories?: boolean;
};

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(2, "Name must be at least 2 characters." )
    .max(50, "Name must be less than 50 characters." )
    .refine((val) => val.trim().length > 0, {
      message: "Name cannot be only whitespace."
    })
    .refine((val) => !val.startsWith(' ') && !val.endsWith(' '), {
      message: "Name cannot start or end with spaces."
    }),
  price: z.coerce.number().int().max(999999, "Starting from cannot exceed $999,999.").positive("Value must be greater than zero."),
  time: z.string()
    .min(1, "Duration is required.")
    .refine((val) => {
      const numValue = parseFloat(val);
      return !isNaN(numValue) && numValue > 0;
    }, {
      message: "Duration must be a positive number."
    }),
  category_id: z.string().min(1, "Category is required."),
  gender: z.string().min(1, "Gender is required."),
  has_range: z.boolean().optional().default(false),
  starting_from: z.coerce.number().int().max(999999, "Starting from cannot exceed $999,999.").positive("Starting from must be greater than zero.").optional().nullable(),
}).refine((data) => {
  // If has_range is true, starting_from must be provided
  if (data.has_range && (!data.starting_from || data.starting_from <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Starting from is required when price range is enabled.",
  path: ["starting_from"],
});


export function ServiceFormDialog({
  isOpen,
  onOpenChange,
  mode,
  service,
  onSave,
  saving = false,
  categories,
  loadingCategories = false,
}: ServiceFormDialogProps) {
  // const [categories, setCategories] = useState<Category[]>([]);
  // const [loadingCategories, setLoadingCategories] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: service?.id,
      name: service?.name || "",
      price: service?.price || 0,
      time: service?.time,
      category_id: service?.category_id || "",
      gender: service?.gender || "Both",
      has_range: service?.has_range || false,
      starting_from: service?.starting_from || null,
    },
  });

  // Fetch Simple price for validating starting from field
  const servicePrice = form.watch('price')
  // Recipe functionality removed for now

  // Removed unused options for now

  // Fetch categories from Supabase
  // useEffect(() => {
  //   const loadCategories = async () => {
  //     setLoadingCategories(true);
  //     try {
  //       const fetchedCategories = await fetchCategories();
  //       setCategories(fetchedCategories);
  //     } catch (error) {
  //       console.error('Failed to load categories:', error);
  //     } finally {
  //       setLoadingCategories(false);
  //     }
  //   };

  //   if (isOpen) {
  //     loadCategories();
  //   }
  // }, [isOpen]);

  // Removed includedServices logic for now


  useEffect(() => {
    if (isOpen) {
      form.reset({
        id: service?.id || undefined,
        name: service?.name || "",
        price: service?.price || 0,
        time: service?.time,
        category_id: service?.category_id || "",
        gender: service?.gender || "Both",
        has_range: service?.has_range || false,
        starting_from: service?.starting_from || null,
      });
    }
  }, [isOpen, service, form]);

  const hasRange = form.watch("has_range");
  const selectedCategoryId = form.watch("category_id");
  const selectedCategory = categories?.find(cat => cat.id === selectedCategoryId);
  const isConsultation = selectedCategory?.name?.toLowerCase() === "consultation";

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values as Service);
    onOpenChange(false);
  };

  const title = mode === "add" ? "Add New Service" : `Edit ${service?.name}`;
  const description =
    mode === "add"
      ? "Fill out the details to add a new service to your menu."
      : "Update the details for this service.";

  const basicInfoFields = (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Signature Haircut" 
                  {...field} 
                  disabled={saving} 
                  onChange={(e) => {
                    const value = e.target.value;
                    // Always call field.onChange to update form state
                    // Truncate to 50 characters if exceeded
                    field.onChange(value.length > 50 ? value.slice(0, 50) : value);
                  }} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Type minutes here"
                  type="number"
                  min="0"
                  {...field}
                  disabled={saving}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string, but strip minus sign and negative values
                    if (value === '') {
                      field.onChange('');
                    } else {
                      const numValue = parseFloat(value.replace(/-/g, ''));
                      if (!isNaN(numValue) && numValue > 0) {
                        field.onChange(value.replace(/-/g, ''));
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
                    if (sanitized === '' || (!isNaN(parseFloat(sanitized)) && parseFloat(sanitized) >= 0)) {
                      field.onChange(sanitized);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="has_range"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  // Clear starting_from when checkbox is unchecked
                  if (!checked) {
                    form.setValue("starting_from", null);
                  }
                }}
                disabled={saving}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Has Range <span className="text-muted-foreground"><small>(Enable this if the service has a range.)</small></span></FormLabel>
              {/* <p className="text-sm text-muted-foreground">
                        Enable this if the service has a price range.
                    </p> */}
            </div>
          </FormItem>
        )}
      />

      {hasRange && (
        <FormField
          control={form.control}
          name="starting_from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starting From ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Enter minimum value"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      field.onChange(null);
                    } else {
                      const numValue = parseFloat(value.replace(/-/g, ''));
                      if (!isNaN(numValue) && numValue >= 0 && numValue < servicePrice) {
                        field.onChange(numValue);
                      } else {
                        field.onChange(null);
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
                    if (sanitized === '' || (!isNaN(parseFloat(sanitized)) && parseFloat(sanitized) >= 0)) {
                      field.onChange(parseFloat(sanitized));
                    } else {
                      field.onChange(null);
                    }
                  }}
                  disabled={saving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isConsultation ? "Consultation Fee ($)" : "Price ($)"}</FormLabel>
            <FormControl>
              <Input
                type="number"
                // step="0.01" 
                min="0"
                {...field}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    field.onChange('');
                  } else {
                    const numValue = parseFloat(value.replace(/-/g, ''));
                    if (!isNaN(numValue) && numValue >= 0) {
                      field.onChange(value.replace(/-/g, ''));
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
                  if (sanitized === '' || (!isNaN(parseFloat(sanitized)) && parseFloat(sanitized) >= 0)) {
                    field.onChange(sanitized);
                  }
                }}
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
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <ShadSelect onValueChange={field.onChange} defaultValue={field.value} disabled={saving}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>
                      Loading categories...
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </ShadSelect>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <ShadSelect onValueChange={field.onChange} defaultValue={field.value} disabled={saving}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Women">Women</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </ShadSelect>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className="mt-4">{basicInfoFields}</div>


            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !form.formState.isDirty}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === "add" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  mode === "add" ? "Create Service" : "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

