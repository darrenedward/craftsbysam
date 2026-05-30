import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../../../utils/stripeLoader';
import { PayPalButtons } from './PayPalButtons';
import { StripePaymentForm } from './StripePaymentForm';
import { Button } from '../../ui/Button';

interface PaymentMethodsProps {
  total: number;
  paymentMethod: string | null;
  settings: any;
  onPaymentMethodChange: (method: string) => void;
  onPlaceOrder: (transactionDetails?: any) => Promise<void>;
  isProcessing: boolean;
  customerInfo: { name: string; email: string };
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  total,
  paymentMethod,
  settings,
  onPaymentMethodChange,
  onPlaceOrder,
  isProcessing,
  customerInfo,
}) => {
  return (
    <>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-brand-text">Payment Method</h3>
        <div className="space-y-4">
          {/* Manual Methods */}
          {settings?.payment?.bankTransfer?.enabled && (
            <div>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 bg-white">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Bank Transfer"
                  checked={paymentMethod === 'Bank Transfer'}
                  onChange={() => onPaymentMethodChange('Bank Transfer')}
                  className="h-4 w-4 text-brand-pink focus:ring-brand-pink"
                />
                <span className="ml-3 font-medium">Bank Transfer</span>
              </label>
              {paymentMethod === 'Bank Transfer' && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 whitespace-pre-wrap">
                  {settings.payment.bankTransfer.instructions}
                </div>
              )}
            </div>
          )}

          {settings?.payment?.cashOnPickup?.enabled && (
            <div>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 bg-white">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Pickup"
                  checked={paymentMethod === 'Cash on Pickup'}
                  onChange={() => onPaymentMethodChange('Cash on Pickup')}
                  className="h-4 w-4 text-brand-pink focus:ring-brand-pink"
                />
                <span className="ml-3 font-medium">Cash on Pickup</span>
              </label>
              {paymentMethod === 'Cash on Pickup' && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 whitespace-pre-wrap">
                  {settings.payment.cashOnPickup.instructions}
                </div>
              )}
            </div>
          )}

          {/* Online Methods */}
          {settings?.payment?.paypal?.enabled && (
            <div>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 bg-white">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentMethod === 'PayPal'}
                  onChange={() => onPaymentMethodChange('PayPal')}
                  className="h-4 w-4 text-brand-pink focus:ring-brand-pink"
                />
                <span className="ml-3 font-medium">PayPal</span>
              </label>
            </div>
          )}

          {settings?.payment?.stripe?.enabled && (
            <div>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 bg-white">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Stripe"
                  checked={paymentMethod === 'Stripe'}
                  onChange={() => onPaymentMethodChange('Stripe')}
                  className="h-4 w-4 text-brand-pink focus:ring-brand-pink"
                />
                <span className="ml-3 font-medium">Credit Card (Stripe)</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        {paymentMethod === 'PayPal' && settings?.payment?.paypal?.clientId ? (
          <PayPalButtons
            amount={total}
            clientId={settings.payment.paypal.clientId}
            onSuccess={onPlaceOrder}
            onError={(err) => console.error(`Payment Error: ${JSON.stringify(err)}`)}
          />
        ) : paymentMethod === 'Stripe' && settings?.payment?.stripe?.publishableKey ? (
          <Elements stripe={getStripe(settings.payment.stripe.publishableKey)}>
            <StripePaymentForm
              amount={total}
              onSubmit={onPlaceOrder}
              isProcessing={isProcessing}
              customerInfo={customerInfo}
            />
          </Elements>
        ) : (
          <Button
            type="button"
            onClick={() => document.getElementById('checkout-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
            className="w-full text-lg py-3"
            disabled={isProcessing || !paymentMethod || (paymentMethod === 'PayPal' && !settings?.payment?.paypal?.clientId) || (paymentMethod === 'Stripe' && !settings?.payment?.stripe?.publishableKey)}
          >
            {isProcessing ? 'Processing...' : 'Place Order'}
          </Button>
        )}
        <p className="text-xs text-center mt-2 text-gray-500">
          {paymentMethod === 'PayPal' || paymentMethod === 'Stripe' ? 'Payment processed securely.' : 'This will finalize your order.'}
        </p>
      </div>
    </>
  );
};
