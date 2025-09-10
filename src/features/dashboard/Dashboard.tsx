
import { StatCards } from "./StatCards";
import { AppointmentsTable } from "./AppointmentsTable";
import { QuickActions } from "./QuickActions";

export function Dashboard() {
  return (
    <div className="container mx-auto p-4 flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCards />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <div className="border rounded-lg p-4">
          <AppointmentsTable />
        </div>
        <div className="border rounded-lg p-4">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
