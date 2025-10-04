# Database Setup Guide

## Problem
The application is getting database errors because the tables don't exist:
- `The table 'public.UserSession' does not exist in the current database`
- `The table 'public.RecommendationCache' does not exist in the current database`

## Solution

### On Railway:

1. **Run the migration manually in Railway's PostgreSQL:**
   - Go to your Railway PostgreSQL instance
   - Click on "Query" tab
   - Copy and paste the entire content from `prisma/migrations/20250105_init/migration.sql`
   - Execute the query

2. **Alternative: Use Prisma CLI from Railway shell:**
   ```bash
   npx prisma migrate deploy
   ```

### For local development:

1. **Set your DATABASE_URL in .env:**
   ```
   DATABASE_URL="your-railway-postgres-url"
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

## Verify Installation

Run this query to check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- UserSession
- SpecializationCache
- RecommendationCache
- SharedResult
- ChatHistory
