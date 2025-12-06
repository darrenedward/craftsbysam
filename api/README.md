# Vercel Serverless Functions

## Keep-Alive Cron Job

**File:** `keep-alive.ts`

**Purpose:** Prevents Supabase database from going to sleep due to inactivity.

**Schedule:** Runs every 10 minutes (`*/10 * * * *`)

**What it does:**
- Makes a simple query to the `products` table
- Returns success/error status with timestamp
- Keeps the database connection active

**Environment Variables Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Note:** Make sure these environment variables are set in your Vercel project settings.

**Testing:**
You can manually test the endpoint by visiting: `https://your-domain.vercel.app/api/keep-alive`

**Adjusting the Schedule:**
To change the frequency, edit the `schedule` field in `vercel.json`:
- Every 5 minutes: `*/5 * * * *`
- Every 15 minutes: `*/15 * * * *`
- Every hour: `0 * * * *`
