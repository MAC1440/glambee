
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { inventoryItems, suppliers } from "@/lib/placeholder-data";
import { ArrowLeft, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const grnItemSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  cost: z.coerce.number().min(0, "Cost cannot be negative."),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const grnSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required."),
  notes: z.string().optional(),
  items: z.array(grnItemSchema).min(1, "At least one item is required."),
});

export function GoodsReceivedNote() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof grnSchema>>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      supplierId: "",
      notes: "",
      items: [{ productId: "", quantity: 1, cost: 0, imageUrl: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const productOptions = useMemo(() => {
    return inventoryItems.map((item) => ({
      value: item.id,
      label: `${item.name} (${item.sku})`,
    }));
  }, []);

  const onSubmit = (values: z.infer<typeof grnSchema>) => {
    console.log("GRN Submitted:", values);
    toast({
      title: "GRN Created",
      description: "Stock levels have been updated successfully.",
    });
    router.push("/inventory");
  };

  const totalCost = useMemo(() => {
    const items = form.watch("items");
    return items.reduce((total, item) => total + item.quantity * item.cost, 0);
  }, [form.watch("items")]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/inventory">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-headline">
                Goods Received Note (GRN)
              </h1>
              <p className="text-muted-foreground">
                Record incoming stock from your suppliers.
              </p>
            </div>
          </div>
          <Button type="submit">Receive Stock</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>GRN Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <Label>Supplier</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <Label>Notes (Optional)</Label>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Reference PO #12345"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Received Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Product</TableHead>
                    <TableHead>Image URL</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const item = form.watch(`items.${index}`);
                    const lineTotal = (item.quantity || 0) * (item.cost || 0);

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                           <FormField
                              control={form.control}
                              name={`items.${index}.productId`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a product" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {productOptions.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                          {p.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.imageUrl`}
                            render={({ field: imageUrlField }) => (
                              <Input
                                type="text"
                                placeholder="https://..."
                                {...imageUrlField}
                                className="w-32"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field: qtyField }) => (
                              <Input
                                type="number"
                                {...qtyField}
                                className="w-24"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.cost`}
                            render={({ field: costField }) => (
                              <Input
                                type="number"
                                step="0.01"
                                {...costField}
                                className="w-24"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-right">
                          ${lineTotal.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ productId: "", quantity: 1, cost: 0, imageUrl: "" })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardContent>
            <CardFooter className="justify-end bg-muted/50 p-4">
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">Grand Total:</span>
                    <span className="font-bold text-2xl">${totalCost.toFixed(2)}</span>
                </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
