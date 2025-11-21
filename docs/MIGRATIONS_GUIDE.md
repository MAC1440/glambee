# Database Migrations Guide

## Current Setup

You have migration files in `supabase/migrations/` folder:
- `fix_deals_rls_policy.sql` - RLS policies for deals table
- `fix_storage_bucket_policies.sql` - Storage bucket policies
- `rollback_deals_rls_policy.sql` - Rollback script for deals RLS
- `rollback_storage_bucket_policies.sql` - Rollback script for storage policies

## ⚠️ Important: Migrations Don't Run Automatically

**These SQL files will NOT run automatically when you merge to production.** You need to run them manually.

## How to Run Migrations in Production

### Option 1: Manual Execution (Current Method - Recommended for Now)

1. **Go to Supabase Dashboard**
   - Navigate to your production project
   - Go to **SQL Editor**

2. **Run Each Migration**
   - Open the migration file (e.g., `fix_deals_rls_policy.sql`)
   - Copy the entire SQL content
   - Paste into SQL Editor
   - Click **Run**
   - Verify success message

3. **Run in Order**
   - First: `fix_storage_bucket_policies.sql` (for image uploads)
   - Then: `fix_deals_rls_policy.sql` (for deal creation)

### Option 2: Supabase CLI (For Future Automation)

If you want to automate migrations, you can set up Supabase CLI:

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Link to your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Run migrations:**
   ```bash
   supabase db push
   ```

4. **Add to CI/CD:**
   - Create a GitHub Actions workflow
   - Run `supabase db push` on production deployments

## Migration Checklist for Production

Before merging to production:

- [ ] Test migrations in a staging environment first
- [ ] Backup production database (Supabase does this automatically, but good to verify)
- [ ] Run `fix_storage_bucket_policies.sql` first
- [ ] Run `fix_deals_rls_policy.sql` second
- [ ] Test image upload functionality
- [ ] Test deal creation with images
- [ ] Verify no errors in production logs

## Rollback Plan

If something goes wrong:

1. **For Deals RLS:**
   - Run `rollback_deals_rls_policy.sql`

2. **For Storage Policies:**
   - Run `rollback_storage_bucket_policies.sql`

## Best Practices

1. **Always test in staging first** - Run migrations on a staging/development Supabase project before production
2. **Run during low-traffic periods** - If possible, run migrations during off-peak hours
3. **Monitor after deployment** - Check logs and test functionality after running migrations
4. **Document changes** - Keep track of which migrations have been run in production

## Future: Automated Migrations

To set up automated migrations:

1. Install Supabase CLI
2. Set up CI/CD pipeline
3. Add migration step to deployment process
4. Use `supabase db push` command

For now, manual execution is the safest approach.

