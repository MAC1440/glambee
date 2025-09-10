import { ClientDetail } from "@/features/clients/ClientDetail";

export default function ClientDetailPage({
  params,
}: {
  params: { email: string };
}) {
  return <ClientDetail params={params} />;
}
