
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { appointments } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { PlusCircle, FileText } from "lucide-react";

const invoices = appointments.map((apt, index) => {
  const statuses = ["Paid", "Pending", "Overdue"];
  const status = statuses[index % statuses.length];
  return {
    id: `INV-${String(index + 1).padStart(3, "0")}`,
    appointmentId: apt.id,
    customer: apt.customer,
    date: apt.date,
    amount: apt.price,
    status: status as "Paid" | "Pending" | "Overdue",
  };
});

export function Billing() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">Billing</h1>
          <p className="text-muted-foreground mt-2">
            Manage invoices and payments.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={`https://picsum.photos/seed/${invoice.customer.name}/100`}
                          alt="Avatar"
                        />
                        <AvatarFallback>
                          {invoice.customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {invoice.customer.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.customer.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn({
                        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300":
                          invoice.status === "Paid",
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300":
                          invoice.status === "Pending",
                        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300":
                          invoice.status === "Overdue",
                      })}
                      variant="outline"
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${invoice.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
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
