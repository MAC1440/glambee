-- Fix RLS Policy for salons_deals table
-- This allows authenticated users to insert deals for salons they have access to
--
-- TO ROLLBACK: Run the rollback_deals_rls_policy.sql script
-- Or manually drop the policies using:
--   DROP POLICY IF EXISTS "Users can insert deals for their salon" ON salons_deals;
--   DROP POLICY IF EXISTS "Users can update deals for their salon" ON salons_deals;
--   DROP POLICY IF EXISTS "Users can delete deals for their salon" ON salons_deals;

-- First, drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert deals for their salon" ON salons_deals;
DROP POLICY IF EXISTS "Allow authenticated users to insert deals" ON salons_deals;

-- Create a policy that allows:
-- 1. Salon admins and super admins to create deals for any salon
-- 2. Staff members to create deals for their assigned salon
-- 3. Users who own/manage the salon to create deals

CREATE POLICY "Users can insert deals for their salon"
ON salons_deals
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if user is staff member of the salon (includes admins)
  EXISTS (
    SELECT 1 FROM salons_staff
    WHERE salons_staff.id = auth.uid()
    AND salons_staff.salon_id = salons_deals.salon_id
  )
  OR
  -- Allow if user_type is 'salon' (salon admins)
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.user_type = 'salon'
  )
);

-- Also ensure UPDATE and DELETE policies exist (if needed)
-- You may need to create similar policies for UPDATE and DELETE operations

-- Example UPDATE policy:
DROP POLICY IF EXISTS "Users can update deals for their salon" ON salons_deals;

CREATE POLICY "Users can update deals for their salon"
ON salons_deals
FOR UPDATE
TO authenticated
USING (
  -- Allow if user is staff member of the salon
  EXISTS (
    SELECT 1 FROM salons_staff
    WHERE salons_staff.id = auth.uid()
    AND salons_staff.salon_id = salons_deals.salon_id
  )
  OR
  -- Allow if user_type is 'salon' (salon admins)
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.user_type = 'salon'
  )
)
WITH CHECK (
  -- Same conditions for the updated row
  EXISTS (
    SELECT 1 FROM salons_staff
    WHERE salons_staff.id = auth.uid()
    AND salons_staff.salon_id = salons_deals.salon_id
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.user_type = 'salon'
  )
);

-- Example DELETE policy:
DROP POLICY IF EXISTS "Users can delete deals for their salon" ON salons_deals;

CREATE POLICY "Users can delete deals for their salon"
ON salons_deals
FOR DELETE
TO authenticated
USING (
  -- Allow if user is staff member of the salon
  EXISTS (
    SELECT 1 FROM salons_staff
    WHERE salons_staff.id = auth.uid()
    AND salons_staff.salon_id = salons_deals.salon_id
  )
  OR
  -- Allow if user_type is 'salon' (salon admins)
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.user_type = 'salon'
  )
);

