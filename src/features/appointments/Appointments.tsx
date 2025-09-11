
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, CalendarPlus } from "lucide-react";
import { appointments } from "@/lib/placeholder-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const mockCustomers = [
  {
    phone: "111-222-3333",
    name: "Sophia Davis",
    email: "sophia@example.com",
  },
  {
    phone: "444-555-6666",
    name: "Liam Garcia",
    email: "liam@example.com",
  },
];

export function Appointments() {
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    setIsSearching(true);
    setCustomer(null);
    setNotFound(false);

    setTimeout(() => {
      const foundCustomer = mockCustomers.find((c) => c.phone === phone);
      if (foundCustomer) {
        setCustomer(foundCustomer);
      } else {
        setNotFound(true);
      }
      setIsSearching(false);
    }, 500);
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newCustomer = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: phone,
    };
    console.log("Registering new customer:", newCustomer);
    setCustomer(newCustomer);
    setNotFound(false);
    toast({
      title: "Customer Registered",
      description: `${newCustomer.name} has been added to your client list.`,
    });
  };

  const customerAppointments = customer
    ? appointments.filter((apt) => apt.customer.email === customer.email)
    : [];

  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-headline font-bold">Appointments</h1>
        <p className="text-muted-foreground mt-2">
          Find a client by phone number to manage or book appointments.
        </p>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Find Client</CardTitle>
          <CardDescription>
            Enter a client's phone number to see their history or register them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="tel"
              id="phone"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSearching}
            />
            <Button onClick={handleSearch} disabled={!phone || isSearching}>
              <Search className="mr-2 h-4 w-4" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {customer && (
        <Card className="w-full max-w-4xl">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{customer.name}</CardTitle>
              <CardDescription>
                {customer.email} | {customer.phone}
              </CardDescription>
            </div>
            <Button>
              <CalendarPlus className="mr-2" />
              Schedule New Appointment
            </Button>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-4">Appointment History</h3>
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
                {customerAppointments.length > 0 ? (
                  customerAppointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>{apt.date}</TableCell>
                      <TableCell>{apt.time}</TableCell>
                      <TableCell className="font-medium">
                        {apt.service}
                      </TableCell>
                      <TableCell>{apt.staff}</TableCell>
                      <TableCell className="text-right">
                        ${apt.price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No appointment history found for this client.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {notFound && (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>New Client</CardTitle>
            <CardDescription>
              This phone number is not in your records. Please register the new
              client.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Register Client
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
