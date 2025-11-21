-- Rollback script for deals RLS policy
-- This will remove the policies created by fix_deals_rls_policy.sql

-- Drop the INSERT policy
DROP POLICY IF EXISTS "Users can insert deals for their salon" ON salons_deals;
DROP POLICY IF EXISTS "Allow authenticated users to insert deals" ON salons_deals;

-- Drop the UPDATE policy
DROP POLICY IF EXISTS "Users can update deals for their salon" ON salons_deals;

-- Drop the DELETE policy
DROP POLICY IF EXISTS "Users can delete deals for their salon" ON salons_deals;

-- Note: This will NOT disable RLS on the table
-- If you want to completely disable RLS (not recommended), run:
-- ALTER TABLE salons_deals DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later:
-- ALTER TABLE salons_deals ENABLE ROW LEVEL SECURITY;

