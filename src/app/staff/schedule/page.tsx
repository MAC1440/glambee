import { Schedule } from "@/features/staff/schedule/Schedule";
import { appointments as mockAppointments } from "@/lib/placeholder-data";

export default function SchedulePage() {
  // In a real app, you'd fetch this from your database or API.
  const appointments = mockAppointments;

  return <Schedule appointments={appointments || []} />;
}
