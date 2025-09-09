
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { products } from "@/lib/inventory-data";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const getStockColor = (stock: number) => {
    if (stock < 10) return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
    if (stock < 50) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
  };
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your product stock.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.sku}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-center">
                     <Badge
                      className={cn(getStockColor(product.stock))}
                      variant="outline"
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
