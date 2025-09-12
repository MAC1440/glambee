
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Mail, Phone, Edit, CalendarPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Customer = {
  id: string;
  phone: string;
  name: string;
  email: string;
};

export function ClientDetail({ client }: { client: Customer | undefined }) {
  if (!client) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Not Found</CardTitle>
          <CardDescription>
            The client you are looking for does not exist.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const clientAppointments = appointments.filter(
    (apt) => apt.customer.email === client.email
  );

  const totalSpent = clientAppointments.reduce(
    (sum, apt) => sum + apt.price,
    0
  );

  const tags: string[] = [];
  if (clientAppointments.length > 5) {
    tags.push("VIP");
  }
  if (clientAppointments.length > 0 && clientAppointments.length <= 2) {
    tags.push("New");
  }
  if (totalSpent > 500) {
    tags.push("High Spender");
  }

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

  return (
    <div className="flex flex-col gap-8">
       <div className="w-full flex justify-start">
        <Button variant="ghost" asChild>
          <Link href="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Client List
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={`https://picsum.photos/seed/${client.name}/150`}
                  alt={client.name}
                />
                <AvatarFallback className="text-3xl">{client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{client.name}</CardTitle>
              <div className="flex gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn("text-sm", getTagColor(tag))}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
               <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{client.email}</span>
               </div>
                <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{client.phone}</span>
                </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle>Client Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
                <Button>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Book New Appointment
                </Button>
                <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Client Profile
                </Button>
            </CardContent>
           </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>
                A record of {client.name}'s past appointments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientAppointments.length > 0 ? (
                    clientAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>{apt.date}</TableCell>
                        <TableCell className="font-medium">{apt.service}</TableCell>
                        <TableCell>{apt.staff}</TableCell>
                        <TableCell className="text-right">
                          ${apt.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No appointment history for this client.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

