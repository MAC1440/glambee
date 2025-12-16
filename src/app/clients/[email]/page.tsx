import { ClientDetail } from "@/features/clients/ClientDetail";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const resolvedParams = await params;
  const clientId = resolvedParams.email;

  return <ClientDetail clientId={clientId} />;
}
