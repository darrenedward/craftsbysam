
import React, { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { StoreSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { formatError } from '../../../utils/errorHelper';

const InvoiceSettings = () => {
  const { settings: initialSettings, updateSettings, showToast } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  if (!settings) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading settings...</div>;
  }

  const handleTermsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSettings(prev => prev ? ({
          ...prev,
          invoiceTerms: e.target.value
      }) : null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      try {
          await updateSettings(settings);
          showToast("Invoice settings saved successfully", 'success');
      } catch (err) {
          console.error(err);
          showToast(`Failed to save invoice settings: ${formatError(err)}`, 'error');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-brand-text">Invoice Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="border-t border-brand-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Footer & Legal Terms</h3>
             <div className="p-4 border rounded-lg bg-gray-50">
                <label htmlFor="invoiceTerms" className="block text-sm font-medium text-brand-text mb-1">Conditions of Sale / Footer Text</label>
                <textarea 
                    id="invoiceTerms"
                    name="invoiceTerms"
                    value={settings.invoiceTerms || ''}
                    onChange={handleTermsChange}
                    rows={6}
                    className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink sm:text-sm bg-white text-brand-text"
                />
                <p className="text-xs text-gray-500 mt-2">
                    This text will appear at the bottom of every PDF invoice generated for your customers. 
                    <br/>
                    <strong>Tip:</strong> Include payment terms (e.g. "Due in 7 days"), bank details (if not using the automatic payment block), and title retention clauses.
                </p>
             </div>
        </div>
        
        <div className="flex justify-end items-center mt-6">
            <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceSettings;
