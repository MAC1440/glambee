-- Add salon_id column to customers table
-- This links customers to their salon for salon-specific filtering
--
-- TO ROLLBACK: Run the rollback_salon_id_from_customers.sql script
-- Or manually:
--   ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_salon_id_fkey;
--   DROP INDEX IF EXISTS idx_customers_salon_id;
--   ALTER TABLE customers DROP COLUMN IF EXISTS salon_id;

-- Add salon_id column (if it doesn't exist)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS salon_id UUID;

-- Add foreign key constraint linking to salons table
ALTER TABLE customers
ADD CONSTRAINT IF NOT EXISTS customers_salon_id_fkey
FOREIGN KEY (salon_id)
REFERENCES salons(id)
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_salon_id ON customers(salon_id);

-- Optional: Add comment to document the column
COMMENT ON COLUMN customers.salon_id IS 'Links customer to their salon for salon-specific data filtering';

