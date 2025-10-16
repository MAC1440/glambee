"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarView } from "@/features/staff/schedule/CalendarView";
import { ServiceSelection, type CartItem } from "@/features/checkout/ServiceSelection";
import { X, Clock, Calendar as CalendarIcon, User, ArrowLeft, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeSelection } from "./TimeSelection";
import type { SlotInfo } from 'react-big-calendar';
import { format } from "date-fns";
import { ClientsList } from "../clients/ClientsList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppointmentsApi, type AppointmentWithDetails, type CreateAppointmentData } from "@/lib/api/appointmentsApi";
import { ClientsApi, type ClientWithDetails } from "@/lib/api/clientsApi";
import { StaffApi } from "@/lib/api/staffApi";

type Client = ClientWithDetails;

export function NewAppointment({
  appointments,
  preselectedClient,
}: {
  appointments: AppointmentWithDetails[];
  preselectedClient?: Client;
}) {
  const { toast } = useToast();
  const [appointmentsList, setAppointmentsList] = useState<AppointmentWithDetails[]>(appointments);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);
  const [servicesToBook, setServicesToBook] = useState<CartItem[]>([]);
  // console.log("Services to book: ", servicesToBook)
  const [selectedClient, setSelectedClient] = useState<Client | null>(preselectedClient || null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch appointments on component mount if not provided
  useEffect(() => {
    if (appointments.length === 0) {
      const fetchAppointments = async () => {
        try {
          setIsLoading(true);
          const response = await AppointmentsApi.getAppointments();
          setAppointmentsList(response.data);
        } catch (error) {
          console.error("Error fetching appointments:", error);
          toast({
            title: "Error",
            description: "Failed to load appointments.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchAppointments();
    }
  }, [appointments.length, toast]);


  const calendarEvents = useMemo(() => {
    const selectedArtistIds = new Set(
      servicesToBook.map(item => item.artist?.value).filter(Boolean) as string[]
    );

    let confirmedAppointments = appointmentsList;
    if (selectedArtistIds.size > 0) {
      confirmedAppointments = appointmentsList.filter(apt => selectedArtistIds.has(apt.staff_id || ''));
    }
    
    const confirmedEvents = confirmedAppointments.map((apt) => ({
      title: `${apt.services?.[0]?.name || 'Service'} - ${apt.customer?.name || apt.customer_name || 'Unknown'}`,
      start: apt.start_time ? new Date(apt.start_time) : new Date(apt.date),
      end: apt.end_time ? new Date(apt.end_time) : new Date(apt.date),
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
            customerName: selectedClient?.name || 'New Client',
            service: item.service.name,
            staffId: item.artist?.value || '',
            isTemporary: true,
          },
        };
      });
      return [...confirmedEvents, ...temporaryEvents];
    }
    
    return confirmedEvents;
  }, [appointmentsList, servicesToBook, selectedSlot, selectedClient]);

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

  const handleBookAllAppointments = async () => {
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
    if (!selectedClient) {
      toast({
        title: "No Client Selected",
        description: "Please select a client before booking.",
        variant: "destructive",
      });
      return;
    }
    
    let allArtistsAssigned = true;
    const appointmentsToCreate: CreateAppointmentData[] = [];

    // Group services by staff member (allow null for unassigned services)
    const servicesByStaff = new Map<string | null, CartItem[]>();
    // console.log("Services by staff: ", servicesByStaff)
    
    servicesToBook.forEach(item => {
        let staffId: string | null = null;
        
        if (item.artist) {
            staffId = item.artist.value;
        } else {
            // No artist selected - will be assigned to null staff
            staffId = null;
            // console.log(`No artist selected for service: ${item.service.name} - will be unassigned`);
        }
        
        if (!servicesByStaff.has(staffId)) {
            servicesByStaff.set(staffId, []);
        }
        servicesByStaff.get(staffId)!.push(item);
    });

    // Create appointment data for each staff member
    let cumulativeEndTime = new Date(selectedSlot.start);
    for (const [staffId, services] of servicesByStaff) {
        const appointmentStart = new Date(cumulativeEndTime);
        let appointmentEnd = new Date(appointmentStart);
        
        // Calculate total duration for this staff member
        const totalDuration = services.reduce((sum, service) => sum + (service.service.duration || 30), 0);
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + totalDuration);
        
        appointmentsToCreate.push({
            customerId: selectedClient.id,
            staffId: staffId, // Pass null if no artist selected
            services: services.map(service => ({
                serviceId: service.service.id,
                price: typeof service.service.price === 'string' ? parseFloat(service.service.price) : service.service.price
            })),
            startTime: appointmentStart.toISOString(),
            endTime: appointmentEnd.toISOString(),
            date: appointmentStart.toISOString().split('T')[0],
            notes: `Appointment for ${selectedClient.name}`,
            bookingType: undefined,
            bookingApproach: undefined
        });
        
        cumulativeEndTime = appointmentEnd;
    }

    try {
      setIsLoading(true);
      // console.log("Creating appointments: ", appointmentsToCreate)
      // Create all appointments
      const createdAppointments = [];
      for (const appointmentData of appointmentsToCreate) {
        const createdAppointment = await AppointmentsApi.createAppointment(appointmentData);
        createdAppointments.push(createdAppointment);
      }
      
      // Refresh appointments list
      const response = await AppointmentsApi.getAppointments();
      setAppointmentsList(response.data);
      
      // Check if any services are unassigned
      const hasUnassignedServices = servicesToBook.some(item => !item.artist);
      const staffMessage = hasUnassignedServices ? " (some services unassigned)" : "";
      
      toast({
        title: "✅ Appointments Booked!",
        description: `${servicesToBook.length} service(s) for ${selectedClient.name} have been scheduled starting at ${format(selectedSlot.start, "p")}${staffMessage}.`,
        className: "border-green-500 bg-green-50 text-green-900",
      });

      setServicesToBook([]);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error booking appointments:", error);
      toast({
        title: "Error",
        description: "Failed to book appointments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
  
  if (!selectedClient) {
    return (
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-headline font-bold">Select a Client</h1>
          <p className="text-muted-foreground mt-2">
            Choose a client to start booking an appointment.
          </p>
        </div>
        <ClientsList onClientSelect={(client) => setSelectedClient(client as unknown as ClientWithDetails)} isSelectMode={true} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Column: Booking Form in appointment */}
      <div className="lg:col-span-1 flex flex-col gap-8">
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Book Appointment</h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                        <User className="h-4 w-4" /> Booking for {selectedClient.name}
                    </p>
                </div>
                 <Button variant="outline" onClick={() => setSelectedClient(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Change Client
                </Button>
            </div>
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
                                <p className="text-xs text-muted-foreground">
                                  {item.artist?.label || 'Unassigned'}
                                </p>
                                <div className="text-xs text-muted-foreground flex items-center gap-4 mt-1">
                                    <p className="flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" />
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
                     <Button 
                        className="w-full" 
                        onClick={handleBookAllAppointments} 
                        disabled={!selectedSlot || isLoading}
                    >
                        {isLoading ? "Booking..." : `Book All (${servicesToBook.length}) Appointments`}
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
                 <TimeSelection onSelectTime={handleSlotSelect} />
            </TabsContent>
            <TabsContent value="schedule" className="mt-4">
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Pro Tip!</AlertTitle>
                  <AlertDescription>
                    You can click and drag on any open time slot in the calendar to select it for a new appointment.
                  </AlertDescription>
                </Alert>
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
