import { supabase } from './client';
import { Database } from './supabase';

type User = Database['public']['Tables']['users']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];
type Salon = Database['public']['Tables']['salons']['Row'];

export interface AuthUser {
  id: string;
  email: string | null;
  phone_number: string | null;
  fullname: string | null;
  avatar: string | null;
  user_type: 'salon' | 'customer';
  created_at: string;
  updated_at: string;
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
        data: data
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

      if (error || !userData) {
        return {
          success: false,
          error: "Failed to retrieve user data"
        };
      }

      return {
        success: true,
        data: userData as AuthUser
      };
    } catch (error) {
      console.error('Direct Login Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
