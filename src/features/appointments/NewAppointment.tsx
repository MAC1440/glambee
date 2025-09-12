
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarView } from "@/features/staff/schedule/CalendarView";
import { ServiceSelection, type CartItem } from "@/features/checkout/ServiceSelection";
import type { ScheduleAppointment } from "@/lib/schedule-data";
import { X, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeSelection } from "./TimeSelection";

export function NewAppointment({ appointments }: { appointments: ScheduleAppointment[] }) {
  const { toast } = useToast();
  const [newAppointments, setNewAppointments] = useState<ScheduleAppointment[]>(appointments);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);
  const [servicesToBook, setServicesToBook] = useState<CartItem[]>([]);

  const calendarEvents = newAppointments.map((apt) => {
    return {
      title: `${apt.service} - ${apt.customerName}`,
      start: apt.start,
      end: apt.end,
      resource: apt,
    };
  });
  
  const handleAddServiceToList = (item: CartItem) => {
    setServicesToBook(prev => [...prev, item]);
     toast({
      title: "Service Added",
      description: `${item.service.name} was added to the booking list.`,
    });
  }

  const handleRemoveFromList = (index: number) => {
    const item = servicesToBook[index];
    setServicesToBook(prev => prev.filter((_, i) => i !== index));
    toast({
        title: "Service Removed",
        description: `${item.service.name} has been removed from the list.`,
        variant: "destructive"
    });
  }

  const handleBookAllAppointments = () => {
    if (!selectedSlot) {
      toast({
        title: "No Time Slot Selected",
        description: "Please select a time slot on the calendar to book the appointment.",
        variant: "destructive",
      });
      return;
    }
    if (servicesToBook.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please add at least one service to the list.",
        variant: "destructive",
      });
      return;
    }
    
    let cumulativeEndTime = new Date(selectedSlot.start);

    const appointmentsToAdd = servicesToBook.map(item => {
        const serviceDuration = item.service.duration || 30; // Default to 30 mins if not specified
        const appointmentStart = new Date(cumulativeEndTime);
        const appointmentEnd = new Date(appointmentStart.getTime() + serviceDuration * 60000);
        
        // Update cumulative end time for the next appointment
        cumulativeEndTime = appointmentEnd;

        return {
            id: `sch_apt_${Date.now()}_${Math.random()}`,
            customerName: 'New Client', // This would be dynamic
            customerAvatar: `https://picsum.photos/seed/new-client-${Math.random()}/100`,
            service: item.service.name,
            start: appointmentStart,
            end: appointmentEnd,
        };
    });

    setNewAppointments(prev => [...prev, ...appointmentsToAdd]);
    
    toast({
      title: "Appointments Booked!",
      description: `${servicesToBook.length} service(s) have been scheduled starting at ${selectedSlot.start.toLocaleTimeString()}.`,
    });

    setServicesToBook([]); // Clear the list
    setSelectedSlot(null); // Reset slot after booking
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Column: Booking Form */}
      <div className="lg:col-span-1 flex flex-col gap-8">
        <div>
            <h1 className="text-4xl font-headline font-bold">Book Appointment</h1>
            <p className="text-muted-foreground mt-2">
            {selectedSlot 
                ? `Selected slot starts at: ${selectedSlot.start.toLocaleTimeString()}` 
                : "Select a time on the calendar to book."
            }
            </p>
        </div>
        <ServiceSelection onAddToCart={handleAddServiceToList} buttonText="Add Service to List" />

        {servicesToBook.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Services to Book</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {servicesToBook.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm p-2 rounded-md bg-muted/50">
                            <div>
                                <p className="font-medium">{item.service.name}</p>
                                {item.artist && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {item.artist.label}
                                    </p>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFromList(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Separator className="my-4" />
                     <Button className="w-full" onClick={handleBookAllAppointments}>
                        Book All ({servicesToBook.length}) Appointments
                    </Button>
                </CardContent>
             </Card>
        )}
      </div>

      {/* Right Column: Calendar and Time Selection */}
      <div className="lg:col-span-2">
        <Tabs defaultValue="time">
            <TabsList>
                <TabsTrigger value="time">Select Time</TabsTrigger>
                <TabsTrigger value="schedule">Full Schedule</TabsTrigger>
            </TabsList>
            <TabsContent value="time" className="mt-4">
                 <TimeSelection onSelectTime={(date) => setSelectedSlot({start: date, end: date})} />
            </TabsContent>
            <TabsContent value="schedule" className="mt-4">
                <Card className="h-full">
                    <CardContent className="p-2 md:p-4 h-full">
                        <CalendarView 
                            events={calendarEvents} 
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
