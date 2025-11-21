-- Rollback script for salon_id column in customers table
-- This will remove the salon_id column and related constraints

-- Remove foreign key constraint
ALTER TABLE customers
DROP CONSTRAINT IF EXISTS customers_salon_id_fkey;

-- Drop index
DROP INDEX IF EXISTS idx_customers_salon_id;

-- Remove column
ALTER TABLE customers
DROP COLUMN IF EXISTS salon_id;

