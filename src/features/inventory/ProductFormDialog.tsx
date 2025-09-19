
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { InventoryItem } from "./InventoryList";
import { inventoryCategories, suppliers } from "@/lib/placeholder-data";

type ProductFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "add" | "edit";
  product?: InventoryItem;
  onSave: (product: Omit<InventoryItem, 'id'>) => void;
};

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  sku: z.string().min(1, "SKU is required."),
  category: z.string({ required_error: "Please select a category." }),
  supplier: z.string({ required_error: "Please select a supplier." }),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  lowStockThreshold: z.coerce.number().min(0, "Threshold cannot be negative."),
  expiryDate: z.date().nullable(),
});

export function ProductFormDialog({
  isOpen,
  onOpenChange,
  mode,
  product,
  onSave,
}: ProductFormDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      sku: product?.sku || "",
      category: product?.category || undefined,
      supplier: product?.supplier || undefined,
      quantity: product?.quantity || 0,
      lowStockThreshold: product?.lowStockThreshold || 0,
      expiryDate: product?.expiryDate ? new Date(product.expiryDate) : null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: product?.name || "",
        sku: product?.sku || "",
        category: product?.category || undefined,
        supplier: product?.supplier || undefined,
        quantity: product?.quantity || 0,
        lowStockThreshold: product?.lowStockThreshold || 0,
        expiryDate: product?.expiryDate ? new Date(product.expiryDate) : null,
      });
    }
  }, [isOpen, product, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const submissionData = {
      ...values,
      expiryDate: values.expiryDate ? format(values.expiryDate, 'yyyy-MM-dd') : null,
    };
    onSave(submissionData);
    onOpenChange(false);
  };

  const title = mode === "add" ? `Add New Product` : `Edit ${product?.name}`;
  const description =
    mode === "add"
      ? "Fill out the details for the new inventory item."
      : "Update the product's details.";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., L'Oréal Shampoo" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., LO-SH-01" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {inventoryCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="supplier"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {suppliers.map((sup) => (
                            <SelectItem key={sup.id} value={sup.name}>{sup.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
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
                    name="lowStockThreshold"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Low Stock At</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date (Optional)</FormLabel>
                    <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value ? (
                            format(field.value, "PPP")
                            ) : (
                            <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
