import { ClientDetail } from "@/features/clients/ClientDetail";
import { mockCustomers } from "@/lib/placeholder-data";

export default function ClientDetailPage({
  params,
}: {
  params: { email: string };
}) {
  const clientEmail = decodeURIComponent(params.email);
  const client = mockCustomers.find((c) => c.email === clientEmail);

  return <ClientDetail client={client} />;
}
