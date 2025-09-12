
"use client";

import { useState, useMemo } from "react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarView } from "@/features/staff/schedule/CalendarView";
import { ServiceSelection, type CartItem } from "@/features/checkout/ServiceSelection";
import type { ScheduleAppointment } from "@/lib/schedule-data";
import { staff } from "@/lib/placeholder-data";
import { X, User, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeSelection } from "./TimeSelection";
import type { SlotInfo } from 'react-big-calendar';
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

type ArtistOption = {
  value: string;
  label: string;
};

export function NewAppointment({ appointments }: { appointments: ScheduleAppointment[] }) {
  const { toast } = useToast();
  const [newAppointments, setNewAppointments] = useState<ScheduleAppointment[]>(appointments);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);
  const [servicesToBook, setServicesToBook] = useState<CartItem[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null);

  const artistOptions = useMemo(() => {
    return staff.map(s => ({ value: s.id, label: s.name }));
  }, []);

  const calendarEvents = useMemo(() => {
    const filteredAppointments = selectedArtist 
      ? newAppointments.filter(apt => apt.staffId === selectedArtist.value)
      : newAppointments;

    return filteredAppointments.map((apt) => {
      const staffMember = staff.find(s => s.id === apt.staffId);
      return {
        title: `${apt.service} - ${apt.customerName}`,
        start: apt.start,
        end: apt.end,
        resource: { ...apt, staffName: staffMember?.name || 'Unknown' },
      };
    });
  }, [newAppointments, selectedArtist]);

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

  const handleSlotSelect = (slotInfo: SlotInfo) => {
    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
    toast({
      title: "Time Slot Selected",
      description: `Selected start time: ${format(slotInfo.start, "p")}`,
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
     if (!selectedArtist) {
      toast({
        title: "No Artist Selected",
        description: "Please select an artist to assign the appointments to.",
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
            staffId: selectedArtist.value,
        };
    });

    setNewAppointments(prev => [...prev, ...appointmentsToAdd]);
    
    toast({
      title: "Appointments Booked!",
      description: `${servicesToBook.length} service(s) have been scheduled with ${selectedArtist.label} starting at ${format(selectedSlot.start, "p")}.`,
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
                ? `Selected slot starts at: ${format(selectedSlot.start, 'p')}` 
                : "Select a time on the calendar to book."
            }
            </p>
        </div>

        <div className="space-y-4">
            <div className="space-y-2">
              <Label>Artist</Label>
              <Select
                options={artistOptions}
                value={selectedArtist}
                onChange={(option) => setSelectedArtist(option as ArtistOption)}
                placeholder="Select an artist to see their schedule..."
                isClearable
              />
            </div>
          <ServiceSelection onAddToCart={handleAddServiceToList} buttonText="Add Service to List" />
        </div>


        {servicesToBook.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Services for {selectedArtist?.label || '...'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {servicesWithTime.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm p-2 rounded-md bg-muted/50">
                            <div>
                                <p className="font-medium">{item.service.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3" />
                                    {item.time ? `${format(item.time.start, 'p')} - ${format(item.time.end, 'p')}` : 'Select a start time'}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFromList(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Separator className="my-4" />
                     <Button className="w-full" onClick={handleBookAllAppointments} disabled={!selectedSlot || !selectedArtist}>
                        Book All ({servicesToBook.length}) Appointments
                    </Button>
                </CardContent>
             </Card>
        )}
      </div>

      {/* Right Column: Calendar and Time Selection */}
      <div className="lg:col-span-2">
        <Tabs defaultValue="schedule">
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
