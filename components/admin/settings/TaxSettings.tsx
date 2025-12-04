
import React, { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { StoreSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { formatError } from '../../../utils/errorHelper';

const TaxSettings = () => {
  const { settings: initialSettings, updateSettings, showToast } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  if (!settings) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading settings...</div>;
  }

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setSettings(prev => prev ? ({
        ...prev,
        tax: { 
            ...prev.tax, 
            [name]: type === 'number' ? parseFloat(value) : val 
        }
    }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      try {
          await updateSettings(settings);
          showToast("Tax settings saved successfully", 'success');
      } catch (err) {
          console.error(err);
          showToast(`Failed to save tax settings: ${formatError(err)}`, 'error');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-brand-text">Tax Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
         <div className="border-t border-brand-border pt-6">
           <h3 className="text-lg font-semibold mb-4">Goods and Services Tax (GST)</h3>
           <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                    <label htmlFor="enabled" className="font-medium text-brand-text">Charge Tax (GST)</label>
                    <input 
                        type="checkbox" 
                        id="enabled" 
                        name="enabled" 
                        checked={settings.tax?.enabled || false} 
                        onChange={handleTaxChange} 
                        className="h-5 w-5 rounded text-brand-pink focus:ring-brand-pink"
                    />
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    Only enable this if you are registered for GST. If disabled, tax will not be calculated or shown on invoices.
                </p>
                
                {settings.tax?.enabled && (
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Tax Label" 
                                id="label" 
                                name="label" 
                                value={settings.tax?.label || 'GST'} 
                                onChange={handleTaxChange} 
                                placeholder="GST"
                                helperText="The name of the tax displayed on invoices (e.g., GST, VAT)."
                            />
                            <Input 
                                label="Tax Rate (%)" 
                                id="rate" 
                                name="rate" 
                                type="number"
                                step="any"
                                value={settings.tax?.rate || 15} 
                                onChange={handleTaxChange} 
                                placeholder="15"
                                helperText="The percentage rate included in your prices. (e.g. 12.5 or 15)"
                            />
                        </div>
                        <Input 
                            label="Tax Number / GST Number" 
                            id="taxNumber" 
                            name="taxNumber" 
                            value={settings.tax?.taxNumber || ''} 
                            onChange={handleTaxChange} 
                            placeholder="123-456-789"
                            helperText="Required for tax invoices."
                        />
                    </div>
                )}
           </div>
        </div>
        
        <div className="flex justify-end items-center mt-6">
            <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </div>
  );
};

export default TaxSettings;
