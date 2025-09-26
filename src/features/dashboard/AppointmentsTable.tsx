import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Appointment = {
    id: string;
    salonId: string;
    customer: {
        id: string;
        phone: string;
        name: string;
        email: string;
    };
    service: string;
    staff: string;
    date: string;
    time: string;
    price: number;
};


export function AppointmentsTable({
  title,
  appointments,
}: {
  title: string;
  appointments: Appointment[];
}) {

  return (
    <>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>{title}</CardTitle>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/staff/schedule">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.slice(0, 5).map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={`https://picsum.photos/seed/${apt.customer.name}/100`}
                          alt="Avatar"
                        />
                        <AvatarFallback>
                          {apt.customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{apt.customer.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{apt.service}</TableCell>
                  <TableCell className="text-right">{apt.time}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  No appointments for this period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </>
  );
}
