


import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AddressForm } from '../ui/AddressForm';
import { Customer, Address, Order } from '../../types';
import { supabase } from '../../supabaseClient';
import { formatError } from '../../utils/errorHelper';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '../../utils/stripeLoader';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderPlaced: (orderId: string) => void;
}

const initialAddressState: Address = { street: '', city: '', postalCode: '', country: '' };
type PaymentMethod = 'PayPal' | 'Bank Transfer' | 'Cash on Pickup' | 'Stripe';

// --- PayPal Button Component ---
const PayPalButtons: React.FC<{ 
    amount: number; 
    clientId: string; 
    onSuccess: (details: any) => void; 
    onError: (err: any) => void; 
}> = ({ amount, clientId, onSuccess, onError }) => {
    const buttonContainerRef = useRef<HTMLDivElement>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Check if script is already loaded
        if (document.getElementById('paypal-sdk')) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=NZD`;
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => onError("Failed to load PayPal SDK.");
        document.body.appendChild(script);

        return () => {
            // Optional: cleanup if needed, though usually keeping SDK loaded is fine
        };
    }, [clientId, onError]);

    useEffect(() => {
        if (scriptLoaded && buttonContainerRef.current && (window as any).paypal) {
            // Clear container first to prevent duplicates
            buttonContainerRef.current.innerHTML = '';

            (window as any).paypal.Buttons({
                createOrder: (data: any, actions: any) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount.toFixed(2)
                            }
                        }]
                    });
                },
                onApprove: (data: any, actions: any) => {
                    return actions.order.capture().then((details: any) => {
                        onSuccess(details);
                    });
                },
                onError: (err: any) => {
                    console.error("PayPal Error:", err);
                    onError(err);
                }
            }).render(buttonContainerRef.current);
        }
    }, [scriptLoaded, amount, onSuccess, onError]);

    if (!scriptLoaded) return <div className="text-center text-gray-500 py-4">Loading secure payment...</div>;

    return <div ref={buttonContainerRef} className="mt-4 z-0 relative"></div>;
};

// --- Stripe Payment Component ---
const StripePaymentForm: React.FC<{ 
    amount: number; 
    onSubmit: (paymentMethodId: string) => Promise<void>; 
    isProcessing: boolean 
}> = ({ amount, onSubmit, isProcessing }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            console.error(error);
            setError(error.message || 'An unknown error occurred');
        } else if (paymentMethod) {
            setError(null);
            await onSubmit(paymentMethod.id);
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
                disabled={!stripe || isProcessing} 
                className="w-full mt-4 py-2"
            >
                {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </Button>
            <div className="flex items-center justify-center gap-1 mt-3">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                <span className="text-xs text-gray-400">Secure SSL Encrypted</span>
            </div>
        </form>
    );
};


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
        if (transactionDetails) {
            if (paymentMethod === 'Stripe') {
                finalPaymentMethod = `Credit Card (Stripe Txn: ${transactionDetails.id || transactionDetails})`;
            } else {
                finalPaymentMethod = `PayPal (Txn: ${transactionDetails.id})`;
            }
        }

        const newOrderData: Omit<Order, 'id'> = {
            customerId: savedCustomer.id,
            userId: userId,
            items: cart,
            total,
            shippingCost: totalShipping,
            paymentMethod: finalPaymentMethod,
            // PayPal/Stripe orders are technically paid/processing, others are pending
            status: transactionDetails ? 'Processing' : 'Pending', 
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
        console.error("Failed to place order:", error);
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
  
  const handleStripeSubmit = async (paymentMethodId: string) => {
      // In a real app, you would send this paymentMethodId to your backend
      // to create a PaymentIntent and confirm the payment using the secret key.
      // Since this is a client-side demo without edge functions, we will mock the server confirmation.
      
      // Mock server processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Proceed with order placement assuming success
      await handlePlaceOrder(paymentMethodId);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-brand-text mb-8 text-center">Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Left Side: Forms */}
                <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
                    <form id="checkout-form" onSubmit={handleManualSubmit}>
                        <fieldset className="space-y-4">
                        <legend className="text-xl font-semibold mb-4 text-brand-text">Contact Information</legend>
                            <Input label="Full Name" name="name" type="text" value={customerInfo.name} onChange={handleCustomerInfoChange} required />
                            <Input label="Email Address" name="email" type="email" value={customerInfo.email} onChange={handleCustomerInfoChange} required />
                        </fieldset>
                        
                        <div className="mt-8">
                            <AddressForm 
                                title="Shipping Address" 
                                address={shippingAddress} 
                                onChange={handleShippingChange} 
                            />
                        </div>
                        
                        <div className="mt-4">
                            <div className="flex items-center">
                                <input
                                    id="billingSameAsShipping"
                                    type="checkbox"
                                    checked={billingSameAsShipping}
                                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                                    className="h-4 w-4 text-brand-pink border-gray-300 rounded focus:ring-brand-pink"
                                />
                                <label htmlFor="billingSameAsShipping" className="ml-2 block text-sm text-brand-text">
                                    Billing address is the same as shipping
                                </label>
                            </div>
                        </div>
                        
                        {!billingSameAsShipping && (
                            <div className="mt-4">
                                <AddressForm 
                                    title="Billing Address" 
                                    address={billingAddress} 
                                    onChange={handleBillingChange} 
                                />
                            </div>
                        )}
                    </form>
                </div>

                {/* Right Side: Order Summary & Payment */}
                <div className="bg-gray-50 p-8 rounded-lg h-fit sticky top-28">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-brand-text">Your Order</h2>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {cart.map(item => (
                            <div key={item.cartItemId} className="flex justify-between text-sm">
                                <span>{item.productName} x {item.quantity}</span>
                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t mt-4 pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>${totalShipping.toFixed(2)}</span>
                        </div>
                        {gstData && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Includes {gstData.label} ({gstData.rate}%)</span>
                                <span>${gstData.amount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg text-brand-text border-t border-gray-200 pt-2 mt-2">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-brand-text">Payment Method</h3>
                        <div className="space-y-4">
                            {/* Manual Methods */}
                            {settings?.payment?.bankTransfer?.enabled && (
                                <div>
                                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 bg-white">
                                        <input type="radio" name="paymentMethod" value="Bank Transfer" checked={paymentMethod === 'Bank Transfer'} onChange={() => setPaymentMethod('Bank Transfer')} className="h-4 w-4 text-brand-pink focus:ring-brand-pink"/>
                                        <span className="ml-3 font-medium">Bank Transfer</span>
                                    </label>
                                    {paymentMethod === 'Bank Transfer' && (
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 whitespace-pre-wrap">{settings.payment.bankTransfer.instructions}</div>
                                    )}
                                </div>
                            )}
                             {settings?.payment?.cashOnPickup?.enabled && (
                                <div>
                                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 bg-white">
                                        <input type="radio" name="paymentMethod" value="Cash on Pickup" checked={paymentMethod === 'Cash on Pickup'} onChange={() => setPaymentMethod('Cash on Pickup')} className="h-4 w-4 text-brand-pink focus:ring-brand-pink"/>
                                        <span className="ml-3 font-medium">Cash on Pickup</span>
                                    </label>
                                    {paymentMethod === 'Cash on Pickup' && (
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 whitespace-pre-wrap">{settings.payment.cashOnPickup.instructions}</div>
                                    )}
                                </div>
                            )}
                            
                            {/* Online Methods */}
                             {settings?.payment?.paypal?.enabled && (
                                <div>
                                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 bg-white">
                                        <input type="radio" name="paymentMethod" value="PayPal" checked={paymentMethod === 'PayPal'} onChange={() => setPaymentMethod('PayPal')} className="h-4 w-4 text-brand-pink focus:ring-brand-pink"/>
                                        <span className="ml-3 font-medium">PayPal</span>
                                    </label>
                                </div>
                            )}
                            {settings?.payment?.stripe?.enabled && (
                                <div>
                                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 bg-white">
                                        <input type="radio" name="paymentMethod" value="Stripe" checked={paymentMethod === 'Stripe'} onChange={() => setPaymentMethod('Stripe')} className="h-4 w-4 text-brand-pink focus:ring-brand-pink"/>
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
                                onSuccess={handlePlaceOrder}
                                onError={(err) => showToast(`Payment Error: ${JSON.stringify(err)}`, 'error')}
                            />
                        ) : paymentMethod === 'Stripe' && settings?.payment?.stripe?.publishableKey ? (
                            <Elements stripe={getStripe(settings.payment.stripe.publishableKey)}>
                                <StripePaymentForm 
                                    amount={total} 
                                    onSubmit={handleStripeSubmit} 
                                    isProcessing={isProcessing}
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