"use client";

import { useState, useEffect } from "react";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSearchParams } from "next/navigation";
import { AuthService } from "@/lib/supabase/auth-service";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";

export function VerifyOtp() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const isExistingUser = searchParams.get("existing") === "true";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const token = formData.get("token") as string;

    if (!phone) {
      setError("Phone number is missing. Please start over.");
      setIsLoading(false);
      return;
    }

    if (!token || token.length < 4) {
      setError("Please enter a valid OTP.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await AuthService.verifyOtp(phone, token);

      if (!response.success) {
        setError(response.error || response.message);
        toast({
          title: "Verification Failed",
          description: response.error || response.message,
          variant: "destructive",
        });
      } else if (response.data) {
        // Store user session in localStorage for prototype
        const userSession = {
          id: response.data.user.id,
          name: response.data.user.fullname || "New User",
          email: response.data.user.email || phone,
          avatar:
            response.data.user.avatar ||
            `https://picsum.photos/seed/${phone}/100`,
          role:
            response.data.user.user_type === "salon"
              ? "SALON_ADMIN"
              : "CUSTOMER",
          salonId: response.data.user.user_type === "salon" ? "salon_01" : null,
          phone: response.data.user.phone_number,
          userType: response.data.user.user_type,
        };

        localStorage.setItem("session", JSON.stringify(userSession));
        
        // Dispatch custom event to notify layout provider
        window.dispatchEvent(new CustomEvent("authStateChanged", { detail: userSession }));
        
        setIsSuccess(true);
        toast({
          title: isExistingUser ? "Welcome Back!" : "Account Created!",
          description: isExistingUser
            ? "You have been logged in successfully"
            : "Your account has been created successfully",
        });

        // Redirect to dashboard - force refresh if already on home page
        setTimeout(() => {
          if (window.location.pathname === "/") {
            window.location.reload();
          } else {
            router.push("/");
          }
        }, 1000);
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!phone || resendTimer > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.resendOtp(phone);

      if (!response.success) {
        setError(response.error || response.message);
        toast({
          title: "Error",
          description: response.error || response.message,
          variant: "destructive",
        });
      } else {
        setResendTimer(60); // 60 seconds cooldown
        toast({
          title: "OTP Resent",
          description: response.message,
        });
      }
    } catch (err) {
      const errorMessage = "Failed to resend OTP. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm bg-black/30 border-golden-700/50 text-golden-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
            <CardTitle className="text-2xl font-headline text-golden-300">
              {isExistingUser ? "Login Successful!" : "Account Created!"}
            </CardTitle>
            <CardDescription className="text-golden-400/80">
              {isExistingUser
                ? "Welcome back! Redirecting to dashboard..."
                : "Your account has been created successfully. Redirecting to dashboard..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LoadingSpinner size="lg" className="text-golden-400" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm bg-black/30 border-golden-700/50 text-golden-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline text-golden-300">
            {isExistingUser ? "Welcome Back!" : "Verify OTP"}
          </CardTitle>
          <CardDescription className="text-golden-400/80">
            {isExistingUser
              ? `Enter the 6-digit code sent to ${phone} to complete your login`
              : `Enter the 6-digit code sent to ${phone} to create your account`}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                type="text"
                name="token"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                className="bg-black/50 border-golden-700/50 text-golden-200 placeholder:text-golden-400/60 text-center text-lg tracking-widest"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || isLoading}
                className="text-golden-400 hover:text-golden-300 text-sm"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </Button>
            </div>
          </CardContent>
          <CardContent className="space-y-4">
            <Button
              type="submit"
              className="w-full bg-golden-600 hover:bg-golden-700 text-purple-950"
              disabled={isLoading || otp.length < 4}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isExistingUser ? "Logging in..." : "Creating account..."}
                </>
              ) : isExistingUser ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/auth")}
              className="w-full border-golden-700/50 text-golden-300 hover:bg-golden-700/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Auth
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
