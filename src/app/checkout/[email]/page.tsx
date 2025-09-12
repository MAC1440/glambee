
import { Checkout } from "@/features/checkout/Checkout";
import { mockCustomers } from "@/lib/placeholder-data";

export default function CheckoutPage({
  params,
}: {
  params: { email: string };
}) {
  const clientEmail = decodeURIComponent(params.email);
  const client = mockCustomers.find((c) => c.email === clientEmail);

  return <Checkout client={client} />;
}

    