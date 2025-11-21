# Production Migrations Checklist

This document lists all SQL migrations that need to be run in production, in the correct order.

## 📋 Migration Summary

### Total Migrations: 3 (Main) + 3 (Rollback Scripts)

---

## ✅ Migration 1: Add salon_id to customers table

**File:** `supabase/migrations/add_salon_id_to_customers.sql`  
**Purpose:** Links customers to their salon for salon-specific filtering  
**When to Run:** Before deploying code that uses salon_id filtering  
**Priority:** Medium (Required for salon-based client filtering)

**What it does:**
- Adds `salon_id` column to `customers` table
- Creates foreign key constraint to `salons` table
- Creates index for better query performance

**Rollback File:** `supabase/migrations/rollback_salon_id_from_customers.sql`

---

## ✅ Migration 2: Fix Storage Bucket Policies

**File:** `supabase/migrations/fix_storage_bucket_policies.sql`  
**Purpose:** Allows authenticated users to upload images to `salons-media` bucket  
**When to Run:** Before deploying image upload feature  
**Priority:** HIGH (Required for image uploads to work)

**What it does:**
- Creates INSERT policy for authenticated users to upload images
- Creates SELECT policy for public to read images
- Creates UPDATE policy for authenticated users
- Creates DELETE policy for authenticated users

**Prerequisites:**
- Storage bucket `salons-media` must exist
- Bucket should be set to **Public**

**Rollback File:** `supabase/migrations/rollback_storage_bucket_policies.sql`

---

## ✅ Migration 3: Fix Deals RLS Policies

**File:** `supabase/migrations/fix_deals_rls_policy.sql`  
**Purpose:** Allows staff and salon admins to create/update/delete deals  
**When to Run:** Before deploying deal creation with images  
**Priority:** HIGH (Required for deal creation to work)

**What it does:**
- Creates INSERT policy for staff members and salon admins
- Creates UPDATE policy for staff members and salon admins
- Creates DELETE policy for staff members and salon admins

**Rollback File:** `supabase/migrations/rollback_deals_rls_policy.sql`

---

## 🚀 Production Deployment Steps

### Step 1: Pre-Deployment Checklist

- [ ] Backup production database (Supabase does this automatically)
- [ ] Test all migrations in staging environment first
- [ ] Verify `salons-media` bucket exists in production
- [ ] Ensure bucket is set to **Public**

### Step 2: Run Migrations (In Order)

1. **Add salon_id to customers** (if not already done)
   - Open: Supabase Dashboard → Production → SQL Editor
   - Copy SQL from `add_salon_id_to_customers.sql`
   - Paste and run
   - Verify: Check that `salon_id` column exists in `customers` table

2. **Fix Storage Bucket Policies**
   - Open: Supabase Dashboard → Production → SQL Editor
   - Copy SQL from `fix_storage_bucket_policies.sql`
   - Paste and run
   - Verify: Try uploading an image (should work)

3. **Fix Deals RLS Policies**
   - Open: Supabase Dashboard → Production → SQL Editor
   - Copy SQL from `fix_deals_rls_policy.sql`
   - Paste and run
   - Verify: Try creating a deal with an image (should work)

### Step 3: Post-Deployment Verification

- [ ] Test image upload functionality
- [ ] Test deal creation with images
- [ ] Test deal creation without images
- [ ] Verify clients are filtered by salon
- [ ] Check production logs for any errors

---

## 📝 Quick Reference: All Migration Files

| File | Purpose | Priority | Rollback Available |
|------|---------|----------|-------------------|
| `add_salon_id_to_customers.sql` | Add salon_id column | Medium | ✅ Yes |
| `fix_storage_bucket_policies.sql` | Enable image uploads | **HIGH** | ✅ Yes |
| `fix_deals_rls_policy.sql` | Enable deal creation | **HIGH** | ✅ Yes |

---

## 🔄 Rollback Procedures

If something goes wrong, use the rollback scripts:

1. **Storage Policies:**
   - Run: `rollback_storage_bucket_policies.sql`

2. **Deals RLS:**
   - Run: `rollback_deals_rls_policy.sql`

3. **salon_id Column:**
   - Run: `rollback_salon_id_from_customers.sql`

---

## 📌 Important Notes

1. **Order Matters:** Run migrations in the order listed above
2. **Test First:** Always test in staging before production
3. **Backup:** Supabase automatically backs up, but verify before major changes
4. **Monitor:** Watch logs after running migrations
5. **Document:** Keep track of which migrations have been run in production

---

## 🆘 Troubleshooting

### Error: "Column already exists"
- The migration was already run - skip it

### Error: "Bucket not found"
- Create `salons-media` bucket in Storage dashboard first

### Error: "Policy already exists"
- The migration was already run - this is safe, DROP POLICY IF EXISTS handles it

### Error: "Permission denied"
- Check that you're running as a database admin/superuser
- Verify RLS is enabled on the table

