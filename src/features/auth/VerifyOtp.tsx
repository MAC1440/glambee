
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function VerifyOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const token = formData.get("token") as string;

    if (phone && token) {
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (error) {
        setError(error.message);
      } else if (session) {
        router.push("/");
      }
    } else {
      setError("Phone number or token is missing.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm bg-black/30 border-golden-700/50 text-golden-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline text-golden-300">
            Verify OTP
          </CardTitle>
          <CardDescription className="text-golden-400/80">
            Enter the OTP sent to your phone number.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="token">OTP</Label>
              <Input
                id="token"
                type="text"
                name="token"
                required
                className="bg-black/50 border-golden-700/50 text-golden-200 placeholder:text-golden-400/60"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardContent>
            <Button
              type="submit"
              className="w-full bg-golden-600 hover:bg-golden-700 text-purple-950"
            >
              Verify
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
