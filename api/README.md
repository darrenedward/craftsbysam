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
- `CRON_SECRET` - A secret token to authenticate cron requests (optional but recommended)

**Setting up CRON_SECRET:**
1. Generate a random secret: `openssl rand -base64 32`
2. Add it as an environment variable in Vercel project settings
3. Vercel will automatically include it in the Authorization header when triggering the cron job

**Note:** Make sure these environment variables are set in your Vercel project settings.

**Security:**
The endpoint checks for a `CRON_SECRET` in the Authorization header. If set, only requests with the correct Bearer token will be processed. This prevents unauthorized access to the endpoint.

**Testing:**
You can manually test the endpoint by visiting: `https://your-domain.vercel.app/api/keep-alive`

**Adjusting the Schedule:**
To change the frequency, edit the `schedule` field in `vercel.json`:
- Every 5 minutes: `*/5 * * * *`
- Every 15 minutes: `*/15 * * * *`
- Every hour: `0 * * * *`
