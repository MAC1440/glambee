
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCatalog } from "./ProductCatalog";
import { Requisitions } from "./Requisitions";
import { PurchaseOrders } from "./PurchaseOrders";
import { SupplierManagement } from "./SupplierManagement";

export function Procurement() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-4xl font-headline font-bold">Procurement</h1>
        <p className="text-muted-foreground mt-2">
          Manage your product catalog, requisitions, purchase orders, and suppliers.
        </p>
      </div>

      <Tabs defaultValue="catalog">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
          <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                Browse and manage all products in your inventory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductCatalog />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requisitions">
          <Card>
             <CardHeader>
              <CardTitle>Requisitions & Approvals</CardTitle>
              <CardDescription>
                Review and manage internal stock requests from your staff.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Requisitions />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pos">
          <Card>
             <CardHeader>
              <CardTitle>Purchase Orders (POs)</CardTitle>
              <CardDescription>
                Create, track, and manage purchase orders to your suppliers.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <PurchaseOrders />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="suppliers">
          <Card>
             <CardHeader>
              <CardTitle>Supplier & Vendor Management</CardTitle>
              <CardDescription>
                View and manage all your product suppliers.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <SupplierManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
