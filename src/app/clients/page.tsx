import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { PlusCircle } from "lucide-react";

// Get unique clients from appointments
const clients = Array.from(new Set(appointments.map((a) => a.customer.email)))
  .map((email) => {
    return appointments.find((a) => a.customer.email === email)?.customer;
  })
  .filter((c) => c) as { name: string; email: string }[];

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">Clients</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your clients.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Appointments</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const clientAppointments = appointments.filter(
                  (apt) => apt.customer.email === client.email
                );
                const totalSpent = clientAppointments.reduce(
                  (sum, apt) => sum + apt.price,
                  0
                );
                return (
                  <TableRow key={client.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={`https://picsum.photos/seed/${client.name}/100`}
                            alt="Avatar"
                          />
                          <AvatarFallback>
                            {client.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{client.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{clientAppointments.length}</TableCell>
                    <TableCell className="text-right">
                      ${totalSpent.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
