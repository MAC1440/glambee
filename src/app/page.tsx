import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to auth page by default
  redirect("/auth");
}
