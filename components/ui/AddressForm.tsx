
import React from 'react';
import { Input } from './Input';
import { Address } from '../../types';

interface AddressFormProps {
    address: Address;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    title?: string;
    disabled?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({ address, onChange, title, disabled = false }) => (
    <fieldset className="space-y-4" disabled={disabled}>
        {title && <legend className="text-xl font-semibold mb-4 text-brand-text">{title}</legend>}
        <Input 
            label="Street Address" 
            name="street" 
            type="text" 
            value={address.street} 
            onChange={onChange} 
            required 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
                label="City" 
                name="city" 
                type="text" 
                value={address.city} 
                onChange={onChange} 
                required 
            />
            <Input 
                label="Postal Code" 
                name="postalCode" 
                type="text" 
                value={address.postalCode} 
                onChange={onChange} 
                required 
            />
        </div>
        <Input 
            label="Country" 
            name="country" 
            type="text" 
            value={address.country} 
            onChange={onChange} 
            required 
        />
    </fieldset>
);
