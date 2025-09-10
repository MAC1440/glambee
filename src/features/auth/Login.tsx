
"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { signInWithPhoneOtp, verifyPhoneOtp } from "@/app/auth/actions";
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
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export function Login() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const initialPhone = searchParams.get("phone") || "";
  const message = searchParams.get("message");

  const [step, setStep] = useState(initialPhone ? "verify" : "login");
  const [phone, setPhone] = useState(initialPhone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);

  const handleSendOtp = async (formData: FormData) => {
    setIsSubmitting(true);
    setServerError(null);
    
    const phoneInput = formData.get("phone") as string;
    setPhone(phoneInput);
    
    const { error } = await signInWithPhoneOtp(formData);

    if (error) {
      setServerError(error);
    } else {
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your phone.",
      });
      setStep("verify");
    }
    setIsSubmitting(false);
  };
  
  useEffect(() => {
    // When retrying with an invalid OTP, phone is in the URL.
    if(initialPhone) {
      setStep("verify");
      setPhone(initialPhone);
    }
  }, [initialPhone]);


  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm bg-black/30 border-golden-700/50 text-golden-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SalonFlowLogo className="h-12 w-12 text-golden-400" />
          </div>
          <CardTitle className="text-2xl font-headline text-golden-300">
            {step === "login" ? "Welcome Back" : "Verify Your Phone"}
          </CardTitle>
          <CardDescription className="text-golden-400/80">
            {step === "login"
              ? "Enter your phone number to sign in."
              : `Enter the code sent to ${phone}`}
          </CardDescription>
        </CardHeader>

        {message && (
             <div className="px-6 pb-4">
            <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-white">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
            </Alert>
            </div>
        )}
        
        {serverError && (
            <div className="px-6 pb-4">
            <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-white">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
            </Alert>
            </div>
        )}

        {step === "login" ? (
          <form ref={formRef} action={handleSendOtp}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-golden-300">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="+15551234567"
                  required
                  className="bg-black/50 border-golden-700/50 text-golden-200 placeholder:text-golden-400/60"
                  defaultValue={phone}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-golden-600 hover:bg-golden-700 text-purple-950" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send OTP"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form action={verifyPhoneOtp}>
            <CardContent className="grid gap-4">
               <input type="hidden" name="phone" value={phone} />
              <div className="grid gap-2">
                <Label htmlFor="token" className="text-golden-300">
                  Verification Code
                </Label>
                <Input
                  id="token"
                  type="text"
                  name="token"
                  placeholder="123456"
                  required
                  className="bg-black/50 border-golden-700/50 text-golden-200 placeholder:text-golden-400/60"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-golden-600 hover:bg-golden-700 text-purple-950">
                Verify & Sign In
              </Button>
               <Button variant="link" onClick={() => setStep("login")} className="text-golden-300">
                Use a different phone number
              </Button>
            </CardFooter>
          </form>
        )}

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
