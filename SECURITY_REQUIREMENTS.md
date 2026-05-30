# Server-Side Security Requirements (Supabase Implementation Guide)

## CRITICAL: These Must Be Implemented on the Server Side

The client-side security improvements are important but insufficient alone. The following security measures MUST be implemented in Supabase:

## 1. Row-Level Security (RLS) Policies

### Enable RLS on All Tables
```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
```

### Public Tables (Read-Only for Everyone)
```sql
-- Products: Public read, admin write
CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Categories: Public read, admin write
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Subcategories: Public read, admin write
CREATE POLICY "Public can view subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Admins can manage subcategories" ON subcategories FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Store Settings: Public read, admin write
CREATE POLICY "Public can view settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON store_settings FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
```

### Protected Tables (User Data)
```sql
-- Orders: Users can only see their own orders, admins can see all
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any order" ON orders
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Customers: Users can only see their own data (by email), admins can see all
CREATE POLICY "Users can view own customer data" ON customers
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM orders WHERE customer_id = customers.id
    ) OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 2. Admin Verification Function

Create a secure function to verify admin status:
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Grant public access
GRANT EXECUTE ON FUNCTION is_admin() TO public;
```

## 3. Rate Limiting (Supabase Edge Function)

Create a rate limiting edge function:
```typescript
// supabase/functions/rate-limit/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const rateLimits = new Map<string, { count: number; resetTime: number }>()

serve(async (req) => {
  const identifier = req.headers.get('x-client-id') || req.headers.get('x-forwarded-for') || 'unknown'
  const maxRequests = 5
  const windowMs = 60000 // 1 minute

  const now = Date.now()
  const entry = rateLimits.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimits.set(identifier, { count: 1, resetTime: now + windowMs })
    return new Response(JSON.stringify({ allowed: true }), { status: 200 })
  }

  if (entry.count >= maxRequests) {
    return new Response(JSON.stringify({ allowed: false, error: 'Rate limit exceeded' }), { status: 429 })
  }

  entry.count++
  return new Response(JSON.stringify({ allowed: true }), { status: 200 })
})
```

## 4. Payment Intent with Server-Side Verification

Update the create-payment-intent edge function:
```typescript
// supabase/functions/create-payment-intent/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Stripe } from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { amount, currency = 'nzd', metadata, idempotencyKey } = await req.json()

    // Server-side validation
    if (!amount || amount < 0 || amount > 1000000) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400 })
    }

    // Check idempotency
    const existingIntent = await stripe.paymentIntents.retrieve(metadata?.idempotencyKey || '').catch(() => null)
    if (existingIntent) {
      return new Response(JSON.stringify({
        clientSecret: existingIntent.client_secret,
        paymentIntentId: existingIntent.id
      }))
    }

    // Create payment intent with idempotency key
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString()
      }
    }, {
      idempotencyKey: idempotencyKey || `payment-${Date.now()}`
    })

    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }), { status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
```

## 5. Webhook Signature Verification

Create a webhook handler edge function:
```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Stripe } from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        // Update order status in database
        await updateOrderStatus(paymentIntent.metadata.orderId, 'Processing')
        break

      case 'payment_intent.payment_failed':
        // Handle failed payment
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })

  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new Response('Invalid signature', { status: 400 })
  }
})

async function updateOrderStatus(orderId: string, status: string) {
  // Implementation depends on your Supabase client setup
  console.log(`Updating order ${orderId} to ${status}`)
}
```

## 6. Environment Variables (Required)

Set these in your Supabase project:
- `STRIPE_SECRET_KEY` - Your Stripe secret key (never expose client-side)
- `STRIPE_WEBHOOK_SECRET` - From Stripe webhook settings
- `STRIPE_PUBLISHABLE_KEY` - For client-side use
- `PAYPAL_CLIENT_SECRET` - PayPal client secret (if using PayPal)
- `RECAPTCHA_SECRET_KEY` - For reCAPTCHA verification

## 7. Additional Security Measures

### Input Validation on Database Level
```sql
-- Add constraints to tables
ALTER TABLE products ADD CONSTRAINT valid_price CHECK (price >= 0 AND price <= 10000);
ALTER TABLE products ADD CONSTRAINT valid_stock CHECK (stock >= 0);
ALTER TABLE orders ADD CONSTRAINT valid_total CHECK (total >= 0 AND total <= 1000000);
```

### Audit Logging
```sql
-- Create audit log table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create trigger for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to sensitive tables
CREATE TRIGGER audit_orders BEFORE INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_products BEFORE INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

## 8. CORS Configuration

In Supabase dashboard, configure CORS to only allow your domain:
```
Allowed origins: https://yourdomain.com, https://www.yourdomain.com
Allowed methods: GET, POST, PUT, DELETE, OPTIONS
Allowed headers: Content-Type, Authorization, X-CSRF-Token
Max age: 86400
```

## Checklist for Production Deployment

- [ ] Enable RLS on all tables
- [ ] Create and apply all RLS policies
- [ ] Implement admin verification function
- [ ] Set up rate limiting edge function
- [ ] Create secure payment intent function
- [ ] Implement webhook signature verification
- [ ] Add audit logging
- [ ] Configure CORS properly
- [ ] Set all environment variables
- [ ] Test admin access control from client
- [ ] Test user data isolation
- [ ] Test payment security
- [ ] Review and remove any test data
- [ ] Enable database backups
- [ ] Set up monitoring and alerts

---

**NOTE**: The client-side security fixes implemented provide defense in depth, but these server-side measures are essential for true production-grade security.
