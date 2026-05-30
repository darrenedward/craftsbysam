import React from 'react';

interface OrderSummaryProps {
  cart: Array<{
    cartItemId: string;
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  totalShipping: number;
  total: number;
  gstData: { amount: number; rate: number; label: string } | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cart,
  subtotal,
  totalShipping,
  total,
  gstData,
}) => {
  return (
    <>
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
    </>
  );
};
