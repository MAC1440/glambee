import { Dashboard } from "@/features/dashboard/Dashboard";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

export default async function DashboardPage() {
  const supabase = createClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("date", today);

  if (error) {
    console.error("Error fetching appointments:", error);
  }

  return <Dashboard todayAppointments={appointments || []} />;
}
