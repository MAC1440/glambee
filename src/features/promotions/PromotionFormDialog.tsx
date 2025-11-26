"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DiscountWithSalon } from "@/lib/api/promotionsApi";

const formSchema = z.object({
  service_discount: z.coerce.number()
    .int("Service discount must be a whole number.")
    .min(0, "Service discount must be 0 or greater.")
    .max(100, "Service discount cannot exceed 100%.")
    .refine((val) => !isNaN(val), {
      message: "Service discount must be a valid number."
    }),
  deal_discount: z.coerce.number()
    .int("Deal discount must be a whole number.")
    .min(0, "Deal discount must be 0 or greater.")
    .max(100, "Deal discount cannot exceed 100%.")
    .refine((val) => !isNaN(val), {
      message: "Deal discount must be a valid number."
    }),
  package_discount: z.coerce.number()
    .int("Package discount must be a whole number.")
    .min(0, "Package discount must be 0 or greater.")
    .max(100, "Package discount cannot exceed 100%.")
    .refine((val) => !isNaN(val), {
      message: "Package discount must be a valid number."
    }),
});

type PromotionFormData = z.infer<typeof formSchema>;

interface PromotionFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  promotion?: DiscountWithSalon;
  onSave: (data: PromotionFormData) => void;
}

export function PromotionFormDialog({
  isOpen,
  onOpenChange,
  mode,
  promotion,
  onSave,
}: PromotionFormDialogProps) {
  const form = useForm<PromotionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_discount: promotion?.service_discount || 0,
      deal_discount: promotion?.deal_discount || 0,
      package_discount: promotion?.package_discount || 0,
    },
  });

  // Reset form when promotion changes or dialog opens
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        service_discount: promotion?.service_discount || 0,
        deal_discount: promotion?.deal_discount || 0,
        package_discount: promotion?.package_discount || 0,
      });
    }
  }, [isOpen, promotion, form]);

  const onSubmit = (data: PromotionFormData) => {
    onSave(data);
  };

  // Watch all form values to check if any field is empty (0 or undefined)
  const serviceDiscount = form.watch("service_discount");
  const dealDiscount = form.watch("deal_discount");
  const packageDiscount = form.watch("package_discount");

  // Check if all fields have values greater than 0
  const isFormValid = React.useMemo(() => {
    return (
      serviceDiscount > 0 &&
      dealDiscount > 0 &&
      packageDiscount > 0
    );
  }, [serviceDiscount, dealDiscount, packageDiscount]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof PromotionFormData,
    onChange: (value: number) => void
  ) => {
    const value = e.target.value;
    
    // Allow empty string for clearing
    if (value === "") {
      onChange(0);
      return;
    }

    // Remove any non-numeric characters (no decimal points allowed)
    const sanitized = value.replace(/[^0-9]/g, "");
    
    if (sanitized === "") {
      onChange(0);
      return;
    }

    const numValue = parseInt(sanitized, 10);
    
    // Prevent negative values and ensure it's a valid integer
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onChange(numValue);
    } else if (numValue > 100) {
      onChange(100);
    } else {
      onChange(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent typing minus sign, decimal point, and scientific notation
    if (e.key === "-" || e.key === "." || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    fieldName: keyof PromotionFormData,
    onChange: (value: number) => void
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    
    // Remove any non-numeric characters (no decimal points allowed)
    const sanitized = pastedText.replace(/[^0-9]/g, "");
    
    if (sanitized) {
      const numValue = parseInt(sanitized, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        onChange(Math.min(numValue, 100)); // Cap at 100%
      } else {
        onChange(0);
      }
    } else {
      onChange(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Discount" : "Edit Discount"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Set discount percentages for services, deals, and packages."
              : "Update discount percentages for services, deals, and packages."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="service_discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Discount (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="1"
                      value={field.value || ""}
                      onChange={(e) => handleInputChange(e, "service_discount", field.onChange)}
                      onKeyDown={handleKeyDown}
                      onPaste={(e) => handlePaste(e, "service_discount", field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deal_discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Discount (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="1"
                      value={field.value || ""}
                      onChange={(e) => handleInputChange(e, "deal_discount", field.onChange)}
                      onKeyDown={handleKeyDown}
                      onPaste={(e) => handlePaste(e, "deal_discount", field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="package_discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Discount (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="1"
                      value={field.value || ""}
                      onChange={(e) => handleInputChange(e, "package_discount", field.onChange)}
                      onKeyDown={handleKeyDown}
                      onPaste={(e) => handlePaste(e, "package_discount", field.onChange)}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={mode === "add" && !isFormValid}>
                {mode === "add" ? "Create" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

