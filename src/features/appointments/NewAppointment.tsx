"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import Link from "next/link";

type Client = ClientWithDetails | any;

export function NewAppointment({
  appointments,
  preselectedClient,
  setPreselectedClient,
}: {
  appointments: AppointmentWithDetails[];
  preselectedClient?: Client | null;
  setPreselectedClient: (client: Client | null) => void;
}) {
  const { toast } = useToast();
  const [appointmentsList, setAppointmentsList] = useState<AppointmentWithDetails[]>(appointments);
  console.log("List of appointments: ", appointmentsList)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);
  console.log("Selected slot: ", selectedSlot, new Date(selectedSlot?.start || ''))
  const [servicesToBook, setServicesToBook] = useState<CartItem[]>([]);
  console.log("Services to book: ", servicesToBook)
  // const [selectedClient, setSelectedClient] = useState<Client | null>(preselectedClient || null);
  // console.log("Selected client: ", preselectedClient)
  const [isLoading, setIsLoading] = useState(false);
  const sessionData = localStorage.getItem("session");
  console.log("Session appoint data: ", JSON.parse(sessionData || ''))
  console.log("Preselected client in new appointment file: ", preselectedClient)

  // Fetch appointments on component mount if not provided
  useEffect(() => {
    if (appointments.length === 0) {
      const fetchAppointments = async () => {
        try {
          setIsLoading(true);
          const salonId = sessionData ? JSON.parse(sessionData).salonId : null;
          const response = await AppointmentsApi.getAppointments({
            salonId: salonId,
          });
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
  }, [appointments.length, toast, sessionData]);


  const calendarEvents = useMemo(() => {
    const selectedArtistIds = new Set(
      servicesToBook.map(item => item.artist?.value).filter(Boolean) as string[]
    );

    // Filter appointments by selected client if one is selected
    let confirmedAppointments = appointmentsList;
    if (preselectedClient) {
      confirmedAppointments = appointmentsList.filter(apt => apt.customer_id === preselectedClient.id);
    }

    // Further filter by selected artists if any are chosen
    if (selectedArtistIds.size > 0) {
      confirmedAppointments = confirmedAppointments.filter(apt => selectedArtistIds.has(apt.staff_id || ''));
    }

    console.log("Confirmed appointments: ", confirmedAppointments)

    const confirmedEvents = confirmedAppointments.map((apt) => {
      let title = ''
      if (apt.services?.[0]?.name) {
        title = `${apt.services?.[0]?.name} (Service) - ${apt.customer?.name || apt.customer_name || 'Unknown'} - ${apt.staff?.name || 'Unknown Staff'}`
      }
      else {
        title = `${apt.deals?.[0]?.name} (Deal) - ${apt.customer?.name || apt.customer_name || 'Unknown'} - ${apt.staff?.name || 'Unknown Staff'}`
      }

      return {
        title: title,
        start: apt.start_time ? new Date(apt.start_time) : new Date(apt.date),
        end: apt.end_time ? new Date(apt.end_time) : new Date(apt.date),
        resource: { ...apt, isTemporary: false },
      }
    });

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
            customerName: preselectedClient?.name || 'New Client',
            service: item.service.name,
            staffId: item.artist?.value || '',
            isTemporary: true,
          },
        };
      });
      return [...confirmedEvents, ...temporaryEvents];
    }

    return confirmedEvents;
  }, [appointmentsList, servicesToBook, selectedSlot, preselectedClient]);

  const handleAddServiceToList = (item: CartItem) => {
    console.log("Item for selection: ", item)
    // Check if service already exists in list
    const isDuplicate = servicesToBook.some(service => service.service.id === item.service.id);
    if (isDuplicate) {
      toast({
        title: "Service Already Added",
        description: `${item.service.name} is already in your booking list.`,
        variant: "destructive",
      });
      return;
    }

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
    // Require at least one service before selecting a slot
    if (servicesToBook.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please add at least one service before selecting a time slot.",
        variant: "destructive",
      });
      return;
    }

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
    if (!preselectedClient) {
      toast({
        title: "No Client Selected",
        description: "Please select a client before booking.",
        variant: "destructive",
      });
      return;
    }

    // Validation: Check for duplicate bookings
    const selectedDate = selectedSlot.start.toISOString().split('T')[0];
    console.log("Selected date: ", selectedDate)
    // Check for same service on same date
    const serviceIds = servicesToBook.map(item => item.service.id);
    console.log("Services ids: ", serviceIds)
    const duplicateServices = serviceIds.filter((id, index) => serviceIds.indexOf(id) !== index);
    console.log("Duplicated services: ", duplicateServices)
    if (duplicateServices.length > 0) {
      toast({
        title: "Duplicate Service",
        description: "You cannot book the same service multiple times on the same date.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate appointments: same service, same date, same time, and optionally same staff
    for (const item of servicesToBook) {
      // Convert selected slot start time to ISO string for comparison
      const selectedStartTimeISO = selectedSlot.start.toISOString();
      // Extract just the time portion (HH:MM:SS) for comparison
      const selectedTimeOnly = selectedStartTimeISO.split('T')[1]?.slice(0, 5); // Remove milliseconds
      console.log("Check selected start time for ISO conversion: ", selectedStartTimeISO)
      console.log("Converted selected slot time: ", selectedTimeOnly)

      const existingAppointment = appointmentsList.find(apt => {
        // Must be for the same customer
        if (apt.customer_id !== preselectedClient.id) return false;

        // Must be on the same date
        if (apt.date !== selectedDate) return false;

        // Check if start_time matches (same time slot) - this is the key check
        if (apt.start_time) {
          const aptStartTimeISO = new Date(apt.start_time).toISOString();
          const aptTimeOnly = aptStartTimeISO.split('T')[1]?.slice(0, 5); // Remove milliseconds
          console.log("Converted existing appointment time: ", aptTimeOnly)

          // If times match exactly, it's a duplicate regardless of service/staff
          if (aptTimeOnly === selectedTimeOnly) {
            return true;
          }
        }

        // Additional check: same service + same staff (if staff is selected)
        const hasSameService = apt.services?.some(s => s.id === item.service.id) ||
          apt.deals?.some(d => d.id === item.service.id);

        if (hasSameService) {
          // If staff is selected, check for same staff
          if (item.artist) {
            return apt.staff_id === item.artist.value;
          }
          // If no staff is selected, check if existing appointment also has no staff
          if (!item.artist && (!apt.staff_id || apt.staff_id === null)) {
            return true;
          }
        }

        return false;
      });

      console.log("Existing appointment: ", existingAppointment)
      if (existingAppointment) {
        const staffInfo = item.artist ? ` with staff member ${item.artist.label}` : '';
        const timeInfo = format(selectedSlot.start, 'p');

        toast({
          title: "Duplicate Appointment",
          description: `An appointment${staffInfo ? `${staffInfo}` : ''} at ${timeInfo} on ${format(new Date(selectedDate), 'MMM dd, yyyy')} already exists for this client. Please select a different time.`,
          variant: "destructive",
        });
        return;
      }
    }

    let allArtistsAssigned = true;
    const appointmentsToCreate: CreateAppointmentData[] = [];

    // Group services by staff member (allow null for unassigned services)
    const servicesByStaff = new Map<string | null, CartItem[]>();

    servicesToBook.forEach(item => {
      let staffId: string | null = null;

      if (item.artist) {
        staffId = item.artist.value;
      } else {
        // No artist selected - will be assigned to null staff
        staffId = null;
      }

      if (!servicesByStaff.has(staffId)) {
        servicesByStaff.set(staffId, []);
      }
      servicesByStaff.get(staffId)!.push(item);
    });

    // Create appointment data for each staff member
    let cumulativeEndTime = new Date(selectedSlot.start);
    console.log("Check services by staff: ", servicesByStaff)

    // for (const [staffId, services] of servicesByStaff) {
    for (const service of servicesToBook) {
      const appointmentStart = new Date(cumulativeEndTime);
      let appointmentEnd = new Date(appointmentStart);

      // Calculate total duration for this staff member
      const totalDuration = service.service.duration || 30;
      appointmentEnd.setMinutes(appointmentEnd.getMinutes() + totalDuration);

      appointmentsToCreate.push({
        customerId: preselectedClient.id,
        staffId: service.artist?.value || null, // Pass null if no artist selected
        services: [{
          serviceId: service.service.id || '',
          price: typeof service.service.price === 'string' ? parseFloat(service.service.price) : service.service.price,
          category: service.service.category || ''
        }],
        startTime: appointmentStart.toISOString(),
        endTime: appointmentEnd.toISOString(),
        date: appointmentStart.toISOString().split('T')[0],
        notes: `Appointment for ${preselectedClient.name}`,
        bookingType: undefined,
        bookingApproach: undefined
      });
      console.log("Appointments to create: ", appointmentsToCreate)

      cumulativeEndTime = appointmentEnd;
    }

    try {
      setIsLoading(true);

      // Create all appointments
      const createdAppointments = [];
      for (const appointmentData of appointmentsToCreate) {
        const createdAppointment = await AppointmentsApi.createAppointment(appointmentData);
        createdAppointments.push(createdAppointment);
      }
      console.log("Created appointments: ", createdAppointments)

      // Refresh appointments list
      const salonId = sessionData ? JSON.parse(sessionData).salonId : null;
      const response = await AppointmentsApi.getAppointments({
        salonId: salonId,
      });
      setAppointmentsList(response.data);

      // Check if any services are unassigned
      const hasUnassignedServices = servicesToBook.some(item => !item.artist);
      const staffMessage = hasUnassignedServices ? " (some services unassigned)" : "";

      toast({
        title: "✅ Appointments Booked!",
        description: `${servicesToBook.length} service(s) for ${preselectedClient.name} have been scheduled starting at ${format(selectedSlot.start, "p")}.`,
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
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

  if (!preselectedClient) {
    return (
      <div className="flex flex-col gap-8">
        {/* <div className="text-center">
          <h1 className="text-4xl font-headline font-bold">Select a Client</h1>
          <p className="text-muted-foreground mt-2">
            Choose a client to start booking an appointment.
          </p>
        </div> */}
        <ClientsList onClientSelect={(client) => setPreselectedClient(client)} isSelectMode={true} />
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
                <User className="h-4 w-4" /> Booking for {preselectedClient.name}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/appointments">
                <ArrowLeft className="mr-2 h-4 w-4" /> Change Client
              </Link>
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
          <ServiceSelection
            onAddToCart={handleAddServiceToList}
            buttonText="Add to Booking List"
            existingItems={servicesToBook}
            salonId={sessionData ? JSON.parse(sessionData).salonId : null}
          />
        </div>


        {servicesToBook.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Services or Deals to Book</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 overflow-y-auto max-h-[300px]">
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
                {preselectedClient
                  ? `You can click and drag on any open time slot in the calendar to select it for ${preselectedClient.name}'s new appointment.`
                  : "You can click and drag on any open time slot in the calendar to select it for a new appointment."
                }
              </AlertDescription>
            </Alert>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>
                  {preselectedClient
                    ? `${preselectedClient.name}'s Appointments`
                    : "All Appointments"
                  }
                </CardTitle>
                <CardDescription>
                  {preselectedClient
                    ? `Showing existing appointments for ${preselectedClient.name}`
                    : "Showing all appointments in the system"
                  }
                </CardDescription>
              </CardHeader>
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
