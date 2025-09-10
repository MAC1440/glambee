import { Schedule } from "@/features/staff/schedule/Schedule";
import { createClient } from "@/lib/supabase/server";

export default async function SchedulePage() {
  const supabase = createClient();
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*");

  if (error) {
    console.error("Error fetching appointments:", error);
    // Optionally render an error state
  }
  return <Schedule appointments={appointments || []} />;
}
