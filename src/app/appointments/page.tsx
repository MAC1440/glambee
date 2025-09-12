
import { NewAppointment } from "@/features/appointments/NewAppointment";
import { scheduleAppointments } from "@/lib/schedule-data";

export default function AppointmentsPage() {
  return <NewAppointment appointments={scheduleAppointments || []} />;
}
