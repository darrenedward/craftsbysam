import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../../ui/Button';
import { createPaymentIntent } from '../../../utils/stripeApi';

interface StripePaymentFormProps {
  amount: number;
  onSubmit: (paymentDetails: { id: string; status: string }) => Promise<void>;
  isProcessing: boolean;
  customerInfo: { name: string; email: string };
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  onSubmit,
  isProcessing,
  customerInfo,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create PaymentIntent via Supabase Edge Function
      const { clientSecret, paymentIntentId, error: intentError } = await createPaymentIntent(
        amount,
        'nzd',
        { customer_name: customerInfo.name, customer_email: customerInfo.email }
      );

      if (intentError || !clientSecret) {
        setError(`Failed to create payment intent: ${intentError || 'Unknown error'}`);
        setProcessing(false);
        return;
      }

      // Step 2: Confirm the payment using Stripe.js
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/checkout',
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        console.error('Payment confirmation error:', confirmError);
        setError(`Payment failed: ${confirmError.message}`);
        setProcessing(false);
        return;
      }

      // Step 3: Handle successful payment
      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        await onSubmit({ id: paymentIntentId, status: paymentIntent.status });
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setError(`Payment error: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded-md bg-white shadow-sm">
      <h4 className="mb-4 text-sm font-medium text-gray-700">Credit Card Details</h4>
      <div className="p-3 border rounded-md bg-gray-50">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }} />
      </div>
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      <Button
        type="submit"
        disabled={!stripe || isProcessing || processing}
        className="w-full mt-4 py-2"
      >
        {processing || isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
      <div className="flex items-center justify-center gap-1 mt-3">
        <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        <span className="text-xs text-gray-400">Secure SSL Encrypted</span>
      </div>
    </form>
  );
};
