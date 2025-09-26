
import { NewAppointment } from "@/features/appointments/NewAppointment";
import { scheduleAppointments } from "@/lib/schedule-data";
import { mockCustomers } from "@/lib/placeholder-data";

export default function AppointmentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const clientEmail = searchParams?.clientEmail as string | undefined;
  const preselectedClient = clientEmail
    ? mockCustomers.find((c) => c.email === clientEmail)
    : undefined;

  return (
    <NewAppointment
      appointments={scheduleAppointments || []}
      preselectedClient={preselectedClient}
    />
  );
}
