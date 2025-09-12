
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarView } from "@/features/staff/schedule/CalendarView";
import { ServiceSelection, type CartItem } from "@/features/checkout/ServiceSelection";
import type { ScheduleAppointment } from "@/lib/schedule-data";
import { Label } from "@/components/ui/label";

export function NewAppointment({ appointments }: { appointments: ScheduleAppointment[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const calendarEvents = appointments.map((apt) => {
    return {
      title: `${apt.service} - ${apt.customerName}`,
      start: apt.start,
      end: apt.end,
      resource: apt,
    };
  });

  const handleBookAppointment = (item: CartItem) => {
    if (!date) {
      toast({
        title: "No Date Selected",
        description: "Please select a date for the appointment.",
        variant: "destructive",
      });
      return;
    }
    // Logic to add the new appointment would go here
    console.log("Booking:", item, "on", date.toDateString());
    toast({
      title: "Appointment Booked!",
      description: `${item.service.name} has been scheduled for ${date.toLocaleDateString()}.`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Column: Booking Form */}
      <div className="lg:col-span-1 flex flex-col gap-8">
        <h1 className="text-4xl font-headline font-bold">Book Appointment</h1>
        <ServiceSelection onAddToCart={handleBookAppointment} />
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
             <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
             />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Calendar View */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardContent className="p-2 md:p-4 h-full">
            <CalendarView events={calendarEvents} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
