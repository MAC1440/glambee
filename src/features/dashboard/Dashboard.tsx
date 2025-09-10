
import { AppointmentsTable } from "./AppointmentsTable";
import { QuickActions } from "./QuickActions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  CalendarCheck,
  CircleDollarSign,
  Users,
} from "lucide-react";

export function Dashboard({ users, error }: { users: any[] | null; error: any }) {
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
            <div className="text-2xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
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
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Display fetched users or error */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500">
              <p>An error occurred:</p>
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}
          {users && (
            <div>
              <p>Successfully fetched data from 'users' table:</p>
              <pre className="mt-2 bg-muted p-4 rounded-lg">{JSON.stringify(users, null, 2)}</pre>
            </div>
          )}
          {!users && !error && <p>No users found or table is empty.</p>}
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <AppointmentsTable />
        </Card>
        <Card>
          <QuickActions />
        </Card>
      </div>
    </div>
  );
}
