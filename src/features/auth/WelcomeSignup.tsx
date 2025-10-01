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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Phone, ArrowRight, CheckCircle, XCircle } from "lucide-react";

export function WelcomeSignup() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  // Auto-format phone number to start with +
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If it doesn't start with +, add it
    if (digits && !value.startsWith('+')) {
      return '+' + digits;
    }
    
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError(null);
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    // Remove all non-digits for validation
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Must start with + and have 10-15 digits total
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phoneNumber);
  };

  const checkUserExists = async (phoneNumber: string): Promise<boolean> => {
    try {
      return await AuthService.checkUserExists(phoneNumber);
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    setIsCheckingUser(true);

    if (!phone) {
      setError("Phone number is required.");
      setIsLoading(false);
      setIsCheckingUser(false);
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setError("Please enter a valid phone number with country code (e.g., +1234567890).");
      setIsLoading(false);
      setIsCheckingUser(false);
      return;
    }

    try {
      // Check if user already exists
      const userExists = await checkUserExists(phone);
      
      if (userExists) {
        // User exists - send OTP for verification
        const loginResponse = await AuthService.directLogin(phone);
        
        if (loginResponse.success) {
          toast({
            title: "Welcome Back!",
            description: loginResponse.message,
          });
          router.push(`/auth/verify?phone=${encodeURIComponent(phone)}&existing=true`);
        } else {
          setError(loginResponse.error || loginResponse.message);
          toast({
            title: "Login Error",
            description: loginResponse.error || loginResponse.message,
            variant: "destructive",
          });
        }
      } else {
        // New user - send OTP
        const response = await AuthService.sendOtp(phone);

        if (!response.success) {
          setError(response.error || response.message);
          toast({
            title: "Error",
            description: response.error || response.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "OTP Sent",
            description: response.message,
          });
          router.push(`/auth/verify?phone=${encodeURIComponent(phone)}`);
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
      setIsCheckingUser(false);
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
            Welcome to SalonFlow
          </CardTitle>
          <CardDescription className="text-golden-400/80">
            Enter your phone number to get started with your beauty journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-golden-300">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-golden-400/60" />
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+1234567890"
                  required
                  className="bg-black/50 border-golden-700/50 text-golden-200 placeholder:text-golden-400/60 pl-10"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-golden-400/60">
                Include country code (e.g., +1 for US, +44 for UK)
              </p>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <XCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-golden-600 hover:bg-golden-700 text-purple-950"
              disabled={isLoading || !phone}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isCheckingUser ? "Checking..." : "Sending OTP..."}
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continue
                </>
              )}
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-golden-400/60">
                Already have an account? Just enter your phone number above
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
