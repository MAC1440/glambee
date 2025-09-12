
"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DataTable } from "@/components/ui/data-table";
import { services } from "@/lib/placeholder-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  originalPrice: number | null;
  duration: number | null;
  image: string;
  category: "Service" | "Deal" | "Promotion";
};

type ServiceSelectionProps = {
  onAddToCart: (service: Service) => void;
};

export function ServiceSelection({ onAddToCart }: ServiceSelectionProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <Badge variant={row.getValue("category") === 'Deal' ? 'secondary' : 'default'}>{row.getValue("category")}</Badge>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price");
        if (typeof price === 'number') {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(price);
        }
        return price;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button size="sm" onClick={() => onAddToCart(row.original)}>
          Add to Cart
        </Button>
      ),
    },
  ];

  const availableServices = services.filter(s => s.category !== 'Promotion');

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Select Services & Deals</CardTitle>
         <DebouncedInput
            value={globalFilter ?? ""}
            onValueChange={(value) => setGlobalFilter(String(value))}
            className="w-full"
            placeholder="Search services or deals..."
          />
      </CardHeader>
      <CardContent className="flex-grow p-0">
         <DataTable
            columns={columns}
            data={availableServices}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
         />
      </CardContent>
    </Card>
  );
}
