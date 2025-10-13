import { ClientDetail } from "@/features/clients/ClientDetail";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const resolvedParams = await params;
  const clientId = resolvedParams.email;
  console.log("Params: ", resolvedParams)
  console.log("Client while fetching in params: ", clientId)

  return <ClientDetail clientId={clientId} />;
}
