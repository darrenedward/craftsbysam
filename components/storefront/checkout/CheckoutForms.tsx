import React from 'react';
import { Input } from '../../ui/Input';
import { AddressForm } from '../../ui/AddressForm';
import { Address } from '../../../types';

interface CheckoutFormsProps {
  customerInfo: { name: string; email: string };
  shippingAddress: Address;
  billingAddress: Address;
  billingSameAsShipping: boolean;
  onCustomerInfoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShippingChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBillingChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleBillingSame: () => void;
  onSubmit?: (e: React.FormEvent) => void;
}

export const CheckoutForms: React.FC<CheckoutFormsProps> = ({
  customerInfo,
  shippingAddress,
  billingAddress,
  billingSameAsShipping,
  onCustomerInfoChange,
  onShippingChange,
  onBillingChange,
  onToggleBillingSame,
  onSubmit,
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
      <form id="checkout-form" onSubmit={onSubmit}>
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold mb-4 text-brand-text">Contact Information</legend>
          <Input
            label="Full Name"
            name="name"
            type="text"
            value={customerInfo.name}
            onChange={onCustomerInfoChange}
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={customerInfo.email}
            onChange={onCustomerInfoChange}
            required
          />
        </fieldset>

        <div className="mt-8">
          <AddressForm
            title="Shipping Address"
            address={shippingAddress}
            onChange={onShippingChange}
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center">
            <input
              id="billingSameAsShipping"
              type="checkbox"
              checked={billingSameAsShipping}
              onChange={onToggleBillingSame}
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
              onChange={onBillingChange}
            />
          </div>
        )}
      </form>
    </div>
  );
};
