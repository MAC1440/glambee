
"use client";

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
import { CalendarPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Customer = {
  phone: string;
  name: string;
  email: string;
};

type Appointment = {
  id: string;
  date: string;
  time: string;
  service: string;
  staff: string;
  price: number;
};

type ClientFoundProps = {
  customer: Customer;
  appointments: Appointment[];
  onBack: () => void;
};

export function ClientFound({
  customer,
  appointments,
  onBack,
}: ClientFoundProps) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="w-full max-w-4xl flex justify-start">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
      </div>
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{customer.name}</CardTitle>
            <CardDescription>
              {customer.email} | {customer.phone}
            </CardDescription>
          </div>
          <Button asChild>
            <Link href={`/appointments/book/${encodeURIComponent(customer.email)}`}>
              <CalendarPlus className="mr-2" />
              Schedule New Appointment
            </Link>
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
              {appointments.length > 0 ? (
                appointments.map((apt) => (
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
                    No appointment history found for this client.
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
