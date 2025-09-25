
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
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { staff, serviceCategories, inventoryItems as allInventoryItems } from "@/lib/placeholder-data";
import { Select as ShadSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import type { ServiceRecipeItem } from "./ServicesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type InventoryItem = typeof allInventoryItems[0];

type Service = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  originalPrice: number | null;
  duration: number | null;
  image: string;
  category: "Service" | "Deal" | "Promotion";
  serviceCategory?: string;
  includedServices?: { value: string; label: string }[];
  artists?: { value: string; label: string }[];
  recipe?: ServiceRecipeItem[];
};

type ServiceFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "add" | "edit";
  category: Service["category"];
  service?: Service;
  onSave: (service: Service) => void;
  individualServices: Service[];
  inventoryItems: InventoryItem[];
  defaultTab?: "basic" | "recipe";
};

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description is too short." }),
  price: z.union([z.string().min(1, "Price/Value is required."), z.coerce.number().nonnegative("Price cannot be negative.")]),
  originalPrice: z.coerce.number().nonnegative("Price cannot be negative.").nullable(),
  image: z.string().url({ message: "Please enter a valid image URL." }),
  category: z.enum(["Service", "Deal", "Promotion"]),
  serviceCategory: z.string().optional(),
  duration: z.coerce.number().int("Duration must be a whole number.").nonnegative("Duration cannot be negative.").nullable(),
  includedServices: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
  artists: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
  recipe: z.array(z.object({
    itemId: z.string(),
    quantity: z.coerce.number().min(0.01, "Quantity must be positive."),
  })).optional(),
}).refine(data => {
    if (data.category === 'Deal' && data.originalPrice !== null && typeof data.price === 'number') {
        return data.price <= data.originalPrice;
    }
    return true;
}, {
    message: "Deal price cannot be higher than the original price.",
    path: ["price"],
});


export function ServiceFormDialog({
  isOpen,
  onOpenChange,
  mode,
  category,
  service,
  onSave,
  individualServices = [],
  inventoryItems = [],
  defaultTab = "basic",
}: ServiceFormDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: service?.id || undefined,
      name: service?.name || "",
      description: service?.description || "",
      price: service?.price || 0,
      originalPrice: service?.originalPrice || null,
      image: service?.image || "https://picsum.photos/seed/new-service/600/400",
      category: service?.category || category,
      serviceCategory: service?.serviceCategory || undefined,
      duration: service?.duration || null,
      includedServices: service?.includedServices || [],
      artists: service?.artists || [],
      recipe: service?.recipe || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "recipe",
  });

  const includedServices = form.watch("includedServices");

  const serviceOptions = useMemo(() => {
    return individualServices.map((s) => ({ value: s.id, label: `${s.name} ($${s.price})` }));
  }, [individualServices]);

  const artistOptions = useMemo(() => {
    return staff.map(s => ({ value: s.id, label: s.name }));
  }, []);

  const inventoryOptions = useMemo(() => {
      return inventoryItems.map(item => ({ value: item.id, label: item.name }));
  }, [inventoryItems]);

  useEffect(() => {
    if (category === 'Deal' && includedServices && includedServices.length > 0) {
      const newName = includedServices.map(s => s.label.split(' (')[0]).join(' + ');
      const newDescription = `A special package including: ${includedServices.map(s => s.label.split(' (')[0]).join(', ')}.`;
      const total = includedServices.reduce((acc, s) => {
        const service = individualServices.find(is => is.id === s.value);
        return acc + (Number(service?.price) || 0);
      }, 0);
      
      form.setValue('name', newName);
      form.setValue('description', newDescription);
      form.setValue('originalPrice', total);
    }
  }, [includedServices, category, form, individualServices]);


  useEffect(() => {
    if (isOpen) {
      form.reset({
        id: service?.id || undefined,
        name: service?.name || "",
        description: service?.description || "",
        price: service?.price || (category === "Promotion" ? "" : 0),
        originalPrice: service?.originalPrice || null,
        image: service?.image || `https://picsum.photos/seed/${Math.random()}/600/400`,
        category: service?.category || category,
        serviceCategory: service?.serviceCategory || undefined,
        duration: service?.duration || null,
        includedServices: service?.includedServices || [],
        artists: service?.artists || [],
        recipe: service?.recipe || [],
      });
    }
  }, [isOpen, service, category, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values as Service);
    onOpenChange(false);
  };

  const title = mode === "add" ? `Add New ${category}` : `Edit ${service?.name}`;
  const description =
    mode === "add"
      ? `Fill out the details to add a new ${category.toLowerCase()} to your menu.`
      : "Update the details for this item.";

  const priceLabel = category === 'Promotion' ? 'Discount Value (e.g., "20% Off")' : "Price ($)";
  const priceType = category === 'Promotion' ? 'text' : 'number';
  
  const showRecipeTab = category === 'Service';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue={defaultTab} className="mt-4">
                 <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="recipe" disabled={!showRecipeTab}>Recipe</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 py-4">
                    {category === 'Deal' ? (
                    <FormField
                        control={form.control}
                        name="includedServices"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Included Services</FormLabel>
                            <Select
                            isMulti
                            options={serviceOptions}
                            value={field.value}
                            onChange={field.onChange}
                            className="text-sm"
                            classNamePrefix="select"
                            />
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Signature Haircut" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            {category === 'Service' && (
                                <FormField
                                    control={form.control}
                                    name="serviceCategory"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <ShadSelect onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {serviceCategories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                        </ShadSelect>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    )}

                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describe the service..."
                            {...field}
                            disabled={category === 'Deal'}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{priceLabel}</FormLabel>
                            <FormControl>
                            <Input 
                                type={priceType} 
                                step={priceType === 'number' ? "0.01" : undefined} 
                                {...field}
                                onChange={e => field.onChange(priceType === 'number' ? e.target.valueAsNumber : e.target.value)}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {category === 'Deal' ? (
                        <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Original Price ($)</FormLabel>
                            <FormControl>
                            <Input 
                                type="number" 
                                step="0.01" 
                                {...field}
                                value={field.value ?? ""}
                                onChange={e => field.onChange(e.target.valueAsNumber)}
                                disabled
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    ) : category === 'Service' ? (
                        <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                            <Input 
                                type="number"
                                {...field}
                                value={field.value ?? ""}
                                onChange={e => field.onChange(e.target.valueAsNumber)}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    ) : null}
                    </div>

                    <FormField
                    control={form.control}
                    name="artists"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Assigned Artists</FormLabel>
                        <Select
                            isMulti
                            options={artistOptions}
                            value={field.value}
                            onChange={field.onChange}
                            className="text-sm"
                            classNamePrefix="select"
                        />
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://picsum.photos/..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </TabsContent>

                <TabsContent value="recipe" className="space-y-4 py-4">
                     <div className="space-y-4 rounded-md border p-4">
                        <h4 className="font-medium">Service Recipe</h4>
                        <p className="text-sm text-muted-foreground">
                            Define which inventory products are consumed when this service is performed.
                        </p>
                        <Separator />
                        {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr_100px_auto] items-end gap-2">
                            <FormField
                            control={form.control}
                            name={`recipe.${index}.itemId`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className={index !== 0 ? 'sr-only' : ''}>Product</FormLabel>
                                <ShadSelect onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {inventoryOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                        {option.label}
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
                            name={`recipe.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className={index !== 0 ? 'sr-only' : ''}>Quantity</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 0.5" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(index)}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                        <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ itemId: "", quantity: 1 })}
                        >
                        Add Product to Recipe
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>


            <DialogFooter className="pt-4">
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

    