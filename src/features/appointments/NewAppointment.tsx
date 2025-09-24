
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarView } from "@/features/staff/schedule/CalendarView";
import { ServiceSelection, type CartItem } from "@/features/checkout/ServiceSelection";
import type { ScheduleAppointment } from "@/lib/schedule-data";
import { X, Clock, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeSelection } from "./TimeSelection";
import type { SlotInfo } from 'react-big-calendar';
import { format } from "date-fns";

export function NewAppointment({ appointments }: { appointments: ScheduleAppointment[] }) {
  const { toast } = useToast();
  const [newAppointments, setNewAppointments] = useState<ScheduleAppointment[]>(appointments);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);
  const [servicesToBook, setServicesToBook] = useState<CartItem[]>([]);

  const calendarEvents = useMemo(() => {
    const selectedArtistIds = new Set(
      servicesToBook.map(item => item.artist?.value).filter(Boolean) as string[]
    );

    let confirmedAppointments = newAppointments;
    if (selectedArtistIds.size > 0) {
      confirmedAppointments = newAppointments.filter(apt => selectedArtistIds.has(apt.staffId));
    }
    
    const confirmedEvents = confirmedAppointments.map((apt) => ({
      title: `${apt.service} - ${apt.customerName}`,
      start: apt.start,
      end: apt.end,
      resource: { ...apt, isTemporary: false },
    }));

    if (selectedSlot && servicesToBook.length > 0) {
      let cumulativeEndTime = new Date(selectedSlot.start);
      const temporaryEvents = servicesToBook.map((item, index) => {
        const serviceDuration = item.service.duration || 30;
        const appointmentStart = new Date(cumulativeEndTime);
        const appointmentEnd = new Date(appointmentStart.getTime() + serviceDuration * 60000);
        cumulativeEndTime = appointmentEnd;

        return {
          title: `(PENDING) ${item.service.name}`,
          start: appointmentStart,
          end: appointmentEnd,
          resource: {
            id: `temp_${index}`,
            customerName: 'New Client',
            service: item.service.name,
            staffId: item.artist?.value || '',
            isTemporary: true,
          },
        };
      });
      return [...confirmedEvents, ...temporaryEvents];
    }
    
    return confirmedEvents;
  }, [newAppointments, servicesToBook, selectedSlot]);

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

  const handleSlotSelect = (slotInfo: SlotInfo | Date) => {
    const startDate = slotInfo instanceof Date ? slotInfo : slotInfo.start;
    const endDate = slotInfo instanceof Date ? slotInfo : slotInfo.end;
    setSelectedSlot({ start: startDate, end: endDate });
    toast({
      title: "Time Slot Selected",
      description: `Selected start time: ${format(startDate, "p")}`,
    });
  };

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
    let allArtistsAssigned = true;

    const appointmentsToAdd = servicesToBook.map(item => {
        if (!item.artist) {
            allArtistsAssigned = false;
        }
        const serviceDuration = item.service.duration || 30; // Default to 30 mins if not specified
        const appointmentStart = new Date(cumulativeEndTime);
        const appointmentEnd = new Date(appointmentStart.getTime() + serviceDuration * 60000);
        
        cumulativeEndTime = appointmentEnd;

        return {
            id: `sch_apt_${Date.now()}_${Math.random()}`,
            customerName: 'New Client', // This would be dynamic
            customerAvatar: `https://picsum.photos/seed/new-client-${Math.random()}/100`,
            service: item.service.name,
            start: appointmentStart,
            end: appointmentEnd,
            staffId: item.artist?.value || '',
        };
    });

    if (!allArtistsAssigned) {
         toast({
            title: "Artist Not Assigned",
            description: "Please select an artist for each service before booking.",
            variant: "destructive",
        });
        return;
    }


    setNewAppointments(prev => [...prev, ...appointmentsToAdd]);
    
    toast({
      title: "Appointments Booked!",
      description: `${servicesToBook.length} service(s) have been scheduled starting at ${format(selectedSlot.start, "p")}.`,
    });

    setServicesToBook([]); // Clear the list
    setSelectedSlot(null); // Reset slot after booking
  };
  
  const servicesWithTime = useMemo(() => {
    if (!selectedSlot) return servicesToBook.map(item => ({ ...item, time: null }));

    let cumulativeEndTime = new Date(selectedSlot.start);
    return servicesToBook.map(item => {
      const serviceDuration = item.service.duration || 30;
      const appointmentStart = new Date(cumulativeEndTime);
      const appointmentEnd = new Date(appointmentStart.getTime() + serviceDuration * 60000);
      cumulativeEndTime = appointmentEnd;
      
      return {
        ...item,
        time: {
          start: appointmentStart,
          end: appointmentEnd
        }
      };
    });
  }, [servicesToBook, selectedSlot]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Column: Booking Form */}
      <div className="lg:col-span-1 flex flex-col gap-8">
        <div>
            <h1 className="text-4xl font-headline font-bold">Book Appointment</h1>
            <p className="text-muted-foreground mt-2">
            {selectedSlot 
                ? `Selected slot starts at: ${format(selectedSlot.start, 'Pp')}` 
                : "Select a time on the calendar to book."
            }
            </p>
        </div>

        <div className="space-y-4">
          <ServiceSelection onAddToCart={handleAddServiceToList} buttonText="Add Service to List" />
        </div>


        {servicesToBook.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Services to Book</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {servicesWithTime.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm p-2 rounded-md bg-muted/50">
                            <div>
                                <p className="font-medium">{item.service.name}</p>
                                <p className="text-xs text-muted-foreground">{item.artist?.label || 'No artist selected'}</p>
                                <div className="text-xs text-muted-foreground flex items-center gap-4 mt-1">
                                    <p className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {item.time ? format(item.time.start, 'MMM d, yyyy') : 'Select a date'}
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {item.time ? `${format(item.time.start, 'p')} - ${format(item.time.end, 'p')}` : 'Select a start time'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFromList(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Separator className="my-4" />
                     <Button className="w-full" onClick={handleBookAllAppointments} disabled={!selectedSlot}>
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
                 <TimeSelection onSelectTime={handleSlotSelect} />
            </TabsContent>
            <TabsContent value="schedule" className="mt-4">
                <Card className="h-full">
                    <CardContent className="p-2 md:p-4 h-full">
                        <CalendarView 
                            events={calendarEvents}
                            onSelectSlot={handleSlotSelect}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
