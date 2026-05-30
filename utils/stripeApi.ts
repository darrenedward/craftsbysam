import { supabase } from '../supabaseClient';

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  error?: string;
}

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'nzd',
  metadata?: Record<string, string>
): Promise<CreatePaymentIntentResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { amount, currency, metadata },
    });

    if (error) {
      console.error('Supabase function error:', error);
      return { clientSecret: '', paymentIntentId: '', error: error.message };
    }

    return data;
  } catch (error: any) {
    console.error('Payment intent creation failed:', error);
    return { clientSecret: '', paymentIntentId: '', error: error.message || 'Failed to create payment intent' };
  }
};
