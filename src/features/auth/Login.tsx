
"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SalonFlowLogo } from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { users } from "@/lib/placeholder-data";

export function Login() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setServerError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // For prototyping, we'll find the user and store it in localStorage
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem("session", JSON.stringify(user));
      router.refresh();
      router.push("/");
    } else {
      setServerError("Invalid email or password.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm bg-black/30 border-golden-700/50 text-golden-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SalonFlowLogo className="h-12 w-12 text-golden-400" />
          </div>
          <CardTitle className="text-2xl font-headline text-golden-300">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-golden-400/80">
            Enter your credentials to sign in.
            <br />
            <small>Try: super@admin.com / password</small>
            <br />
            <small>or: salon@admin.com / password</small>
          </CardDescription>
        </CardHeader>
        
        {serverError && (
          <div className="px-6 pb-4">
            <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-white">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-golden-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
                className="bg-black/50 border-golden-700/50 text-golden-200 placeholder:text-golden-400/60"
                defaultValue="super@admin.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                className="bg-black/50 border-golden-700/50 text-golden-200 placeholder:text-golden-400/60"
                defaultValue="password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-golden-600 hover:bg-golden-700 text-purple-950" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>

        <div className="text-sm text-center text-golden-400/80 pb-6">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="underline text-golden-300 hover:text-golden-200"
          >
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}
