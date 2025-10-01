import { Dashboard } from "@/features/dashboard/Dashboard";
import { appointments as mockAppointments } from "@/lib/placeholder-data";
import { scheduleAppointments } from "@/lib/schedule-data";

export default async function DashboardPage() {
  // In a real app, you'd fetch this from your database or API.
  // We are hardcoding the date to ensure mock data is shown.
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = mockAppointments.filter(
    (apt) => apt.date === today
  );

  return (
    <Dashboard
      todayAppointments={todayAppointments || []}
      allAppointments={scheduleAppointments || []}
    />
  );
}
