
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

type Service = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  originalPrice: number | null;
  duration: number | null;
  image: string;
  category: "Service" | "Deal" | "Discount";
};

type ServiceFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "add" | "edit";
  category: Service["category"];
  service?: Service;
  onSave: (service: Service) => void;
};

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description is too short." }),
  price: z.union([z.string(), z.number()]),
  originalPrice: z.union([z.number(), z.null()]),
  image: z.string().url({ message: "Please enter a valid image URL." }),
  category: z.enum(["Service", "Deal", "Discount"]),
  duration: z.union([z.number(), z.null()]),
});

export function ServiceFormDialog({
  isOpen,
  onOpenChange,
  mode,
  category,
  service,
  onSave,
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
      duration: service?.duration || null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        id: service?.id || undefined,
        name: service?.name || "",
        description: service?.description || "",
        price: service?.price || (category === "Discount" ? "" : 0),
        originalPrice: service?.originalPrice || null,
        image:
          service?.image || "https://picsum.photos/seed/new-service/600/400",
        category: service?.category || category,
        duration: service?.duration || null,
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

  const priceLabel = category === 'Discount' ? 'Discount Value (e.g., "20% Off")' : "Price ($)";
  const priceType = category === 'Discount' ? 'text' : 'number';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Signature Haircut" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the service..."
                      {...field}
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
                        step="0.01" 
                        {...field}
                        onChange={e => field.onChange(priceType === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {category === 'Deal' && (
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
                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
              )}
            </div>

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
