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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DealWithSalon, DealFormData } from "@/types/deal";
import { uploadImageToStorage } from "@/lib/utils/image-upload";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { DateTimePicker } from "@/components/ui/datetime-picker";


// Parses a "YYYY-MM-DDTHH:mm" string as LOCAL time (not UTC)
function parseLocalDateTime(dateTimeString: string): Date | null {
  if (!dateTimeString) return null;
  const [datePart, timePart] = dateTimeString.split('T');
  if (!datePart || !timePart) return null;
  
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  
  // Months are 0-indexed in JS Date
  return new Date(year, month - 1, day, hours, minutes);
}

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
    z.string().nullable()
  ),
  dealpopup: z.preprocess(emptyToNull, z.boolean().default(false)),
  popup_title: z.preprocess(emptyToNull, z.string().nullable()),
      popup_color: z.preprocess(
    (val) => {
      if (!val || val === "") return null;
      const validColors = ["#FFCCCC", "#CCFFCC", "#CCE5FF", "#FFE5CC", "#FFCCE5"];
      return validColors.includes(val as string) ? val : null;
    },
    z.enum(["#FFCCCC", "#CCFFCC", "#CCE5FF", "#FFE5CC", "#FFCCE5"], {
      errorMap: () => ({ message: "Please select a valid popup color." })
    }).nullable()
  ),
  popup_template: z.preprocess(
    (val) => {
      if (!val || val === "") return null;
      const validTemplates = ["Bell Icon", "Coupon"];
      return validTemplates.includes(val as string) ? val : null;
    },
    z.enum(["Bell Icon", "Coupon"], {
      errorMap: () => ({ message: "Please select a popup template." })
    }).nullable()
  ),
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
  isPopUpEnabledInAnyDeal: boolean;
};

export function DealFormDialog({
  isOpen,
  onOpenChange,
  mode,
  deal,
  onSave,
  saving = false,
  isPopUpEnabledInAnyDeal,
}: ServiceFormDialogProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      popup_color: (deal?.popup_color && ["#FFCCCC", "#CCFFCC", "#CCE5FF", "#FFE5CC", "#FFCCE5"].includes(deal.popup_color)) 
        ? (deal.popup_color as "#FFCCCC" | "#CCFFCC" | "#CCE5FF" | "#FFE5CC" | "#FFCCE5")
        : null,
      popup_template: (deal?.popup_template && ["Bell Icon", "Coupon"].includes(deal.popup_template))
        ? (deal.popup_template as "Bell Icon" | "Coupon")
        : null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      const validColors = ["#FFCCCC", "#CCFFCC", "#CCE5FF", "#FFE5CC", "#FFCCE5"] as const;
      const validTemplates = ["Bell Icon", "Coupon"] as const;
      
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
        popup_color: (deal?.popup_color && validColors.includes(deal.popup_color as any)) 
          ? (deal.popup_color as typeof validColors[number])
          : null,
        popup_template: (deal?.popup_template && validTemplates.includes(deal.popup_template as any))
          ? (deal.popup_template as typeof validTemplates[number])
          : null,
      });
      // Reset image state
      setImageFile(null);
      setImagePreview(deal?.media_url || null);
    }
  }, [isOpen, deal, form]);

  const priceVaryCheck = form.watch('prices_may_vary')

  useEffect(() => {
    if(!priceVaryCheck) {
      form.setValue("discounted_price", null, { shouldValidate: true, shouldDirty: true });
      form.setValue("price", null, { shouldValidate: true, shouldDirty: true });
    }
  }, [priceVaryCheck])
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Image size must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue("media_url", null);
    // Reset file input
    const fileInput = document.getElementById("deal-image-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // If a new image file is selected, upload it first
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadedUrl = await uploadImageToStorage(imageFile, "salons-media", "images");
          values.media_url = uploadedUrl;
        } catch (error) {
          toast({
            title: "Image upload failed",
            description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      } else if (!imagePreview && !values.media_url) {
        // If no image file and no existing URL, set to null
        values.media_url = null;
      }
      // If imagePreview exists but no new file, keep existing media_url (already in values)

      onSave(values as DealFormData);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving the deal.",
        variant: "destructive",
      });
    }
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
                          disabled={saving || priceVaryCheck}
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
                          disabled={saving || priceVaryCheck}
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
                  render={({ field }) => {
                    const dateValue = field.value ? parseLocalDateTime(field.value) : null;
                    return (
                      <FormItem>
                        <FormLabel>Valid From</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            value={dateValue}
                            onChange={(date) => {
                              if (date) {
                                // Format as local datetime string (YYYY-MM-DDTHH:mm) to preserve local time
                                // This avoids timezone conversion issues with toISOString()
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const hours = String(date.getHours()).padStart(2, '0');
                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                field.onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
                              } else {
                                field.onChange(null);
                              }
                            }}
                            min={new Date()}
                            disabled={saving}
                            placeholder="Select date and time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="valid_till"
                  render={({ field }) => {
                    const dateValue = field.value ? parseLocalDateTime(field.value) : null;
                    return (
                      <FormItem>
                        <FormLabel>Valid Till</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            value={dateValue}
                            onChange={(date) => {
                              if (date) {
                                // Format as local datetime string (YYYY-MM-DDTHH:mm) to preserve local time
                                // This avoids timezone conversion issues with toISOString()
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const hours = String(date.getHours()).padStart(2, '0');
                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                field.onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
                              } else {
                                field.onChange(null);
                              }
                            }}
                            min={new Date()}
                            disabled={saving}
                            placeholder="Select date and time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <FormField
                control={form.control}
                name="media_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {imagePreview ? (
                          <div className="relative w-full">
                            <div className="relative border rounded-lg overflow-hidden bg-muted">
                              <img
                                src={imagePreview}
                                alt="Deal preview"
                                className="w-full h-48 object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={handleRemoveImage}
                                disabled={saving || uploadingImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {imageFile && (
                              <p className="text-sm text-muted-foreground mt-2">
                                New image selected: {imageFile.name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="deal-image-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg
                                  className="w-8 h-8 mb-2 text-muted-foreground"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 20 16"
                                >
                                  <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021c.255.1.506.214.74.33a4.5 4.5 0 0 1 1.67 2.17 4.5 4.5 0 0 1 1.67-2.17c.234-.116.485-.23.74-.33a5.5 5.5 0 0 0 10.793 0A5.5 5.5 0 0 0 13 2H3a3 3 0 0 0 0 6h3v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8Z"
                                  />
                                </svg>
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, GIF, WEBP (MAX. 5MB)
                                </p>
                              </div>
                              <input
                                id="deal-image-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={saving || uploadingImage}
                              />
                            </label>
                          </div>
                        )}
                        {uploadingImage && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            Uploading image...
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Upload an image to display with this deal. Supported formats: JPG, PNG, GIF, WEBP (max 5MB).
                    </p>
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
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          // Clear popup fields when checkbox is unchecked
                          if (!checked) {
                            form.setValue("popup_title", null, { shouldValidate: true, shouldDirty: true });
                            form.setValue("popup_color", null, { shouldValidate: true, shouldDirty: true });
                            form.setValue("popup_template", null, { shouldValidate: true, shouldDirty: true });
                          }
                        }}
                        disabled={saving || (!form.formState.defaultValues?.dealpopup && isPopUpEnabledInAnyDeal)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable Popup {(!form.formState.defaultValues?.dealpopup && isPopUpEnabledInAnyDeal) ? <span className="text-red-500">(Can't enable popup for multiple deals)</span> : ""}</FormLabel>
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
                      name="popup_template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Popup Template</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={saving}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Bell Icon">Bell Icon</SelectItem>
                              <SelectItem value="Coupon">Coupon</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="popup_color"
                      render={({ field }) => {
                        const colorOptions = [
                          { value: "#FFCCCC", label: "Light Red" },
                          { value: "#CCFFCC", label: "Light Green" },
                          { value: "#CCE5FF", label: "Light Blue" },
                          { value: "#FFE5CC", label: "Light Orange" },
                          { value: "#FFCCE5", label: "Light Pink" },
                        ];
                        
                        return (
                          <FormItem>
                            <FormLabel>Popup Color</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                              disabled={saving}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select color">
                                    {field.value ? (
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded border border-gray-300"
                                          style={{ backgroundColor: field.value }}
                                        />
                                        <span>
                                          {colorOptions.find(opt => opt.value === field.value)?.label || field.value}
                                        </span>
                                      </div>
                                    ) : (
                                      "Select color"
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {colorOptions.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded border border-gray-300"
                                        style={{ backgroundColor: color.value }}
                                      />
                                      <span>{color.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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
              <Button type="submit" disabled={saving || uploadingImage || !form.formState.isValid}>
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
