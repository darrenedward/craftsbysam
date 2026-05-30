import { supabase } from '../supabaseClient';
import { logger } from './logger';
import { generateIdempotencyKey, checkIdempotency, markIdempotencyUsed } from './security';
import { validateAmount } from './validation';

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  error?: string;
}

// Store for idempotency keys (in production, use Redis)
const paymentIdempotencyKeys = new Map<string, { timestamp: number; used: boolean }>();

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'nzd',
  metadata?: Record<string, string>,
  idempotencyKey?: string
): Promise<CreatePaymentIntentResponse> => {
  try {
    // Validate amount
    if (!validateAmount(amount)) {
      logger.error('Invalid payment amount:', amount);
      return { clientSecret: '', paymentIntentId: '', error: 'Invalid payment amount' };
    }

    // Generate or use provided idempotency key
    const key = idempotencyKey || generateIdempotencyKey();

    // Check if this key was already used
    const existing = paymentIdempotencyKeys.get(key);
    if (existing && existing.used) {
      logger.warn('Duplicate payment attempt with same idempotency key');
      return { clientSecret: '', paymentIntentId: '', error: 'Duplicate payment request' };
    }

    // Mark as used
    paymentIdempotencyKeys.set(key, { timestamp: Date.now(), used: true });

    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount,
        currency,
        metadata: {
          ...metadata,
          idempotencyKey: key,
          timestamp: new Date().toISOString()
        }
      },
    });

    if (error) {
      logger.error('Supabase function error:', error);
      return { clientSecret: '', paymentIntentId: '', error: error.message };
    }

    return data;
  } catch (error: any) {
    logger.error('Payment intent creation failed:', error);
    return { clientSecret: '', paymentIntentId: '', error: error.message || 'Failed to create payment intent' };
  }
};

/**
 * Verify Stripe webhook signature
 * NOTE: This should be done server-side in Supabase Edge Function
 * This client-side version is for validation only
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  webhookSecret: string
): boolean => {
  // WARNING: This is a placeholder. Webhook verification MUST be done server-side
  // Never expose webhook secrets client-side in production
  logger.warn('Webhook signature verification must be done server-side');

  // In production, use Stripe's SDK on the server:
  // const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  return true; // Placeholder
};

/**
 * Clean up old idempotency keys (prevent memory leaks)
 */
export const cleanupOldIdempotencyKeys = (): void => {
  const now = Date.now();
  const maxAge = 3600000; // 1 hour

  for (const [key, value] of paymentIdempotencyKeys.entries()) {
    if (now - value.timestamp > maxAge) {
      paymentIdempotencyKeys.delete(key);
    }
  }
};

// Cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupOldIdempotencyKeys, 600000);
}
