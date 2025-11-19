"use client";

import { NewAppointment } from "@/features/appointments/NewAppointment";
import { AppointmentsApi } from "@/lib/api/appointmentsApi";
import { ClientsApi } from "@/lib/api/clientsApi";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AppointmentsPageContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams?.get("clientId") as string | undefined;
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [preselectedClient, setPreselectedClient] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const sessionData = localStorage.getItem("session");
        const salonId = sessionData ? JSON.parse(sessionData).salonId : null;

        // Fetch appointments from database with salonId filter
        const appointmentsResponse = await AppointmentsApi.getAppointments({
          salonId: salonId,
        });
        setAppointments(appointmentsResponse.data || []);

        // If clientId is provided, fetch that specific client
        if (clientId) {
          const client = await ClientsApi.getCustomerById(clientId);
          setPreselectedClient(client);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to empty data
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <NewAppointment
      appointments={appointments}
      preselectedClient={preselectedClient}
    />
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading appointments...</p>
      </div>
    }>
      <AppointmentsPageContent />
    </Suspense>
  );
}
