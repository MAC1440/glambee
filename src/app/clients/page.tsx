
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
import { Badge } from "@/components/ui/badge";
import { appointments } from "@/lib/placeholder-data";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Process appointments to build detailed client data
const clientsMap = new Map<
  string,
  {
    name: string;
    email: string;
    appointments: number;
    totalSpent: number;
    lastVisit: string;
    tags: string[];
  }
>();

appointments.forEach((apt) => {
  if (!clientsMap.has(apt.customer.email)) {
    clientsMap.set(apt.customer.email, {
      name: apt.customer.name,
      email: apt.customer.email,
      appointments: 0,
      totalSpent: 0,
      lastVisit: "1970-01-01",
      tags: [],
    });
  }
  const clientData = clientsMap.get(apt.customer.email)!;
  clientData.appointments++;
  clientData.totalSpent += apt.price;
  if (new Date(apt.date) > new Date(clientData.lastVisit)) {
    clientData.lastVisit = apt.date;
  }
});

const clients = Array.from(clientsMap.values()).map((client) => {
  const tags: string[] = [];
  if (client.appointments > 5) {
    tags.push("VIP");
  }
  if (client.appointments === 1) {
    tags.push("New");
  }
  if (client.totalSpent > 500) {
    tags.push("High Spender");
  }
  client.tags = tags;
  return client;
});


const getTagColor = (tag: string) => {
  switch (tag.toLowerCase()) {
    case "vip":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
    case "new":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    case "high spender":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
  }
};


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
                <TableHead>Tags</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Total Appointments</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
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
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {client.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn(getTagColor(tag))}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{client.lastVisit}</TableCell>
                  <TableCell>{client.appointments}</TableCell>
                  <TableCell className="text-right">
                    ${client.totalSpent.toFixed(2)}
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
