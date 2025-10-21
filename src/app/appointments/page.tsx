
import { NewAppointment } from "@/features/appointments/NewAppointment";
import { AppointmentsApi } from "@/lib/api/appointmentsApi";
import { ClientsApi } from "@/lib/api/clientsApi";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const clientId = searchParams?.clientId as string | undefined;
  
  // Fetch appointments and client data
  let appointments: any[] = [];
  let preselectedClient: any = undefined;

  try {
    // Fetch appointments from database
    const appointmentsResponse = await AppointmentsApi.getAppointments();
    appointments = appointmentsResponse.data;

    // If clientId is provided, fetch that specific client
    if (clientId) {
      preselectedClient = await ClientsApi.getCustomerById(clientId);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    // Fallback to empty data
  }

  return (
    <NewAppointment
      appointments={appointments}
      preselectedClient={preselectedClient}
    />
  );
}
