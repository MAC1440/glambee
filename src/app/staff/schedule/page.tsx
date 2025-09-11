import { Schedule } from "@/features/staff/schedule/Schedule";
import { scheduleAppointments } from "@/lib/schedule-data";

export default function SchedulePage() {
  // Using dedicated schedule data to simplify and ensure correctness
  return <Schedule appointments={scheduleAppointments || []} />;
}
