


import React, { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { StoreSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import SecuritySettings from './SecuritySettings';
import TaxSettings from './TaxSettings';
import InvoiceSettings from './InvoiceSettings';
import AiSettings from './AiSettings';
import { formatError } from '../../../utils/errorHelper';

type SettingsTab = 'Shipping' | 'Payment' | 'Tax' | 'Invoice' | 'SEO' | 'Analytics' | 'Security' | 'AI Integration';

const SettingsPage = () => {
  const { settings: initialSettings, updateSettings, showToast } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('Shipping');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Keep local state in sync if global state changes
    setSettings(initialSettings);
  }, [initialSettings]);

  const tabs: SettingsTab[] = ['Shipping', 'Payment', 'Tax', 'Invoice', 'SEO', 'Analytics', 'Security', 'AI Integration'];

  if (!settings) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading settings...</div>;
  }

  const handleNestedChange = (section: keyof StoreSettings, field: string, value: any) => {
    setSettings(prev => {
        if (!prev) return null;
        const newSettings = { ...prev };
        (newSettings[section] as any)[field] = value;
        return newSettings;
    });
  }
  
  const handlePaymentSubChange = (method: 'paypal' | 'bankTransfer' | 'cashOnPickup' | 'stripe', field: string, value: any) => {
      setSettings(prev => {
        if (!prev) return null;
        const newSettings = { ...prev };
        (newSettings.payment[method] as any)[field] = value;
        return newSettings;
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
        await updateSettings(settings);
        showToast("Settings saved successfully!", 'success');
    } catch (error) {
        console.error("Failed to save settings:", error);
        showToast(`Failed to save settings: ${formatError(error)}`, 'error');
    } finally {
        setSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
        case 'Shipping':
             return (
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-brand-text">Shipping Settings</h3>
                    <Input 
                        label="Shipping Cost Adjustment (%)" 
                        id="adjustmentPercentage" 
                        name="adjustmentPercentage" 
                        type="number"
                        value={settings.shipping.adjustmentPercentage} 
                        onChange={e => handleNestedChange('shipping', 'adjustmentPercentage', parseFloat(e.target.value) || 0)}
                        helperText="Increase or decrease the total calculated shipping cost. E.g., 10 for a 10% increase, -5 for a 5% discount."
                    />
                </div>
             );
        case 'Payment':
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-brand-text">Payment Methods</h3>
                    
                    {/* Stripe */}
                    <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-6 w-6 text-[#635BFF] fill-current">
                                    <path d="M12.5 12.5c0-1.5 1.2-2.6 3.1-2.6 2.2 0 3.7.8 4.7 1.3l.8-3.4C20 7.2 18.1 6.5 15.8 6.5c-4.5 0-7.6 2.4-7.6 6.7 0 2.9 1.1 4.3 3.7 5.6 2.7 1.3 3.3 2.1 3.3 3.3 0 1.1-.8 2.1-3.3 2.1-2.1 0-4.4-.9-5.5-1.6l-.9 3.6c1.4.7 3.9 1.3 6.4 1.3 4.8 0 7.9-2.3 7.9-6.8 0-2.4-.8-4.3-3.8-5.8-3.2-1.5-3.5-2.2-3.5-3.2v.8z"/>
                                </svg>
                                <label htmlFor="stripeEnabled" className="font-medium text-brand-text">Credit Card (Stripe)</label>
                            </div>
                            <input type="checkbox" id="stripeEnabled" checked={settings.payment.stripe?.enabled || false} onChange={e => handlePaymentSubChange('stripe', 'enabled', e.target.checked)} className="h-5 w-5 rounded text-brand-pink focus:ring-brand-pink"/>
                        </div>
                        {settings.payment.stripe?.enabled && (
                            <div className="mt-4 pt-4 border-t space-y-4">
                                <Input 
                                    label="Publishable Key" 
                                    name="publishableKey" 
                                    value={settings.payment.stripe.publishableKey} 
                                    onChange={e => handlePaymentSubChange('stripe', 'publishableKey', e.target.value)} 
                                    placeholder="pk_test_..."
                                    helperText="Found in Stripe Dashboard > Developers > API Keys."
                                />
                                <Input 
                                    label="Secret Key" 
                                    name="secretKey" 
                                    type="password"
                                    value={settings.payment.stripe.secretKey} 
                                    onChange={e => handlePaymentSubChange('stripe', 'secretKey', e.target.value)} 
                                    placeholder="sk_test_..."
                                    helperText="SECURITY WARNING: In a production app, this key should be stored on a backend server, not here. This field is provided for demonstration purposes."
                                />
                            </div>
                        )}
                    </div>

                    {/* PayPal */}
                    <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                            <label htmlFor="paypalEnabled" className="font-medium text-brand-text">PayPal Checkout</label>
                            <input type="checkbox" id="paypalEnabled" checked={settings.payment.paypal.enabled} onChange={e => handlePaymentSubChange('paypal', 'enabled', e.target.checked)} className="h-5 w-5 rounded text-brand-pink focus:ring-brand-pink"/>
                        </div>
                        {settings.payment.paypal.enabled && (
                            <div className="mt-4 pt-4 border-t">
                                <Input label="PayPal Client ID" name="clientId" value={settings.payment.paypal.clientId} onChange={e => handlePaymentSubChange('paypal', 'clientId', e.target.value)} helperText="Required for PayPal integration."/>
                            </div>
                        )}
                    </div>
                    {/* Bank Transfer */}
                     <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                            <label htmlFor="bankTransferEnabled" className="font-medium text-brand-text">Bank Transfer</label>
                            <input type="checkbox" id="bankTransferEnabled" checked={settings.payment.bankTransfer.enabled} onChange={e => handlePaymentSubChange('bankTransfer', 'enabled', e.target.checked)} className="h-5 w-5 rounded text-brand-pink focus:ring-brand-pink"/>
                        </div>
                        {settings.payment.bankTransfer.enabled && (
                            <div className="mt-4 pt-4 border-t">
                                <label className="block text-sm font-medium text-brand-light-text mb-1">Bank Transfer Instructions</label>
                                <textarea value={settings.payment.bankTransfer.instructions} onChange={e => handlePaymentSubChange('bankTransfer', 'instructions', e.target.value)} rows={4} className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink sm:text-sm bg-white text-brand-text" />
                                <p className="mt-2 text-xs text-gray-500">These instructions will be shown to the customer at checkout.</p>
                            </div>
                        )}
                    </div>
                     {/* Cash on Pickup */}
                     <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                            <label htmlFor="cashOnPickupEnabled" className="font-medium text-brand-text">Cash on Pickup</label>
                            <input type="checkbox" id="cashOnPickupEnabled" checked={settings.payment.cashOnPickup.enabled} onChange={e => handlePaymentSubChange('cashOnPickup', 'enabled', e.target.checked)} className="h-5 w-5 rounded text-brand-pink focus:ring-brand-pink"/>
                        </div>
                        {settings.payment.cashOnPickup.enabled && (
                            <div className="mt-4 pt-4 border-t">
                                <label className="block text-sm font-medium text-brand-light-text mb-1">Cash on Pickup Instructions</label>
                                <textarea value={settings.payment.cashOnPickup.instructions} onChange={e => handlePaymentSubChange('cashOnPickup', 'instructions', e.target.value)} rows={3} className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink sm:text-sm bg-white text-brand-text" />
                                 <p className="mt-2 text-xs text-gray-500">Provide details for pickup arrangements.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'Tax':
            return <TaxSettings />;
        case 'Invoice':
            return <InvoiceSettings />;
        case 'SEO':
            return (
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-brand-text">Search Engine Optimization</h3>
                    <Input label="Meta Title" id="metaTitle" name="metaTitle" value={settings.seo.metaTitle} onChange={e => handleNestedChange('seo', 'metaTitle', e.target.value)} helperText="The title that appears in search engine results and browser tabs." />
                    <div>
                        <label htmlFor="metaDescription" className="block text-sm font-medium text-brand-light-text mb-1">Meta Description</label>
                        <textarea id="metaDescription" name="metaDescription" value={settings.seo.metaDescription} onChange={e => handleNestedChange('seo', 'metaDescription', e.target.value)} rows={3} className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text" />
                        <p className="mt-2 text-xs text-gray-500">A brief summary of your page's content for search engine results.</p>
                    </div>
                </div>
            );
        case 'Analytics':
            return (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-brand-text">Analytics</h3>
                    <Input label="Google Analytics ID" id="googleAnalyticsId" name="googleAnalyticsId" value={settings.analytics.googleAnalyticsId} onChange={e => handleNestedChange('analytics', 'googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" helperText="Used to track website traffic and user behavior."/>
                </div>
            );
        case 'Security':
            return <SecuritySettings />;
        case 'AI Integration':
            return <AiSettings />;
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-brand-text">Store Configuration</h2>
      <p className="text-sm text-gray-500 mb-6">Manage technical settings like shipping, payments, taxes, and security.</p>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto pb-2" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${activeTab === tab 
                  ? 'border-brand-pink text-brand-header' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        <div className="min-h-[300px]">
           {renderContent()}
        </div>
        <div className="flex justify-end items-center pt-6 mt-6 border-t">
            <Button type="button" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;