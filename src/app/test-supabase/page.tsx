"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthService } from "@/lib/supabase/auth-service";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Phone, Shield } from "lucide-react";

export default function TestSupabasePage() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("+1234567890");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const user = await AuthService.getCurrentUser();
    setCurrentUser(user);
  };

  const handleSendOtp = async () => {
    if (!phone) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.sendOtp(phone);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        setStep('otp');
      } else {
        toast({
          title: "Error",
          description: response.error || response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !phone) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.verifyOtp(phone, otp);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        setStep('success');
        await checkCurrentUser();
      } else {
        toast({
          title: "Error",
          description: response.error || response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const response = await AuthService.signOut();
    if (response.success) {
      setCurrentUser(null);
      setStep('phone');
      setOtp('');
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Supabase Integration Test</h1>
          <p className="text-purple-200 text-lg">
            Test the complete Supabase authentication flow
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Test Form */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Authentication Test</CardTitle>
              <CardDescription className="text-purple-200">
                Test phone number authentication with Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 'phone' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  <Button 
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </div>
              )}

              {step === 'otp' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp" className="text-white">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 text-center text-lg tracking-widest"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.length < 4}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Verify OTP
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={() => setStep('phone')}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
                  <h3 className="text-xl font-semibold text-white">Authentication Successful!</h3>
                  <p className="text-purple-200">You are now logged in with Supabase</p>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current User Info */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Current User Status</CardTitle>
              <CardDescription className="text-purple-200">
                Real-time authentication status from Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-white font-medium">Authenticated</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-200">ID:</span>
                      <span className="text-white text-sm font-mono">{currentUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Name:</span>
                      <span className="text-white">{currentUser.fullname || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Email:</span>
                      <span className="text-white">{currentUser.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Phone:</span>
                      <span className="text-white">{currentUser.phone_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Type:</span>
                      <span className="text-white capitalize">{currentUser.user_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Created:</span>
                      <span className="text-white text-sm">
                        {new Date(currentUser.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <XCircle className="h-12 w-12 text-red-400 mx-auto" />
                  <p className="text-purple-200">No user authenticated</p>
                  <p className="text-sm text-purple-300">
                    Use the form to test authentication
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Test Instructions</CardTitle>
            <CardDescription className="text-purple-200">
              How to test the Supabase integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">1. Enter Phone</h3>
                <p className="text-sm text-purple-200">Use a real phone number with country code</p>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">2. Verify OTP</h3>
                <p className="text-sm text-purple-200">Enter the 6-digit code sent to your phone</p>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">3. Check Database</h3>
                <p className="text-sm text-purple-200">User profile is created in Supabase</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
