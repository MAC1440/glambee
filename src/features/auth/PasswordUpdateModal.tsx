"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PasswordUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  userEmail: string;
}

export function PasswordUpdateModal({
  open,
  onOpenChange,
  onComplete,
  userEmail,
}: PasswordUpdateModalProps) {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset all form states
  const resetForm = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsLoading(false);
  };

  // Handle modal close
  const handleClose = () => {
    // Don't allow closing while password is being updated
    if (isLoading) {
      return;
    }
    
    resetForm();
    onOpenChange(false);
  };

  const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (password.length < 8) {
      return { isValid: false, error: "Password must be at least 8 characters long" };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: "Password must contain at least one uppercase letter" };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: "Password must contain at least one lowercase letter" };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: "Password must contain at least one number" };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, error: "Password must contain at least one special character" };
    }
    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.error || "Invalid password");
      return;
    }

    try {
      setIsLoading(true);

      // First, ensure we have an active session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Current session in password update modal: ", currentSession)
      
      if (!currentSession) {
        throw new Error("No active session. Please log in again.");
      }

      // Update password and metadata in a single call
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          password_updated: true,
          password_updated_at: new Date().toISOString(),
        },
      });
      console.log("Updated password data: ", updateData)
      console.log("Updated password error: ", updateError)

      if (updateError) {
        throw updateError;
      }

      // After password update, refresh the session to ensure it's valid
      // This is important because Supabase may invalidate the old session
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.warn("Session refresh warning:", refreshError);
        // Not critical - password was updated, session might still be valid
      }

      // Verify the password update was successful
      if (!updateData?.user) {
        throw new Error("Password update failed - no user data returned");
      }

      // Verify metadata was set correctly
      if (updateData.user.user_metadata?.password_updated !== true) {
        console.warn("Password update metadata not set correctly, but password may still be updated");
      }

      // Log successful password update for debugging
      console.log("Password updated successfully:", {
        userId: updateData.user.id,
        email: updateData.user.email,
        passwordUpdated: updateData.user.user_metadata?.password_updated,
      });

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated. You can now use this password for future logins.",
        className: "border-green-500 bg-green-50 text-green-900",
      });

      // Clear form
      resetForm();

      // Call completion handler
      onComplete();
    } catch (err: any) {
      console.error("Error updating password:", err);
      setError(err.message || "Failed to update password. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => {
          // Prevent closing by clicking outside while loading
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with Escape key while loading
          if (isLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Update Your Password</DialogTitle>
          <DialogDescription>
            For security reasons, please update your password on first login.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

