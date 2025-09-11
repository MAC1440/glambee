import { Dashboard } from "@/features/dashboard/Dashboard";
import { appointments as mockAppointments } from "@/lib/placeholder-data";
import { format } from "date-fns";

export default async function DashboardPage() {
  // In a real app, you'd fetch this from your database or API.
  const today = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = mockAppointments.filter(
    (apt) => apt.date === today
  );

  return <Dashboard todayAppointments={todayAppointments || []} />;
}
