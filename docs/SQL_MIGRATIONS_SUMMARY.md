# SQL Migrations Summary

Complete list of all SQL migrations created during this session, in execution order.

---

## 📦 All Migration Files

### Main Migrations (Run These in Production)

1. **`supabase/migrations/add_salon_id_to_customers.sql`**
   - Adds `salon_id` column to `customers` table
   - Creates foreign key to `salons` table
   - Creates index for performance

2. **`supabase/migrations/fix_storage_bucket_policies.sql`**
   - Enables image uploads to `salons-media` bucket
   - Creates INSERT, SELECT, UPDATE, DELETE policies

3. **`supabase/migrations/fix_deals_rls_policy.sql`**
   - Enables deal creation/update/delete for staff and salon admins
   - Creates INSERT, UPDATE, DELETE policies on `salons_deals` table

### Rollback Scripts (Use if Needed)

1. **`supabase/migrations/rollback_salon_id_from_customers.sql`**
   - Removes `salon_id` column from `customers` table

2. **`supabase/migrations/rollback_storage_bucket_policies.sql`**
   - Removes storage bucket policies

3. **`supabase/migrations/rollback_deals_rls_policy.sql`**
   - Removes deals RLS policies

---

## 🎯 Quick Execution Order for Production

1. ✅ **Add salon_id to customers** → `add_salon_id_to_customers.sql`
2. ✅ **Fix Storage Policies** → `fix_storage_bucket_policies.sql`
3. ✅ **Fix Deals RLS** → `fix_deals_rls_policy.sql`

---

## 📋 What Each Migration Does

### Migration 1: Add salon_id to customers
**Purpose:** Enable salon-based client filtering  
**Changes:**
- Adds `salon_id UUID` column
- Foreign key: `customers.salon_id → salons.id`
- Index: `idx_customers_salon_id`

### Migration 2: Storage Bucket Policies
**Purpose:** Enable image uploads  
**Changes:**
- Policy: Authenticated users can INSERT images
- Policy: Public can SELECT (read) images
- Policy: Authenticated users can UPDATE images
- Policy: Authenticated users can DELETE images

### Migration 3: Deals RLS Policies
**Purpose:** Enable deal creation with images  
**Changes:**
- Policy: Staff/salon admins can INSERT deals
- Policy: Staff/salon admins can UPDATE deals
- Policy: Staff/salon admins can DELETE deals

---

## ✅ Pre-requisites Before Running

- [ ] `salons-media` storage bucket exists
- [ ] Bucket is set to **Public**
- [ ] You have admin access to Supabase Dashboard
- [ ] Production database is backed up

---

## 🚀 How to Run

1. Go to **Supabase Dashboard** → **Production Project**
2. Navigate to **SQL Editor**
3. Copy the entire content of each migration file
4. Paste and click **Run**
5. Verify success message

---

## 📝 Files Location

All migration files are in: `supabase/migrations/`

- `add_salon_id_to_customers.sql`
- `fix_storage_bucket_policies.sql`
- `fix_deals_rls_policy.sql`
- `rollback_salon_id_from_customers.sql`
- `rollback_storage_bucket_policies.sql`
- `rollback_deals_rls_policy.sql`

---

For detailed instructions, see: `docs/PRODUCTION_MIGRATIONS_CHECKLIST.md`

