# Supabase Email/Password Authentication Guide

## How Supabase Auth Works

Supabase has **two separate systems**:

1. **Supabase Auth** (`auth.users` table) - Handles authentication securely
2. **Your Database Tables** (`public.users`, `public.salons_staff`, etc.) - Stores your application data

### Key Concepts

#### 1. **Passwords are NEVER stored in your tables**
- Passwords are stored securely in Supabase's `auth.users` table
- You **cannot** and **should not** add a `password` column to your custom tables
- Supabase handles password hashing, encryption, and security

#### 2. **Email can be stored in both places**
- `auth.users.email` - Used by Supabase Auth for login
- `public.users.email` or `public.salons_staff.email` - Your application data

#### 3. **Linking Auth Users to Your Tables**
- Supabase Auth creates a user with a UUID `id` in `auth.users`
- You link your custom table records to auth users using this same `id`
- Example: `public.users.id` = `auth.users.id`

## Current Setup (Phone/OTP)

Your current implementation:
```typescript
// Phone/OTP Flow
supabase.auth.signInWithOtp({ phone: phone })
supabase.auth.verifyOtp({ phone, token })
```

This creates a user in `auth.users` with:
- `id`: UUID
- `phone`: Phone number
- `email`: null (usually)

## Email/Password Authentication Flow

### 1. **Sign Up (Create Account)**

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'staff@example.com',
  password: 'securePassword123',
  options: {
    data: {
      full_name: 'John Doe',
      user_type: 'staff'
    }
  }
});

// After signup:
// - User is created in auth.users
// - You get: data.user.id, data.user.email, data.session
// - You need to create/update your custom table record
```

### 2. **Sign In (Login)**

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'staff@example.com',
  password: 'securePassword123'
});

// After signin:
// - User is authenticated
// - You get: data.user.id, data.user.email, data.session
// - You can fetch your custom table record using data.user.id
```

### 3. **Database Schema Example**

For staff members, your `salons_staff` table should have:

```sql
CREATE TABLE salons_staff (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id),
  name TEXT,
  email TEXT,  -- Can store email here for convenience
  phone_number TEXT,
  role TEXT,
  -- NO password column!
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Important**: The `id` column should be a UUID that matches `auth.users.id`.

## Implementation Steps

### Step 1: Update Database Schema

If you want to add email/password auth for staff:

1. Ensure `salons_staff` table has:
   - `id` column as UUID (references `auth.users.id`)
   - `email` column (optional, for convenience)

2. If `id` is currently auto-generated, you'll need to:
   - Change it to UUID
   - Set it manually when creating staff (using the auth user's ID)

### Step 2: Create Auth Service Methods

Add to `AuthService` class:

```typescript
// Sign up staff with email/password
static async signUpStaff(email: string, password: string, staffData: any) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: 'staff',
        ...staffData
      }
    }
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to create auth user');
  }

  // 2. Create staff record in salons_staff table
  const { data: staffRecord, error: staffError } = await supabase
    .from('salons_staff')
    .insert({
      id: authData.user.id,  // Use auth user's ID
      email: email,
      ...staffData
    })
    .select()
    .single();

  return { authData, staffRecord };
}

// Sign in staff with email/password
static async signInStaff(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    throw new Error(error?.message || 'Login failed');
  }

  // Fetch staff record from salons_staff
  const { data: staffRecord } = await supabase
    .from('salons_staff')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    user: data.user,
    session: data.session,
    staffRecord
  };
}
```

### Step 3: Update Your Auth Component

In `Auth.tsx`, update `handleStaffSubmit`:

```typescript
const handleStaffSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError(null);
  setIsLoading(true);

  try {
    const result = await AuthService.signInStaff(email, password);
    
    // Create session
    const userSession = {
      id: result.staffRecord.id,
      name: result.staffRecord.name,
      email: result.staffRecord.email,
      role: result.staffRecord.role,
      salonId: result.staffRecord.salon_id,
      userType: 'staff',
    };

    localStorage.setItem("session", JSON.stringify(userSession));
    window.dispatchEvent(new CustomEvent("authStateChanged", { detail: userSession }));
    router.push("/dashboard");
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

## Important Notes

1. **Password Reset**: Supabase provides `supabase.auth.resetPasswordForEmail()` for password resets
2. **Email Verification**: Supabase can send verification emails automatically
3. **Session Management**: Supabase handles JWT tokens and session refresh automatically
4. **Security**: Never store passwords in your custom tables - always use Supabase Auth

## Differences: Phone vs Email/Password

| Feature | Phone/OTP | Email/Password |
|---------|-----------|----------------|
| Auth Method | `signInWithOtp()` | `signInWithPassword()` |
| Verification | OTP code via SMS | Password |
| User ID Source | `auth.users.id` (from phone) | `auth.users.id` (from email) |
| Password Storage | N/A | In `auth.users` (encrypted) |
| Your Table Link | `users.id = auth.users.id` | `salons_staff.id = auth.users.id` |

## Next Steps

Once you understand this, you can:
1. Decide on the database schema changes needed
2. Implement the signup/signin methods
3. Update the UI components
4. Handle password reset flows

