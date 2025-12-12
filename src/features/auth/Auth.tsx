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
import { useRouter, useSearchParams } from "next/navigation";
import { AuthService } from "@/lib/supabase/auth-service";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber, extractPhoneNumber, validatePhoneNumber, getPhonePlaceholder } from "@/lib/phone-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalonsApi } from "@/lib/api/salonsApi";
// Onboarding requests feature removed - staff must exist in both auth and salons_staff
// import { OnboardingRequestsApi } from "@/lib/api/onboardingRequestsApi";
// Profile creation modal commented out - will be handled differently in future
// import { CompleteStaffProfile } from "./CompleteStaffProfile";
import { PasswordUpdateModal } from "./PasswordUpdateModal";
import { supabase } from "@/lib/supabase/client";

export function Auth() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [selectedSalonId, setSelectedSalonId] = useState<string>("");
  const [selectedSalonName, setSelectedSalonName] = useState<string>("");
  // Profile creation modal commented out - will be handled differently in future
  // const [showProfileModal, setShowProfileModal] = useState(false);
  // const [profileModalData, setProfileModalData] = useState<{
  //   authUserId: string;
  //   salonId: string;
  //   userEmail: string;
  // } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [preSelectedSalonId, setPreSelectedSalonId] = useState<string | null>(null);
  const [tempLoginSession, setTempLoginSession] = useState<{
    user: any;
    session: any;
    staffRecord: any;
  } | null>(null);
  const searchParams = useSearchParams();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // Check for pre-selected salon from URL parameters
  useEffect(() => {
    const salonIdParam = searchParams?.get("salonId");
    const staffEmailParam = searchParams?.get("staffEmail");

    if (salonIdParam) {
      setPreSelectedSalonId(salonIdParam);
      setSelectedSalonId(salonIdParam);

      // Pre-fill email if provided
      if (staffEmailParam) {
        setEmail(staffEmailParam);
      }

      // Load salon name for display
      const loadSalonName = async () => {
        try {
          const salon = await SalonsApi.getSalonById(salonIdParam);
          if (salon) {
            setSelectedSalonName(salon.name || "Selected Salon");
          }
        } catch (error) {
          console.error("Error loading salon name:", error);
          setSelectedSalonName("Selected Salon");
        }
      };
      loadSalonName();
    }
  }, [searchParams]);

  // Salon is always pre-selected from URL, no need to load all salons

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setFormattedPhone(formatted);
    setPhone(formatted);
    setError(null); // Clear error when user starts typing
  };

  const handleSalonSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      console.log("Existing user: ", userExists)

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
            salonId: loginResponse.data.salon?.id || null,
            phone: loginResponse.data.phone_number,
            userType: loginResponse.data.user_type,
            salon: loginResponse.data.salon || null,
            clients: loginResponse.data.clients || []
          };

          localStorage.setItem("session", JSON.stringify(userSession));

          // Dispatch custom event to notify layout provider
          window.dispatchEvent(new CustomEvent("authStateChanged", { detail: userSession }));

          // Redirect to dashboard immediately
          router.push("/dashboard");

          toast({
            title: "Welcome Back!",
            description: "You have been logged in successfully",
            style: {
              backgroundColor: "lightgreen",
              color: "black",
            }
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

  const handleStaffSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      // Sign in staff - validates user exists in both auth.users and salons_staff tables
      // Note: salonId is optional - if not provided, we'll use the salon_id from staffRecord after login
      const loginResponse = await AuthService.signInStaff(email, password);
      console.log("Login response: ", loginResponse)

      if (!loginResponse.success) {
        // Login failed - show error (user doesn't exist in auth or salons_staff)
        setError(loginResponse.error || "Login failed. Please check your credentials.");
        toast({
          title: "Login Failed",
          description: loginResponse.error || "Unable to login. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { user, session, staffRecord, clients } = loginResponse.data!;

      // Check if password needs to be updated (first login)
      // Store session temporarily to use after password update
      const tempSession = {
        user,
        session,
        staffRecord,
      };

      const passwordUpdated = user.user_metadata?.password_updated;
      if (!passwordUpdated) {
        // Store temp session in component state for use after password update
        setTempLoginSession(tempSession);
        // Show password update modal
        setShowPasswordModal(true);
        setIsLoading(false);
        return;
      }

      // Profile creation flow commented out - will be handled differently in future
      // if (needsProfileCompletion) {
      //   setProfileModalData({
      //     authUserId: user.id,
      //     salonId: selectedSalonId,
      //     userEmail: user.email || email,
      //   });
      //   setShowProfileModal(true);
      //   setIsLoading(false);
      //   return;
      // }

      // Proceed to dashboard - staffRecord is guaranteed to exist at this point
      // Use salon_id from staffRecord (from database) - this is the source of truth
      // If staffRecord doesn't have salon_id, that's a data issue
      const salonIdFromRecord = staffRecord.salon_id;

      if (!salonIdFromRecord) {
        // Staff record exists but has no salon_id - this shouldn't happen but handle gracefully
        setError("Staff account is not associated with a salon. Please contact your administrator.");
        toast({
          title: "Account Error",
          description: "Your account is not associated with a salon. Please contact your administrator.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userSession = {
        id: staffRecord.id,
        name: staffRecord.name || "Staff Member",
        email: (staffRecord as any).email || user.email || email,
        avatar: staffRecord.avatar || null,
        role: staffRecord.role || "STAFF",
        salonId: salonIdFromRecord, // Always use salon_id from staffRecord (database)
        phone: staffRecord.phone_number,
        userType: "staff",
        clients: clients
      };

      localStorage.setItem("session", JSON.stringify(userSession));
      window.dispatchEvent(new CustomEvent("authStateChanged", { detail: userSession }));

      router.push("/dashboard");

      toast({
        title: "Welcome Back!",
        description: "You have been logged in successfully",
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
      });
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred. Please try again.";
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

  // Profile completion handler commented out - will be handled differently in future
  // const handleProfileComplete = async () => {
  //   setShowProfileModal(false);
  //   setProfileModalData(null);
  //   
  //   // Refresh and redirect to dashboard
  //   const { data: { user } } = await supabase.auth.getUser();
  //   if (user) {
  //     const { data: staffRecord } = await supabase
  //       .from("salons_staff")
  //       .select("*")
  //       .eq("id", user.id)
  //       .single();

  //     if (staffRecord) {
  //       const userSession = {
  //         id: staffRecord.id,
  //         name: staffRecord.name || "Staff Member",
  //         email: (staffRecord as any).email || user.email,
  //         avatar: staffRecord.avatar || null,
  //         role: staffRecord.role || "STAFF",
  //         salonId: staffRecord.salon_id,
  //         phone: staffRecord.phone_number,
  //         userType: "staff",
  //       };

  //       localStorage.setItem("session", JSON.stringify(userSession));
  //       window.dispatchEvent(new CustomEvent("authStateChanged", { detail: userSession }));

  //       router.push("/dashboard");
  //     }
  //   }
  // };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-green-950 via-green-900 to-green-950">
      <div className="w-full max-w-md">
        <Tabs defaultValue="salon" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="salon">Login as Business</TabsTrigger>
            <TabsTrigger value="staff">Login as Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="salon" className="mt-0">
            <Card className="w-full bg-black/30 border-green-700/50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <SalonFlowLogo className="h-12 w-12 text-green-400" src="/partner app store logo.png" />
                </div>
                <CardTitle className="text-2xl font-headline text-white-300">Welcome to GlamBee Software Management System</CardTitle>
                <CardDescription className="text-white-400/80">
                  Enter your phone number to get started or sign in.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSalonSubmit}>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-white-200">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formattedPhone}
                      onChange={handlePhoneChange}
                      placeholder="+921212121212"
                      className="bg-black/50 border-green-700/50 text-green-200 placeholder:text-green-400/60"
                    />
                    <p className="text-xs text-white-400/60">
                      Enter your phone number with country code (e.g., +92 for Pakistan)
                    </p>
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white-950"
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
                  <div className="text-sm text-center text-white-400/80">
                    We'll send you a verification code via SMS
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="mt-0">
            <Card className="w-full bg-black/30 border-green-700/50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <SalonFlowLogo className="h-12 w-12 text-green-400" src="/partner app store logo.png" />
                </div>
                <CardTitle className="text-2xl font-headline text-white-300">Welcome to GlamBee Software Management System</CardTitle>
                <CardDescription className="text-white-400/80">
                  Enter your email and password to sign in.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleStaffSubmit}>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white-200">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={email || ""}
                      onChange={handleEmailChange}
                      placeholder="example@example.com"
                      className="bg-black/50 border-green-700/50 text-white-200 placeholder:text-white-400/60"
                    />
                    {!email &&
                      <p className="text-xs text-white-400/60">
                        Enter your email address
                      </p>
                    }
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white-200">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      value={password || ""}
                      onChange={handlePasswordChange}
                      placeholder="********"
                      className="bg-black/50 border-green-700/50 text-white-200 placeholder:text-white-400/60"
                    />
                    {!password &&
                      <p className="text-xs text-white-400/60">
                        Enter your password
                      </p>
                    }
                  </div>
                  {/* Show salon field only if pre-selected from URL (first-time login via email link) */}
                  {selectedSalonId && (
                    <div className="grid gap-2">
                      <Label htmlFor="salon" className="text-white-200">Salon</Label>
                      <Input
                        id="salon"
                        type="text"
                        value={selectedSalonName || "Loading salon..."}
                        disabled={true}
                        placeholder="Salon will be pre-selected"
                        className="bg-black/50 border-green-700/50 text-white-200 placeholder:text-white-400/60 cursor-not-allowed opacity-70"
                      />
                      {/* <p className="text-xs text-white-400/60">
                        Salon has been pre-selected for you and cannot be changed
                      </p> */}
                    </div>
                  )}

                  {/* Show info message for existing staff logging in without email link */}
                  {!selectedSalonId && (
                    <div className="rounded-md bg-blue-950/50 border border-blue-700/50 p-3">
                      <p className="text-xs text-blue-200">
                        💡 <strong>Existing Staff?</strong> You can log in with your email and password. Your salon will be automatically detected.
                      </p>
                    </div>
                  )}
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white-950"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  <div className="text-sm text-center text-white-400/80">
                    Use your credentials to access your account
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Completion Modal - Commented out - will be handled differently in future */}
      {/* {showProfileModal && profileModalData && (
        <CompleteStaffProfile
          open={showProfileModal}
          onComplete={handleProfileComplete}
          authUserId={profileModalData.authUserId}
          salonId={profileModalData.salonId}
          userEmail={profileModalData.userEmail}
        />
      )} */}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <PasswordUpdateModal
          open={showPasswordModal}
          onOpenChange={(open) => {
            setShowPasswordModal(open);
          }}
          onComplete={async () => {
            setShowPasswordModal(false);
            setIsLoading(true);

            // After password update, continue with the stored session
            try {
              // Get the stored session from before password update
              if (!tempLoginSession) {
                // If no temp session, user needs to login again
                setError("Password updated. Please login again with your new password.");
                toast({
                  title: "Password Updated",
                  description: "Please login again with your new password.",
                });
                setIsLoading(false);
                return;
              }

              const { user, staffRecord } = tempLoginSession;
              // Clear temp session
              setTempLoginSession(null);

              // Proceed to dashboard - staffRecord is guaranteed to exist at this point
              // Use salon_id from staffRecord (from database) - this is the source of truth
              const salonIdFromRecord = staffRecord.salon_id;

              if (!salonIdFromRecord) {
                // Staff record exists but has no salon_id - this shouldn't happen but handle gracefully
                setError("Staff account is not associated with a salon. Please contact your administrator.");
                toast({
                  title: "Account Error",
                  description: "Your account is not associated with a salon. Please contact your administrator.",
                  variant: "destructive",
                });
                setIsLoading(false);
                return;
              }

              const userSession = {
                id: staffRecord.id,
                name: staffRecord.name || "Staff Member",
                email: (staffRecord as any).email || user.email || email,
                avatar: staffRecord.avatar || null,
                role: staffRecord.role || "STAFF",
                salonId: salonIdFromRecord, // Always use salon_id from staffRecord (database)
                phone: staffRecord.phone_number,
                userType: "staff",
              };

              localStorage.setItem("session", JSON.stringify(userSession));
              window.dispatchEvent(new CustomEvent("authStateChanged", { detail: userSession }));

              router.push("/dashboard");

              toast({
                title: "Welcome!",
                description: "Password updated and logged in successfully",
                style: {
                  backgroundColor: "lightgreen",
                  color: "black",
                }
              });
            } catch (err: any) {
              setError(err.message || "Failed to complete login. Please try again.");
              toast({
                title: "Error",
                description: err.message || "Failed to complete login. Please try again.",
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          }}
          userEmail={email}
        />
      )}
    </div>
  );
}
