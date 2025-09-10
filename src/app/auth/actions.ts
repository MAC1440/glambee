
"use server";

import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signInWithPhoneOtp(formData: FormData) {
  const supabase = createClient();
  const phone = formData.get("phone") as string;

  if (!phone) {
    return { error: "Phone number is required." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) {
    console.error("OTP Error:", error);
    return { error: "Could not send OTP. Please check the phone number." };
  }

  return { error: null };
}

export async function verifyPhoneOtp(formData: FormData) {
  const supabase = createClient();
  const phone = formData.get("phone") as string;
  const token = formData.get("token") as string;

  if (!phone || !token) {
    return { error: "Phone number and OTP are required.", success: false };
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    console.error("Verify OTP Error:", error);
    return { error: "Invalid OTP. Please try again.", success: false };
  }

  if (!session) {
    return {
      error: "Could not create session. Please try again.",
      success: false,
    };
  }

  revalidatePath("/", "layout");
  return { error: null, success: true };
}


export async function signup(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return redirect("/signup?message=Could not create user");
  }

  return redirect("/auth/confirm");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
