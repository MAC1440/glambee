import { BookingForm } from "@/features/appointments/BookingForm";
import { mockCustomers } from "@/lib/placeholder-data";

export default function BookAppointmentPage({
  params,
}: {
  params: { email: string };
}) {
  const clientEmail = decodeURIComponent(params.email);
  const client = mockCustomers.find((c) => c.email === clientEmail);

  if (!client) {
    return <div>Client not found.</div>;
  }

  return <BookingForm client={client} />;
}
