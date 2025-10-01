
"use server";

import { redirect } from "next/navigation";
import { users } from "@/lib/placeholder-data";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return { error: "Invalid email or password." };
  }

  // In a real app, you'd create a session here.
  // For prototyping, we'll handle this on the client.
  return { user };
}

export async function logout() {
  // In a real app, you'd destroy the session here.
  // For prototyping, we'll clear local storage on the client.
  redirect("/auth");
}

export async function signup(formData: FormData) {
  // This is a placeholder for prototyping.
  // In a real app, you would create a new user.
  return redirect("/auth/confirm");
}
