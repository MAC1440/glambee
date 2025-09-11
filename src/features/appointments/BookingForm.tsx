
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { services, staff } from "@/lib/placeholder-data";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Customer = {
  phone: string;
  name: string;
  email: string;
};

export function BookingForm({ client }: { client: Customer }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleBooking = () => {
    // In a real app, this would submit the form data to the backend.
    toast({
      title: "Appointment Booked!",
      description: `An appointment has been scheduled for ${client.name}.`,
    });
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="w-full max-w-4xl flex justify-start">
        <Button variant="ghost" asChild>
          <Link href="/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Client Search
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">
            Book Appointment for {client.name}
          </CardTitle>
          <CardDescription>
            Choose a service, staff member, and time for {client.email}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <Label>Service</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Staff</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleBooking}>Confirm Booking</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
