import { StatCards } from "./StatCards";
import { AppointmentsTable } from "./AppointmentsTable";
import { QuickActions } from "./QuickActions";
import { Card } from "@/components/ui/card";

export function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <StatCards />
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AppointmentsTable />
        </div>
        <Card>
          <QuickActions />
        </Card>
      </div>
    </div>
  );
}
