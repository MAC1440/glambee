"use client";

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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SalonFlowLogo } from "@/components/icons";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/supabase/auth-service";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber, extractPhoneNumber, validatePhoneNumber, getPhonePlaceholder } from "@/lib/phone-utils";

export function Auth() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setFormattedPhone(formatted);
    setPhone(formatted);
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const phoneNumber = formData.get("phone") as string;

    // Enhanced phone number validation
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      setError(validation.error || "Please enter a valid phone number.");
      setIsLoading(false);
      return;
    }

    // Extract clean phone number for API
    const cleanPhoneNumber = extractPhoneNumber(phoneNumber);

    try {
      // Check if user exists
      const userExists = await AuthService.checkUserExists(cleanPhoneNumber);
      
      if (userExists) {
        // User exists, login directly without OTP
        const loginResponse = await AuthService.directLogin(cleanPhoneNumber);
        console.log('loginResponse', loginResponse);
        
        if (loginResponse.success && loginResponse.data) {
          // Create user session
          const userSession = {
            id: loginResponse.data.id,
            name: loginResponse.data.fullname || "User",
            email: loginResponse.data.email || phoneNumber,
            avatar: loginResponse.data.avatar || `https://picsum.photos/seed/${phoneNumber}/100`,
            role: (loginResponse.data.user_type === 'salon' ? "SALON_ADMIN" : "SUPER_ADMIN") as 'SUPER_ADMIN' | 'SALON_ADMIN',
            salonId: loginResponse.data.user_type === 'salon' ? "salon_01" : null,
            phone: loginResponse.data.phone_number,
            userType: loginResponse.data.user_type,
          };
          
          localStorage.setItem("session", JSON.stringify(userSession));
          
          // Dispatch custom event to notify layout provider
          window.dispatchEvent(new CustomEvent("authStateChanged", { detail: userSession }));
          
          // Redirect to dashboard immediately
          router.push("/dashboard");
          
          toast({
            title: "Welcome Back!",
            description: "You have been logged in successfully",
          });
        } else {
          setError(loginResponse.error || "Login failed");
          toast({
            title: "Login Failed",
            description: loginResponse.error || "Unable to login. Please try again.",
            variant: "destructive",
          });
        }
        } else {
          // User doesn't exist, send OTP for signup
          const response = await AuthService.sendOtp(cleanPhoneNumber);
        
        if (!response.success) {
          setError(response.error || response.message);
          toast({
            title: "Error",
            description: response.error || response.message,
            variant: "destructive",
          });
        } else {
          setPhone(cleanPhoneNumber);
          toast({
            title: "OTP Sent",
            description: response.message,
          });
          router.push(`/auth/verify?phone=${encodeURIComponent(cleanPhoneNumber)}&existing=false`);
        }
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

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm bg-black/30 border-green-700/50 text-green-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SalonFlowLogo className="h-12 w-12 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-headline text-green-300">Welcome to SalonFlow</CardTitle>
          <CardDescription className="text-green-400/80">
            Enter your phone number to get started or sign in.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                value={formattedPhone}
                onChange={handlePhoneChange}
                placeholder="+921212121212"
                className="bg-black/50 border-green-700/50 text-green-200 placeholder:text-green-400/60"
              />
              <p className="text-xs text-green-400/60">
                Enter your phone number with country code (e.g., +92 for Pakistan)
              </p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-purple-950"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Checking...
                </>
              ) : (
                "Continue"
              )}
            </Button>
            <div className="text-sm text-center text-green-400/80">
              We'll send you a verification code via SMS
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
