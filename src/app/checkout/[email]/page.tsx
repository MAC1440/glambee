
import { Checkout } from "@/features/checkout/Checkout";
import { ClientsApi } from "@/lib/api/clientsApi";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const resolvedParams = await params;
  const clientId = resolvedParams.email; // The route parameter is 'email' but contains the client ID
  
  let client = null;
  try {
    client = await ClientsApi.getCustomerById(clientId);
  } catch (error) {
    console.error("Error fetching client for checkout:", error);
  }

  return <Checkout client={client || undefined} />;
}

    