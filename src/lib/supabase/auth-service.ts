import { ClientsApi } from '../api/clientsApi';
import { RolesApi } from '../api/rolesApi';
import { supabase } from './client';
import { Database } from './supabase';

type User = Database['public']['Tables']['users']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];
type Salon = Database['public']['Tables']['salons']['Row'];

interface SessionClients {
  id: string;
  name: string | null;
  phone_number: string | null;
}
export interface AuthUser {
  id: string;
  email: string | null;
  phone_number: string | null;
  fullname: string | null;
  avatar: string | null;
  user_type: 'salon' | 'customer';
  created_at: string;
  updated_at: string;
  salon?: Salon | null;
  clients?: SessionClients[] | [];
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
    session: any;
  };
  error?: string;
}

export interface OtpVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
    session: any;
  };
  error?: string;
}

export class AuthService {
  /**
   * Send OTP to phone number for signup/login
   */
  static async sendOtp(phone: string): Promise<SignupResponse> {
    try {
      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return {
          success: false,
          message: 'Invalid phone number format',
          error: 'Please enter a valid phone number with country code'
        };
      }

      // Send OTP using Supabase Auth
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          channel: 'sms'
        }
      });

      if (error) {
        console.error('Supabase OTP Error:', error);
        return {
          success: false,
          message: 'Failed to send OTP',
          error: error.message
        };
      }

      return {
        success: true,
        message: `OTP sent successfully to ${phone}`,
        // OTP response doesn't include user/session until verification
        data: undefined
      };
    } catch (error) {
      console.error('Auth Service Error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify OTP and create/update user profile
   */
  static async verifyOtp(phone: string, token: string): Promise<OtpVerificationResponse> {
    try {
      // Verify OTP with Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });

      if (error) {
        console.error('Supabase OTP Verification Error:', error);
        return {
          success: false,
          message: 'Invalid OTP',
          error: error.message
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          message: 'Authentication failed',
          error: 'No user or session returned'
        };
      }

      // Create or update user profile in the users table
      const userProfile = await this.createOrUpdateUserProfile(data.user, phone);

      if (!userProfile.success) {
        return {
          success: false,
          message: 'Failed to create user profile',
          error: userProfile.error
        };
      }

      // Create customer profile if user_type is customer
      if (userProfile.data?.user_type === 'customer') {
        await this.createCustomerProfile(data.user.id, phone);
      }

      return {
        success: true,
        message: 'Phone number verified successfully',
        data: {
          user: userProfile.data!,
          session: data.session
        }
      };
    } catch (error) {
      console.error('Auth Service Error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create or update user profile in the users table
   */
  private static async createOrUpdateUserProfile(
    authUser: any,
    phone: string
  ): Promise<{ success: boolean; data?: AuthUser; error?: string }> {
    try {
      const userData = {
        id: authUser.id,
        email: authUser.email || null,
        phone_number: phone,
        fullname: authUser.user_metadata?.full_name || null,
        avatar: authUser.user_metadata?.avatar_url || null,
        user_type: 'customer' as const, // Default to customer for now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      let result;
      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update({
            phone_number: phone,
            fullname: userData.fullname,
            avatar: userData.avatar,
            updated_at: userData.updated_at
          })
          .eq('id', authUser.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        success: true,
        data: result as AuthUser
      };
    } catch (error) {
      console.error('User Profile Creation Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user profile'
      };
    }
  }

  /**
   * Create customer profile
   */
  private static async createCustomerProfile(authId: string, phone: string): Promise<void> {
    try {
      // Check if customer already exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_id', authId)
        .single();

      if (existingCustomer) {
        return; // Customer already exists
      }

      // Create new customer profile
      const customerData = {
        auth_id: authId,
        name: null,
        phone_number: phone,
        avatar: null,
        gender: null,
        activity_status: 'active',
        is_test_user: false,
        has_spinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('customers')
        .insert(customerData);

      if (error) {
        console.error('Customer Profile Creation Error:', error);
        // Don't throw error as this is not critical for auth flow
      }
    } catch (error) {
      console.error('Customer Profile Creation Error:', error);
      // Don't throw error as this is not critical for auth flow
    }
  }

  /**
   * Check if user exists by phone number
   */
  static async checkUserExists(phone: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', phone)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Check user exists error:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Check User Exists Error:', error);
      return false;
    }
  }

  /**
   * Get current user session
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Get user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile) {
        return null;
      }

      return userProfile as AuthUser;
    } catch (error) {
      console.error('Get Current User Error:', error);
      return null;
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign Out Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }


  /**
   * Resend OTP
   */
  static async resendOtp(phone: string): Promise<SignupResponse> {
    return this.sendOtp(phone);
  }

  /**
   * Direct login for existing users (without OTP)
   * 
   * FLOW EXPLANATION:
   * 1. User enters phone number
   * 2. We verify user exists in database
   * 3. We generate a Supabase session token server-side (NO OTP COST)
   * 4. We exchange the token for a Supabase session
   * 5. User is logged in with both localStorage session AND Supabase session
   * 
   * WHY THIS APPROACH?
   * - Avoids OTP costs (no SMS sent)
   * - Creates Supabase session needed for RLS policies
   * - Secure (uses service role key server-side only)
   * 
   * See docs/DIRECT_LOGIN_FLOW.md for detailed explanation
   */
  static async directLogin(phone: string): Promise<{ success: boolean; data?: AuthUser; error?: string }> {
    try {
      // Check if user exists
      const userExists = await this.checkUserExists(phone);

      if (!userExists) {
        return {
          success: false,
          error: "User not found. Please sign up first."
        };
      }

      // Get user data from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phone)
        .single();
      console.log("Check data user: ", userData)

      if (error || !userData) {
        return {
          success: false,
          error: "Failed to retrieve user data"
        };
      }

      // STEP 3: Generate Supabase session server-side (NO OTP COST)
      // This creates a session without sending SMS/email
      // Why? To avoid OTP costs while still enabling RLS policies
      try {
        // Call server API to generate session token
        // Server uses service role key (secret, never exposed to client)
        const sessionResponse = await fetch('/api/auth/generate-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userData.id }),
        });

        const sessionResult = await sessionResponse.json();

        if (sessionResult.success && sessionResult.data?.token) {
          // STEP 4: Exchange token for Supabase session
          // The token_hash method works for magic links
          const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
            token_hash: sessionResult.data.token,
            type: 'magiclink',
          });

          if (sessionError) {
            console.error('Failed to set session from token_hash:', sessionError);
            console.warn('Session creation failed - user may need to use OTP flow instead');
            // Note: Login continues, but RLS policies may fail
            // User will see errors when trying to create deals, upload images, etc.
          } else if (sessionData?.session) {
            console.log('✅ Supabase session created successfully for direct login');
            // Now auth.uid() will work in RLS policies!
          }
        } else {
          console.warn('Failed to generate session token:', sessionResult.error);
        }
      } catch (sessionErr) {
        console.error('Error generating session:', sessionErr);
        // Continue with login - but RLS policies will fail without session
      }

      // Get salon data by phone number if user_type is 'salon'
      let salonData: Salon | null = null;
      if (userData.user_type === 'salon') {
        const { data: salon, error: salonError } = await supabase
          .from('salons')
          .select('*')
          .eq('phone_number', phone)
          .maybeSingle();

        console.log("Check salonn: ", salon)
        if (!salonError && salon) {
          salonData = salon;
        }
      }

      // Transform the data to match AuthUser interface
      // If no salon then error should be there like no salon associated against this user and this user is not an owner of any salon
      if (salonData) {
        const salonClients = await ClientsApi.getCustomers({ salonId: salonData.id });
        const clients = salonClients?.data?.length > 0 ? salonClients?.data?.map((client: any) => {
          return {
            id: client.id,
            name: client.name,
            phone_number: client.phone_number,
          };
        }) : [];
        console.log("Session clients: ", clients)
        const authUser: AuthUser = {
          id: userData.id,
          email: userData.email,
          phone_number: userData.phone_number,
          fullname: userData.fullname,
          avatar: userData.avatar,
          user_type: userData.user_type as 'salon' | 'customer',
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          salon: salonData,
          clients: clients
        };

        return {
          success: true,
          data: authUser
        };
      }
      else {
        return {
          success: false,
          error: "No salon associated against this user and this user is not an owner of any salon"
        };
      }
    } catch (error) {
      console.error('Direct Login Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Sign in staff with email and password
   * Validates that user exists in both auth.users and salons_staff tables
   */
  static async signInStaff(email: string, password: string): Promise<{
    success: boolean;
    data?: {
      user: any;
      session: any;
      staffRecord: any;
      clients: any;
    };
    error?: string;
  }> {
    try {
      // Step 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("Email in auth-serice: ", email)
      console.log("Password in auth-serice: ", password)
      console.log("Auth error: ", authError)
      console.log("Auth data: ", authData)

      // If auth fails, user doesn't exist in auth.users
      if (authError || !authData.user) {
        return {
          success: false,
          error: authError?.message || "Invalid email or password. Please check your credentials.",
        };
      }

      // Step 2: Check if staff record exists in salons_staff table
      const { data: staffRecord, error: staffError } = await supabase
        .from("salons_staff")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      // If staff record doesn't exist, return error
      if (staffError || !staffRecord) {
        return {
          success: false,
          error: "Staff record not found. Please contact your administrator to set up your account.",
        };
      }

      const staffClientsPermitted = await RolesApi.getStaffPermissions(staffRecord.id);
      console.log("Staff clients permitted: ", staffClientsPermitted)

      let clients: any = [];
      if (staffRecord?.salon_id && staffClientsPermitted && staffClientsPermitted?.clients?.read) {
        const { data: clientsData } = await ClientsApi.getCustomers({ salonId: staffRecord?.salon_id });
        console.log("Clients in if...: ", clientsData)
        clients = clientsData;
      }

      // Both validations passed - user exists in auth and salons_staff
      return {
        success: true,
        data: {
          user: authData.user,
          session: authData.session,
          staffRecord: staffRecord,
          clients: clients
        },
      };
    } catch (error) {
      console.error("Staff Sign In Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  }

  /**
   * Check if staff record exists
   */
  static async checkStaffRecordExists(authUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("salons_staff")
        .select("id")
        .eq("id", authUserId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking staff record:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking staff record:", error);
      return false;
    }
  }

  /**
   * Create staff record after profile completion
   */
  static async createStaffRecord(
    authUserId: string,
    profileData: {
      name: string;
      address: string;
      phone: string;
      salonId: string;
    }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get auth user to get email
      console.log("Profile data; ", profileData)
      const { data: authUser, error: authUserError } = await supabase.auth.getUser();

      if (authUserError || !authUser.user || authUser.user.id !== authUserId) {
        return {
          success: false,
          error: "Authentication required. Please log in again.",
        };
      }

      // Use salon_id from profileData (onboarding requests feature removed)
      const salonId = profileData.salonId;

      // Create staff record
      const { data: staffRecord, error: staffError } = await supabase
        .from("salons_staff")
        .insert({
          id: authUserId,
          email: authUser.user.email,
          name: profileData.name,
          staff_address: profileData.address,
          phone_number: profileData.phone,
          salon_id: salonId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (staffError) {
        return {
          success: false,
          error: `Failed to create staff record: ${staffError.message}`,
        };
      }

      return {
        success: true,
        data: staffRecord,
      };
    } catch (error) {
      console.error("Error creating staff record:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create staff record",
      };
    }
  }

  /**
   * Get onboarding request by auth user ID
   * NOTE: Onboarding requests feature removed - this function is kept for backward compatibility but returns null
   */
  static async getOnboardingRequestByAuthUser(authUserId: string): Promise<any | null> {
    // Onboarding requests feature removed - always return null
    return null;
  }

  /**
   * Create auth user with email and temporary password for staff onboarding
   * This is called when admin approves an onboarding request
   * Uses server-side API route with service role key (bypasses email confirmation)
   */
  static async createStaffAuthUser(
    email: string,
    temporaryPassword: string
  ): Promise<{ success: boolean; data?: { userId: string; email: string; emailSent?: boolean, userData: { user: any, session: any } }; error?: string; warning?: string }> {
    try {
      // Call server-side API route that uses service role key
      const response = await fetch("/api/onboarding/create-auth-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: temporaryPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases gracefully
        if (response.status === 409) {
          return {
            success: false,
            error: result.error || "A user with this email already exists",
          };
        }

        if (response.status === 500 && result.error?.includes("not configured")) {
          return {
            success: false,
            error: "Server configuration error: Service role key not found. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.",
          };
        }

        return {
          success: false,
          error: result.error || "Failed to create auth user",
        };
      }

      if (result.success && result.data?.userId) {
        // User created successfully with service role key (email auto-confirmed)
        return {
          success: true,
          data: {
            userId: result.data.userId,
            email: result.data.email || email,
            emailSent: true, // Email is auto-confirmed via admin API
            userData: {
              user: { id: result.data.userId, email: result.data.email },
              session: null, // No session needed, user can login directly
            },
          },
        };
      }

      // Fallback error
      return {
        success: false,
        error: "Failed to create auth user - no user data returned",
      };
    } catch (error) {
      console.error("Error creating staff auth user:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  }

  /**
   * Generate a secure temporary password
   */
  static generateTemporaryPassword(): string {
    // Generate a random password with letters, numbers, and special characters
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    console.log("Before password:: ", password)
    // Ensure at least one of each type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
    password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special char

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    console.log("After loop password: ", password)

    // Shuffle the password
    const newPassword = password.split('').sort(() => Math.random() - 0.5).join('');
    console.log("Final password: ", newPassword)
    return newPassword
  }
}
