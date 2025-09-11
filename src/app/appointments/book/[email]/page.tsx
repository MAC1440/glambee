import { BookingForm } from "@/features/appointments/BookingForm";
import { mockCustomers, appointments, staff } from "@/lib/placeholder-data";

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

  // Find the client's most recent appointment to get the last staff member they saw
  const clientAppointments = appointments
    .filter((apt) => apt.customer.email === clientEmail)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let lastStaffId: string | undefined = undefined;
  if (clientAppointments.length > 0) {
    const lastStaffMember = staff.find(
      (s) => s.name === clientAppointments[0].staff
    );
    if (lastStaffMember) {
      lastStaffId = lastStaffMember.id;
    }
  }

  return <BookingForm client={client} lastStaffId={lastStaffId} />;
}
