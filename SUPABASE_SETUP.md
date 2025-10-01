# Supabase Integration Setup

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Supabase Project Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Enable Phone Authentication**
   - Go to Authentication > Settings in your Supabase dashboard
   - Enable "Phone" provider
   - Configure your SMS provider (Twilio, etc.)

3. **Database Schema**
   - The project already includes the complete database schema
   - Tables: `users`, `customers`, `salons`, `appointments`, etc.
   - The AuthService will automatically create user profiles

## Features Implemented

### AuthService (`/src/lib/supabase/auth-service.ts`)
- ✅ Phone number validation
- ✅ OTP sending via Supabase Auth
- ✅ OTP verification
- ✅ User profile creation/update
- ✅ Customer profile creation
- ✅ Session management
- ✅ Error handling

### Updated Components
- ✅ Signup component with proper Supabase integration
- ✅ VerifyOtp component with user profile creation
- ✅ Loading states and error handling
- ✅ Toast notifications

## Usage

The signup flow now:
1. Validates phone number format
2. Sends OTP via Supabase Auth
3. Verifies OTP and creates user profile
4. Creates customer profile if needed
5. Stores session data
6. Redirects to dashboard

## Testing

1. Set up your Supabase project
2. Add environment variables
3. Test with a real phone number
4. Check Supabase dashboard for created users

## Database Tables Used

- `users`: Main user authentication data
- `customers`: Customer-specific profile data
- `salons`: Salon business data (for salon users)

The AuthService automatically handles the relationship between these tables.
