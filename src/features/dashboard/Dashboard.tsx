
import { AppointmentsTable } from "./AppointmentsTable";
import { QuickActions } from "./QuickActions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Activity,
  CalendarCheck,
  CircleDollarSign,
  Users,
} from "lucide-react";
import { RevenueChart } from "./RevenueChart";
import { RecentActivity } from "./RecentActivity";

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

export function Dashboard({
  todayAppointments,
}: {
  todayAppointments: Appointment[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Appointments Today
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Booked for today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              Based on staff availability
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
           <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Your revenue summary for the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest bookings and client registrations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <AppointmentsTable todayAppointments={todayAppointments} />
        </Card>
        <Card>
          <QuickActions />
        </Card>
      </div>
    </div>
  );
}
