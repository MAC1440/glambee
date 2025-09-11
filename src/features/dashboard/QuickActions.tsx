import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button asChild>
          <Link href="/appointments">Book New Appointment</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/services">Manage Services</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/staff/schedule">View Schedule</Link>
        </Button>
      </CardContent>
    </>
  );
}
