
import { StatCards } from "./StatCards";
import { AppointmentsTable } from "./AppointmentsTable";
import { QuickActions } from "./QuickActions";
import { Card } from "@/components/ui/card";

export function Dashboard() {
  return (
    <div className="container mx-auto p-4 flex flex-col gap-6">
      {/* Top row: Stats */}
      <StatCards />

      {/* Second row: Appointments + Quick Actions */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <AppointmentsTable />
        <Card>
          <QuickActions />
        </Card>
      </div>
    </div>
  );
}
