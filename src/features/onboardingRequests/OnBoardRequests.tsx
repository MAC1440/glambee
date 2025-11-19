"use client";

import * as React from "react";
import {
  ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, CheckCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OnboardingRequestsApi, OnboardingRequest } from "@/lib/api/onboardingRequestsApi";
import { AuthService } from "@/lib/supabase/auth-service";
import { supabase } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusColor } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function OnboardRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<OnboardingRequest[]>([]);
  console.log("Requests: ", requests)
  const [loading, setLoading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [acceptDialogOpen, setAcceptDialogOpen] = React.useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<OnboardingRequest | null>(null);
  const sessionData = localStorage.getItem("session");
  console.log("Session data in onboard requests: ", JSON.parse(sessionData || ''))

  // Fetch pending requests on component mount
  React.useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const allRequests = await OnboardingRequestsApi.getAllRequests(JSON.parse(sessionData || '').salonId);
        console.log("Pending requests: ", allRequests)
        setRequests(allRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast({
          title: "Error",
          description: "Failed to load onboarding requests. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [toast]);

  const openAcceptDialog = (request: OnboardingRequest) => {
    setSelectedRequest(request);
    setAcceptDialogOpen(true);
  };

  const openRejectDialog = (request: OnboardingRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  // Helper function to get current user ID
  const getCurrentUserId = async (): Promise<string> => {
    // First, try to get from localStorage session (most reliable)
    try {
      const session = sessionData ? JSON.parse(sessionData) : null;
      if (session?.id) {
        return session.id;
      }
    } catch (error) {
      console.error("Error parsing session data:", error);
    }

    // Fallback: Try to get from AuthService
    const currentUser = await AuthService.getCurrentUser();
    if (currentUser?.id) {
      return currentUser.id;
    }

    // Last resort: Try Supabase auth directly
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      return user.id;
    }

    throw new Error("Unable to get current user ID. Please log in again.");
  };

  const handleAcceptConfirm = async () => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      setAcceptDialogOpen(false);
      
      // Get current user ID (admin who is approving)
      const userId = await getCurrentUserId();

      // Generate temporary password
      const temporaryPassword = AuthService.generateTemporaryPassword();
      console.log("See temp password in props: ", temporaryPassword)
      console.log("See selected request's email in props: ", selectedRequest?.email)

      // Create auth user with email and temporary password
      const authUserResult = await AuthService.createStaffAuthUser(
        selectedRequest.email,
        temporaryPassword
      );
      console.log("New auth user result in accept confirm: ", authUserResult)

      // Accept the request even if user creation failed (due to email config)
      // Only throw error if it's not an email configuration issue
      if (!authUserResult.success) {
        // If it's an email error, we still want to approve the request
        if (authUserResult.warning) {
          // Email error - approve anyway, user will be created later
        } else {
          // Real error - don't approve
          throw new Error(authUserResult.error || "Failed to create auth user");
        }
      }

      // Accept the request and link auth_user_id in a single call (if user was created)
      const updatedRequest = await OnboardingRequestsApi.acceptRequest(
        selectedRequest.id,
        userId,
        authUserResult.data?.userId || undefined // undefined if user wasn't created yet
      );
      console.log("Updated request: ", updatedRequest)

      // Remove from list (or update status)
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: "approved" as const, auth_user_id: authUserResult.data?.userId || "" }
            : r
        )
      );
      
      // Build toast message
      if (authUserResult.warning) {
        // User creation failed due to email config - show critical warning
        toast({
          title: "⚠️ Request Approved (User Creation Failed)",
          description: `${selectedRequest.email} has been approved, but auth user could not be created because email service is not configured. Temporary password: ${temporaryPassword} - Save this password. User cannot login until email is configured in Supabase.`,
          variant: "destructive",
          duration: 20000, // Show longer so admin can read and copy password
        });
      } else if (authUserResult.success && authUserResult.data?.userId) {
        // User created successfully
        toast({
          title: "✅ Request Accepted",
          description: `${selectedRequest.email} has been approved. Temporary password: ${temporaryPassword}. User can now login.`,
          variant: "default",
          duration: 12000,
        });
      } else {
        // Fallback
        toast({
          title: "✅ Request Accepted",
          description: `${selectedRequest.email} has been approved. Temporary password: ${temporaryPassword}.`,
          variant: "default",
        });
      }
      
      setSelectedRequest(null);
    } catch (error: any) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      setRejectDialogOpen(false);
      
      // Get current user ID
      const userId = await getCurrentUserId();

      // Reject the request
      await OnboardingRequestsApi.rejectRequest(selectedRequest.id, userId);
      
      // Update the list to reflect rejection
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: "rejected" as const }
            : r
        )
      );
      
      toast({
        title: "Request Rejected",
        description: `${selectedRequest.email} has been rejected.`,
        variant: "destructive",
      });
      
      setSelectedRequest(null);
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<OnboardingRequest>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.getValue("email")}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({row}) => {
        console.log("Row: ", row)
        const status = row.getValue("status") as string;
        return (
          <div className="flex justify-center">
            <Badge variant="outline" className={cn(getStatusColor(status))}>{status.toUpperCase()}</Badge>
          </div>
        );
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const request = row.original;
        const isProcessed = request.status === "approved" || request.status === "rejected";

        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => openAcceptDialog(request)}
                    disabled={loading || isProcessed}
                  >
                    <CheckCircle />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Accept Request</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => openRejectDialog(request)}
                    disabled={loading || isProcessed}
                  >
                    <XCircle />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reject Request</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  // Filter to show only pending requests (or all if you want to show all)
  // const allRequests = requests.filter((r) => r.status === "pending" || !r.status);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">Onboard Requests</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage staff onboarding requests.
          </p>
        </div>
      </div>

      {/* <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Accept or reject staff member onboarding requests by email.
          </CardDescription>
        </CardHeader>
        <CardContent> */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading requests...</p>
            </div>
          </div>
          ) : requests.length > 0 ? (
            <DataTable columns={columns as any} data={requests} />
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No pending requests.</p>
            </div>
          )}
        {/* </CardContent>
      </Card> */}

      {/* Accept Confirmation Dialog */}
      <AlertDialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept the onboarding request for <strong>{selectedRequest?.email}</strong>?
              This will approve the request and allow the user to complete their profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAcceptConfirm} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the onboarding request for <strong>{selectedRequest?.email}</strong>?
              This action cannot be undone, but the user can submit a new request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectConfirm} 
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}