# Password Handling Guide

## How Passwords Work in This System

### Overview

Passwords are handled entirely by **Supabase Auth** in the `auth.users` table. Your application never stores passwords directly.

### Password Flow

#### 1. **Initial Password (Temporary Password)**
- When admin approves a staff member, a temporary password is generated
- Auth user is created via `/api/onboarding/create-auth-user` using service role key
- Password is set in `auth.users.encrypted_password` (hashed by Supabase)
- User metadata: `password_updated: false`

#### 2. **First Login with Temporary Password**
- Staff member logs in with temporary password
- `supabase.auth.signInWithPassword()` authenticates against `auth.users`
- If `password_updated` is `false`, password update modal is shown
- Current session is stored temporarily

#### 3. **Password Update (First Login)**
- User enters new password in `PasswordUpdateModal`
- `supabase.auth.updateUser({ password: newPassword })` is called
- **Requires active session** - user must be logged in
- Updates `auth.users.encrypted_password` with new hashed password
- Updates user metadata: `password_updated: true`
- Session is refreshed to ensure it's valid

#### 4. **Future Logins**
- Staff member uses their new password
- `supabase.auth.signInWithPassword()` authenticates against updated password
- If `password_updated` is `true`, user goes directly to dashboard

## Key Points

### ✅ What Works
- Passwords are stored securely in `auth.users` (hashed by Supabase)
- Password updates require active session (user must be logged in)
- Password updates are immediate - no delay
- New password works immediately for future logins

### ⚠️ Important Notes
1. **Session Required**: `updateUser()` only works if user has active session
2. **Immediate Effect**: Password update takes effect immediately
3. **No Database Sync Needed**: Password is only in `auth.users`, not in `salons_staff`
4. **Email is Key**: Login uses email from `auth.users.email`

## Troubleshooting

### Issue: "Invalid login credentials" after password update

**Possible Causes:**
1. Password update failed silently (no active session)
2. User tried to login before password update completed
3. Wrong password entered during update
4. Session expired during password update

**Solution:**
- Check browser console for errors during password update
- Verify user has active session before updating password
- Ensure password update completes successfully
- Try logging in again with the new password

### Issue: Password update succeeds but login fails

**Possible Causes:**
1. Password wasn't actually updated (check `auth.users` table)
2. User is using old password instead of new one
3. Email mismatch between login and auth.users

**Solution:**
- Verify password update in Supabase dashboard → Authentication → Users
- Check user metadata has `password_updated: true`
- Ensure user is using the new password (not temporary one)
- Verify email matches exactly

## Code Flow

```typescript
// 1. Login with temporary password
const { data, error } = await supabase.auth.signInWithPassword({
  email: "staff@example.com",
  password: "TemporaryPassword123!"
});

// 2. Check if password needs update
if (!data.user.user_metadata?.password_updated) {
  // Show password update modal
}

// 3. Update password (requires active session)
const { error } = await supabase.auth.updateUser({
  password: "NewSecurePassword123!",
  data: { password_updated: true }
});

// 4. Refresh session
await supabase.auth.refreshSession();

// 5. Future login with new password
const { data, error } = await supabase.auth.signInWithPassword({
  email: "staff@example.com",
  password: "NewSecurePassword123!" // ✅ Works!
});
```

## Best Practices

1. **Always verify session exists** before updating password
2. **Refresh session** after password update
3. **Show clear error messages** if password update fails
4. **Validate password strength** before updating
5. **Log password update events** for security auditing

