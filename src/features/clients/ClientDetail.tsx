
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
import { appointments, mockCustomers } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { Mail, Phone, Edit, MessageSquare, CalendarPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Link from "next/link";

// Simplified Customer type to match placeholder data
type Customer = {
  id: string;
  phone: string;
  name: string;
  email: string;
};

export function ClientDetail({ client }: { client: Customer | undefined }) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");

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

  const handleSendMessage = () => {
    console.log("Sending message:", message);
    toast({
      title: "Message Sent!",
      description: `Your message has been sent to ${client.name}.`,
    });
    setMessage("");
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={`https://picsum.photos/seed/${client.name}/100`}
              alt={client.name}
            />
            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-headline font-bold">{client.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{client.phone}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(getTagColor(tag))}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <Button asChild>
            <Link href={`/appointments/book/${encodeURIComponent(client.email)}`}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{clientAppointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">${totalSpent.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {clientAppointments.length > 0 ? [...clientAppointments].sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0].date : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

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
                <TableHead>Time</TableHead>
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
                    <TableCell>{apt.time}</TableCell>
                    <TableCell className="font-medium">{apt.service}</TableCell>
                    <TableCell>{apt.staff}</TableCell>
                    <TableCell className="text-right">
                      ${apt.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No appointment history for this client.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
