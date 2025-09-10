import { Services } from "@/features/services/Services";
import { createClient } from "@/lib/supabase/server";

export default async function ServicesPage() {
  const supabase = createClient();
  const { data: services, error } = await supabase.from("services").select("*");

  return <Services services={services} error={error} />;
}
