import { BookingForm } from "./booking-form";

export default function BookAppointmentPage() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-headline font-bold">Book an Appointment</h1>
        <p className="text-muted-foreground mt-2">
          Choose your desired service, staff, and time. We can't wait to see
          you!
        </p>
      </div>
      <BookingForm />
    </div>
  );
}
