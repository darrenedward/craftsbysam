# Supabase Edge Functions Deployment Guide

This directory contains Supabase Edge Functions for Crafts By Sam. These functions enable secure server-side operations like Stripe payment processing.

## Setup Instructions

### 1. Install Supabase CLI

First, install the Supabase CLI on your development machine:

```bash
# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://supabase.com/install.sh | bash

# Windows
# Download from https://supabase.com/docs/guides/cli
```

### 2. Link to your Supabase project

```bash
# Navigate to your project directory
cd /home/curryman/Websites/CraftsBySam

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

You can find your project reference in your Supabase dashboard: `Project Settings > API > Reference ID`

### 3. Set environment variables

Set your Stripe secret key as an environment variable for the Edge Function:

```bash
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

**IMPORTANT:** Never commit your Stripe secret key to the codebase. This is a server-side secret that must be stored securely in Supabase.

### 4. Deploy the Edge Functions

Deploy all functions to Supabase:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy a specific function
supabase functions deploy create-payment-intent
```

### 5. Verify deployment

Check that your functions are deployed in the Supabase dashboard:
- Navigate to `Edge Functions` in your Supabase project
- You should see `create-payment-intent` listed

## Available Functions

### create-payment-intent

Creates a Stripe PaymentIntent server-side for secure payment processing.

**Request:**
```json
{
  "amount": 100.00,
  "currency": "nzd",
  "metadata": {
    "customer_name": "John Doe",
    "customer_email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_12345_secret_abc123",
  "paymentIntentId": "pi_12345"
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

## Security Notes

1. **Stripe Secret Key**: Must be set as an environment variable, never in code
2. **CORS**: Functions include CORS headers for frontend access
3. **Environment Variables**: Only set in production via Supabase CLI
4. **No Secrets in Code**: The codebase must never contain API keys or secrets

## Testing

Test your Edge Function locally:

```bash
# Start local Supabase environment
supabase start

# Test the function locally
curl --request POST 'http://localhost:54321/functions/v1/create-payment-intent' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount": 100.00, "currency": "nzd"}'
```

## Troubleshooting

**Function not found:**
- Ensure you've deployed the function: `supabase functions deploy`
- Check the function name matches exactly (case-sensitive)

**Environment variable not working:**
- Verify the secret is set: `supabase secrets list`
- Re-deploy the function after setting secrets

**CORS errors:**
- Ensure CORS headers are properly set in the function
- Check that your frontend domain is allowed

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Your Stripe account secret key | `sk_test_12345...` |

Get your Stripe secret key from: `Stripe Dashboard > Developers > API keys`
