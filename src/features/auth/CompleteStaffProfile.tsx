"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/supabase/auth-service";
import { formatPhoneNumber, extractPhoneNumber, validatePhoneNumber } from "@/lib/phone-utils";

interface CompleteStaffProfileProps {
  open: boolean;
  onComplete: () => void;
  authUserId: string;
  salonId: string;
  userEmail: string;
}

export function CompleteStaffProfile({
  open,
  onComplete,
  authUserId,
  salonId,
  userEmail,
}: CompleteStaffProfileProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [formattedPhone, setFormattedPhone] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    address?: string;
    phone?: string;
  }>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only letters, spaces, and basic punctuation
    const sanitized = value.replace(/[^a-zA-Z\s'-]/g, "");
    setFormData((prev) => ({ ...prev, name: sanitized }));

    // Validation: not empty, not only whitespace, spaces only between words
    if (sanitized.trim().length === 0) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
    } else if (sanitized.trim().length < 2) {
      setErrors((prev) => ({ ...prev, name: "Name must be at least 2 characters" }));
    } else if (/^\s|\s$|\s{2,}/.test(sanitized)) {
      setErrors((prev) => ({ ...prev, name: "Spaces can only be between words" }));
    } else {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, address: value }));

    if (value.trim().length === 0) {
      setErrors((prev) => ({ ...prev, address: "Address is required" }));
    } else if (value.trim().length < 5) {
      setErrors((prev) => ({ ...prev, address: "Address must be at least 5 characters" }));
    } else {
      setErrors((prev) => ({ ...prev, address: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setFormattedPhone(formatted);
    setFormData((prev) => ({ ...prev, phone: formatted }));

    const validation = validatePhoneNumber(formatted);
    if (!validation.isValid) {
      setErrors((prev) => ({ ...prev, phone: validation.error || "Invalid phone number" }));
    } else {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = !formData.name.trim() ? "Name is required" :
      formData.name.trim().length < 2 ? "Name must be at least 2 characters" :
        /^\s|\s$|\s{2,}/.test(formData.name) ? "Spaces can only be between words" : undefined;

    const addressError = !formData.address.trim() ? "Address is required" :
      formData.address.trim().length < 5 ? "Address must be at least 5 characters" : undefined;

    const phoneValidation = validatePhoneNumber(formData.phone);
    const phoneError = !phoneValidation.isValid ? (phoneValidation.error || "Invalid phone number") : undefined;

    if (nameError || addressError || phoneError) {
      setErrors({
        name: nameError,
        address: addressError,
        phone: phoneError,
      });
      return;
    }

    setIsLoading(true);

    try {
      const cleanPhone = extractPhoneNumber(formData.phone);

      const result = await AuthService.createStaffRecord(authUserId, {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: cleanPhone,
        salonId,
      });

      if (result.success) {
        toast({
          title: "✅ Profile Completed",
          description: "Your profile has been created successfully.",
        });
        onComplete();
        // Reset form
        setFormData({ name: "", address: "", phone: "" });
        setFormattedPhone("");
        setErrors({});
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to complete profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing profile:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide the following information to complete your staff profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Your email address (cannot be changed)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="John Doe"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your full name (letters and spaces only)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={handleAddressChange}
                placeholder="123 Main Street, City, State, ZIP"
                rows={3}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-xs text-red-500">{errors.address}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your complete address
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formattedPhone}
                onChange={handlePhoneChange}
                placeholder="+921212121212"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your phone number with country code (e.g., +92 for Pakistan)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Profile...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

