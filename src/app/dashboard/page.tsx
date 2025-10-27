import { Dashboard } from "@/features/dashboard/Dashboard";

export default async function DashboardPage() {
  // Dashboard component now fetches its own data dynamically
  return <Dashboard />;
}
