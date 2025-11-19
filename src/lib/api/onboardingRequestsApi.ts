import { supabase } from "@/lib/supabase/client";

// Temporary type assertion until Supabase types are regenerated
const getOnboardingRequestsTable = () => (supabase as any).from("onboarding_requests");

export interface OnboardingRequest {
  id: string;
  email: string;
  salon_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  auth_user_id: string | null;
}

export interface OnboardingRequestInsert {
  email: string;
  salon_id: string;
  status?: "pending" | "approved" | "rejected";
}

export interface OnboardingRequestUpdate {
  status?: "pending" | "approved" | "rejected";
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  auth_user_id?: string | null;
}

export class OnboardingRequestsApi {
  /**
   * Create a new onboarding request
   */
  static async createRequest(
    email: string,
    salonId: string
  ): Promise<OnboardingRequest> {
    try {
      // Check if request already exists
      const { data: existingRequest } = await getOnboardingRequestsTable()
        .select("*")
        .eq("email", email)
        .eq("salon_id", salonId)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === "pending") {
          throw new Error("A pending request already exists for this email and salon.");
        } 
        // else if (existingRequest.status === "approved") {
        //   throw new Error("This request has already been approved. Please try logging in.");
        // } 
        else if (existingRequest.status === "rejected") {
          // Allow resubmission after rejection
          const { data, error } = await getOnboardingRequestsTable()
            .update({
              status: "pending",
              rejected_at: null,
              rejected_by: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingRequest.id)
            .select()
            .single();

          if (error) throw error;
          return data as OnboardingRequest;
        }
      }

      // Create new request
      const { data, error } = await getOnboardingRequestsTable()
        .insert({
          email,
          salon_id: salonId,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create request: ${error.message}`);
      }

      return data as OnboardingRequest;
    } catch (error) {
      console.error("Error creating onboarding request:", error);
      throw error;
    }
  }

  /**
   * Get all pending requests (for admin)
   */
  static async getAllRequests(salonId?: string): Promise<OnboardingRequest[]> {
    try {
      let query = getOnboardingRequestsTable()
        .select("*")
        // .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (salonId) {
        query = query.eq("salon_id", salonId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch requests: ${error.message}`);
      }

      return (data || []) as OnboardingRequest[];
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      throw error;
    }
  }

  /**
   * Get request by email and salon
   */
  static async getRequestByEmailAndSalon(
    email: string,
    salonId: string
  ): Promise<OnboardingRequest | null> {
    try {
      const { data, error } = await getOnboardingRequestsTable()
        .select("*")
        .eq("email", email)
        .eq("salon_id", salonId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw new Error(`Failed to fetch request: ${error.message}`);
      }

      return data as OnboardingRequest | null;
    } catch (error) {
      console.error("Error fetching request:", error);
      throw error;
    }
  }

  /**
   * Accept request (admin only)
   * Optionally updates auth_user_id if provided
   */
  static async acceptRequest(
    requestId: string,
    approvedBy: string,
    authUserId?: string
  ): Promise<OnboardingRequest> {
    try {
      const updateData: any = {
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
        updated_at: new Date().toISOString(),
      };

      // Include auth_user_id if provided
      if (authUserId) {
        updateData.auth_user_id = authUserId;
      }

      const { data, error } = await getOnboardingRequestsTable()
        .update(updateData)
        .eq("id", requestId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to accept request: ${error.message}`);
      }

      return data as OnboardingRequest;
    } catch (error) {
      console.error("Error accepting request:", error);
      throw error;
    }
  }

  /**
   * Reject request (admin only)
   */
  static async rejectRequest(
    requestId: string,
    rejectedBy: string
  ): Promise<OnboardingRequest> {
    try {
      const { data, error } = await getOnboardingRequestsTable()
        .update({
          status: "rejected",
          rejected_at: new Date().toISOString(),
          rejected_by: rejectedBy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to reject request: ${error.message}`);
      }

      return data as OnboardingRequest;
    } catch (error) {
      console.error("Error rejecting request:", error);
      throw error;
    }
  }

  /**
   * Update request with auth_user_id after auth user is created
   */
  static async updateAuthUserId(
    requestId: string,
    authUserId: string
  ): Promise<OnboardingRequest> {
    try {
      const { data, error } = await getOnboardingRequestsTable()
        .update({
          auth_user_id: authUserId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update request: ${error.message}`);
      }

      return data as OnboardingRequest;
    } catch (error) {
      console.error("Error updating auth_user_id:", error);
      throw error;
    }
  }
}
