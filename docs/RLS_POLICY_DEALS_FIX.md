# Fixing RLS Policy Error for Deals

## ⚠️ Important: Rollback Information

**Yes, you can undo this migration!** 

If you need to rollback the changes:
1. Run the rollback script: `supabase/migrations/rollback_deals_rls_policy.sql`
2. Or manually drop the policies in Supabase SQL Editor

The rollback script will remove all the policies created by the fix, restoring the table to its previous state (but RLS will still be enabled).

## Error
```
{
    "statusCode": "403",
    "error": "Unauthorized",
    "message": "new row violates row-level security policy"
}
```

## Problem
The Row-Level Security (RLS) policy on the `salons_deals` table is blocking the insert operation. This happens when the RLS policy doesn't allow the current user to create deals.

## Solution

### Step 1: Check RLS is Enabled
1. Go to Supabase Dashboard
2. Navigate to **Table Editor** → `salons_deals`
3. Click on **Policies** tab
4. Ensure RLS is enabled (toggle should be ON)

### Step 2: Create/Update Insert Policy

You need to create an INSERT policy that allows users to create deals for their salon. Here's a recommended policy:

#### Policy Name: `Users can insert deals for their salon`

**Policy Definition (SQL):**
```sql
CREATE POLICY "Users can insert deals for their salon"
ON salons_deals
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if user is a salon admin or super admin
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('SALON_ADMIN', 'SUPER_ADMIN')
  )
  OR
  -- Allow if user is staff member of the salon
  EXISTS (
    SELECT 1 FROM salons_staff
    WHERE salons_staff.auth_user_id = auth.uid()
    AND salons_staff.salon_id = salons_deals.salon_id
  )
  OR
  -- Allow if the salon_id matches a salon the user owns/manages
  EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = salons_deals.salon_id
    AND (
      salons.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM salons_staff
        WHERE salons_staff.salon_id = salons.id
        AND salons_staff.auth_user_id = auth.uid()
      )
    )
  )
);
```

### Step 3: Alternative Simpler Policy (For Testing)

If the above is too complex, you can use a simpler policy for testing:

```sql
CREATE POLICY "Allow authenticated users to insert deals"
ON salons_deals
FOR INSERT
TO authenticated
WITH CHECK (true);
```

**⚠️ Warning:** This allows any authenticated user to create deals. Only use for testing, then replace with the more restrictive policy above.

### Step 4: Verify User Session

The code now checks for a valid session before creating deals. If you still get the error:

1. **Check if user is logged in:**
   - Open browser console
   - Check `localStorage.getItem('session')` - should return session data
   - Check `supabase.auth.getSession()` - should return a valid session

2. **Check user's salon access:**
   - Verify the `salon_id` being used matches a salon the user has access to
   - Check the `salons_staff` table to ensure the user is linked to the salon

3. **Check user role:**
   - Verify the user's role in the `users` table
   - Should be `SALON_ADMIN`, `SUPER_ADMIN`, or linked via `salons_staff`

### Step 5: Test the Fix

1. Log in as a salon admin or staff member
2. Try creating a deal with an image
3. The deal should be created successfully

## Debugging

If the error persists, check the browser console for:
- Session information
- User ID
- Salon ID being used
- Detailed error messages

The updated code now logs this information to help debug RLS issues.

## Common Issues

1. **Session expired:** Refresh the page and log in again
2. **Wrong salon_id:** Ensure the salon_id matches a salon the user has access to
3. **RLS policy too restrictive:** Update the policy to allow the operation
4. **User not in salons_staff:** Add the user to the `salons_staff` table for the salon

