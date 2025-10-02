
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
};

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description is too short." }),
  price: z.coerce.number().positive("Price must be greater than zero."),
  originalPrice: z.coerce.number().optional().nullable(),
  category: z.string().min(1, "Category is required."),
  duration: z.coerce.number().int("Duration must be a whole number.").positive("Duration must be greater than zero."),
  includedServices: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
});


export function ServiceFormDialog({
  isOpen,
  onOpenChange,
  mode,
  service,
  onSave,
  saving = false,
}: ServiceFormDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: service?.id || undefined,
      name: service?.name || "",
      description: service?.description || "",
      price: typeof service?.price === "number" ? service.price : parseFloat(service?.price || "0"),
      originalPrice: service?.originalPrice || null,
      category: service?.category || "",
      duration: service?.duration || 0,
      includedServices: service?.includedServices || undefined,
    },
  });

  // Recipe functionality removed for now

  // Removed unused options for now

  // Fetch categories from Supabase
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Removed includedServices logic for now


  useEffect(() => {
    if (isOpen) {
      form.reset({
        id: service?.id || undefined,
        name: service?.name || "",
        description: service?.description || "",
        price: typeof service?.price === "number" ? service.price : parseFloat(service?.price || "0"),
        originalPrice: service?.originalPrice || null,
        category: service?.category || "",
        duration: service?.duration || 0,
        includedServices: service?.includedServices || undefined,
      });
    }
  }, [isOpen, service, form]);

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
                    <Input placeholder="e.g., Signature Haircut" {...field} disabled={saving} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Category</FormLabel>
                    <ShadSelect onValueChange={field.onChange} defaultValue={field.value} disabled={loadingCategories || saving}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.title}>{cat.title}</SelectItem>
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
        name="description"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
                <Textarea
                placeholder="Describe the service..."
                {...field}
                disabled={saving}
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
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                <Input 
                    type="number" 
                    step="0.01" 
                    {...field}
                    onChange={e => field.onChange(e.target.valueAsNumber)}
                    disabled={saving}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
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
                    onChange={e => field.onChange(e.target.valueAsNumber)}
                    disabled={saving}
                />
                </FormControl>
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
              <Button type="submit" disabled={saving}>
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

    