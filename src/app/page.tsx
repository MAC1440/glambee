import { Dashboard } from "@/features/dashboard/Dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: users, error } = await supabase.from("users").select("*");

  return <Dashboard users={users} error={error} />;
}
