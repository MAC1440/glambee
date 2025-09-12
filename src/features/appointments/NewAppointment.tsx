
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarView } from "@/features/staff/schedule/CalendarView";
import { ServiceSelection, type CartItem } from "@/features/checkout/ServiceSelection";
import type { ScheduleAppointment } from "@/lib/schedule-data";
import { Label } from "@/components/ui/label";

export function NewAppointment({ appointments }: { appointments: ScheduleAppointment[] }) {
  const { toast } = useToast();
  const [newAppointments, setNewAppointments] = useState<ScheduleAppointment[]>(appointments);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);

  const calendarEvents = newAppointments.map((apt) => {
    return {
      title: `${apt.service} - ${apt.customerName}`,
      start: apt.start,
      end: apt.end,
      resource: apt,
    };
  });

  const handleBookAppointment = (item: CartItem) => {
    if (!selectedSlot) {
      toast({
        title: "No Time Slot Selected",
        description: "Please select a time slot on the calendar to book the appointment.",
        variant: "destructive",
      });
      return;
    }
    
    // Logic to add the new appointment
    const newAppointment: ScheduleAppointment = {
        id: `sch_apt_${Date.now()}`,
        customerName: 'New Client', // This would be dynamic in a real app
        customerAvatar: 'https://picsum.photos/seed/new-client/100',
        service: item.service.name,
        start: selectedSlot.start,
        end: selectedSlot.end,
    };

    setNewAppointments(prev => [...prev, newAppointment]);
    
    toast({
      title: "Appointment Booked!",
      description: `${item.service.name} has been scheduled for ${selectedSlot.start.toLocaleString()}.`,
    });
    setSelectedSlot(null); // Reset slot after booking
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Column: Booking Form */}
      <div className="lg:col-span-1 flex flex-col gap-8">
        <h1 className="text-4xl font-headline font-bold">Book Appointment</h1>
        <p className="text-muted-foreground">
          {selectedSlot 
            ? `Selected slot: ${selectedSlot.start.toLocaleString()}` 
            : "Select a time on the calendar to book."
          }
        </p>
        <ServiceSelection onAddToCart={handleBookAppointment} />
      </div>

      {/* Right Column: Calendar View */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardContent className="p-2 md:p-4 h-full">
            <CalendarView 
                events={calendarEvents} 
                onSelectSlot={(slotInfo) => setSelectedSlot(slotInfo)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
