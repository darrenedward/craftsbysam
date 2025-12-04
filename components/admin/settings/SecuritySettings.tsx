


import React, { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { StoreSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { formatError } from '../../../utils/errorHelper';

const SecuritySettings = () => {
  const { settings: initialSettings, updateSettings, showToast } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  if (!settings) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading settings...</div>;
  }

  const handleRecaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setSettings(prev => prev ? ({
        ...prev,
        recaptcha: { ...prev.recaptcha, [name]: val } as any
    }) : null);
  };

  const handleForce2faChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings(prev => prev ? ({
          ...prev,
          security: { ...prev.security, force2fa: e.target.checked }
      }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      try {
          await updateSettings(settings);
          showToast("Security settings saved successfully", 'success');
      } catch (err) {
          console.error(err);
          showToast(`Failed to save security settings: ${formatError(err)}`, 'error');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-brand-text">Security & Integrations</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="border-t border-brand-border pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
               Account Security
           </h3>
            <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                    <div>
                        <label htmlFor="force2fa" className="font-medium text-brand-text block">Force Two-Factor Authentication (2FA)</label>
                        <p className="text-sm text-gray-500 mt-1">
                            If enabled, all users (including admins) will be required to set up 2FA before they can access the store dashboard or account page.
                        </p>
                    </div>
                    <input 
                        type="checkbox" 
                        id="force2fa" 
                        name="force2fa" 
                        checked={settings.security?.force2fa || false} 
                        onChange={handleForce2faChange} 
                        className="h-5 w-5 rounded text-brand-pink focus:ring-brand-pink"
                    />
                </div>
            </div>
        </div>

         <div className="border-t border-brand-border pt-6">
           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
               Google reCAPTCHA v2
           </h3>
           <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                    <label htmlFor="enabled" className="font-medium text-brand-text">Enable Contact Form Captcha</label>
                    <input 
                        type="checkbox" 
                        id="enabled" 
                        name="enabled" 
                        checked={settings.recaptcha?.enabled || false} 
                        onChange={handleRecaptchaChange} 
                        className="h-5 w-5 rounded text-brand-pink focus:ring-brand-pink"
                    />
                </div>
                
                {settings.recaptcha?.enabled && (
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                        <Input 
                            label="Site Key" 
                            id="siteKey" 
                            name="siteKey" 
                            value={settings.recaptcha?.siteKey || ''} 
                            onChange={handleRecaptchaChange} 
                            helperText="Public key from Google reCAPTCHA console."
                        />
                        <Input 
                            label="Secret Key" 
                            id="secretKey" 
                            name="secretKey" 
                            value={settings.recaptcha?.secretKey || ''} 
                            onChange={handleRecaptchaChange} 
                            type="password"
                            helperText="Private key for server-side validation. (Note: Full security requires backend edge functions)."
                        />
                    </div>
                )}
                <p className="text-xs text-gray-500 mt-4">
                    Protects your contact form from spam bots. Get your keys from <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google reCAPTCHA Admin</a>.
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

export default SecuritySettings;