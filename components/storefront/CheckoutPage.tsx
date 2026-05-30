import React, { useState, useMemo, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';
import { Customer, Address, Order } from '../../types';
import { supabase } from '../../supabaseClient';
import { formatError } from '../../utils/errorHelper';
import { CheckoutForms } from './checkout/CheckoutForms';
import { PaymentMethods } from './checkout/PaymentMethods';
import { OrderSummary } from './checkout/OrderSummary';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderPlaced: (orderId: string) => void;
}

const initialAddressState: Address = { street: '', city: '', postalCode: '', country: '' };
type PaymentMethod = 'PayPal' | 'Bank Transfer' | 'Cash on Pickup' | 'Stripe';

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderPlaced }) => {
  const { cart, products, settings, addCustomer, addOrder, dispatchCartAction, profile, showToast } = useStore();

  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' });
  const [shippingAddress, setShippingAddress] = useState<Address>(initialAddressState);
  const [billingAddress, setBillingAddress] = useState<Address>(initialAddressState);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pre-populate from profile if available
  useEffect(() => {
    const populateData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (profile || session) {
        setCustomerInfo(prev => ({
          name: profile?.full_name || prev.name,
          email: session?.user?.email || prev.email
        }));

        if (profile?.shipping_address) {
          setShippingAddress(profile.shipping_address);
        }
        if (profile?.billing_address) {
          setBillingAddress(profile.billing_address);
          // If they have a billing address saved that is different from shipping, toggle the checkbox
          if (JSON.stringify(profile.shipping_address) !== JSON.stringify(profile.billing_address)) {
            setBillingSameAsShipping(false);
          }
        }
      }
    };
    populateData();
  }, [profile]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const totalShipping = useMemo(() => {
    const rawShipping = cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.shippingCost || 0) * item.quantity;
    }, 0);

    const adjustment = (settings?.shipping?.adjustmentPercentage || 0) / 100;
    return rawShipping * (1 + adjustment);
  }, [cart, products, settings]);

  const total = subtotal + totalShipping;

  const gstData = useMemo(() => {
    if (settings?.tax?.enabled) {
      const rate = settings.tax.rate;
      // Inclusive calculation: Total * (Rate / (100 + Rate))
      const amount = total * (rate / (100 + rate));
      return { amount, rate, label: settings.tax.label };
    }
    return null;
  }, [total, settings]);

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  }

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
  }

  const validateForm = (): boolean => {
    if (!customerInfo.name || !customerInfo.email) return false;
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) return false;
    if (!billingSameAsShipping && (!billingAddress.street || !billingAddress.city)) return false;
    return true;
  };

  const handlePlaceOrder = async (transactionDetails?: any) => {
    if (cart.length === 0) {
      showToast("Your cart is empty!", 'error');
      return;
    }

    if (!validateForm()) {
      showToast("Please fill in all required contact and address fields.", 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const finalBillingAddress = billingSameAsShipping ? shippingAddress : billingAddress;

      const newCustomerData: Omit<Customer, 'id'> = {
        ...customerInfo,
        shippingAddress,
        billingAddress: finalBillingAddress,
      };
      const savedCustomer = await addCustomer(newCustomerData);

      let finalPaymentMethod = paymentMethod || 'Unknown';
      let orderStatus = 'Pending';

      if (transactionDetails) {
        if (paymentMethod === 'Stripe') {
          finalPaymentMethod = `Credit Card (Stripe Txn: ${transactionDetails.id})`;
          // Set order status based on payment status from Stripe
          if (transactionDetails.status === 'succeeded') {
            orderStatus = 'Processing';
          } else if (transactionDetails.status === 'processing') {
            orderStatus = 'Payment Processing';
          } else {
            orderStatus = 'Payment Failed';
          }
        } else {
          finalPaymentMethod = `PayPal (Txn: ${transactionDetails.id})`;
          orderStatus = 'Processing';
        }
      }

      const newOrderData: Omit<Order, 'id'> = {
        customerId: savedCustomer.id,
        userId: userId,
        items: cart,
        total,
        shippingCost: totalShipping,
        paymentMethod: finalPaymentMethod,
        status: orderStatus,
        orderDate: new Date().toISOString().split('T')[0],
        shippingAddress,
        billingAddress: finalBillingAddress,
        // Save the tax snapshot
        tax: gstData ? {
          rate: gstData.rate,
          label: gstData.label,
          amount: gstData.amount
        } : undefined
      };
      const savedOrder = await addOrder(newOrderData, userId);

      dispatchCartAction({ type: 'CLEAR_CART' });
      showToast("Order placed successfully!", 'success');
      onOrderPlaced(savedOrder.id);
    } catch (error: any) {
      logger.error("Failed to place order:", error);
      showToast(`Failed to place order: ${formatError(error)}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      showToast("Please select a payment method.", 'error');
      return;
    }
    handlePlaceOrder();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-text mb-8 text-center">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side: Forms */}
          <CheckoutForms
            customerInfo={customerInfo}
            shippingAddress={shippingAddress}
            billingAddress={billingAddress}
            billingSameAsShipping={billingSameAsShipping}
            onCustomerInfoChange={handleCustomerInfoChange}
            onShippingChange={handleShippingChange}
            onBillingChange={handleBillingChange}
            onToggleBillingSame={() => setBillingSameAsShipping(!billingSameAsShipping)}
            onSubmit={handleManualSubmit}
          />

          {/* Right Side: Order Summary & Payment */}
          <div className="bg-gray-50 p-8 rounded-lg h-fit sticky top-28">
            <OrderSummary
              cart={cart}
              subtotal={subtotal}
              totalShipping={totalShipping}
              total={total}
              gstData={gstData}
            />
            <PaymentMethods
              total={total}
              paymentMethod={paymentMethod}
              settings={settings}
              onPaymentMethodChange={setPaymentMethod}
              onPlaceOrder={handlePlaceOrder}
              isProcessing={isProcessing}
              customerInfo={customerInfo}
            />
          </div>
        </div>
        <div className="mt-12 text-center">
          <Button onClick={onBack} variant="secondary">&larr; Back to Cart</Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
