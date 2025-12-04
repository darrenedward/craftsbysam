import React, { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { StoreSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

const AnalyticsSeo = () => {
  // FIX: Destructure settings and updateSettings correctly from the context.
  const { settings: initialSettings, updateSettings } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  if (!settings) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading settings...</div>;
  }

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? ({
        ...prev,
        seo: { ...prev.seo, [name]: value }
    }) : null);
  };
  
  const handleAnalyticsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? ({
        ...prev,
        analytics: { ...prev.analytics, [name]: value }
    }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-brand-text">SEO & Analytics</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
         <div className="border-t border-brand-border pt-6">
           <h3 className="text-lg font-semibold mb-2">Search Engine Optimization (SEO)</h3>
            <div className="space-y-4">
              <Input label="Meta Title" id="metaTitle" name="metaTitle" value={settings.seo.metaTitle} onChange={handleSeoChange} helperText="The title that appears in search engine results and browser tabs." />
               <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-brand-light-text mb-1">Meta Description</label>
                  <textarea id="metaDescription" name="metaDescription" value={settings.seo.metaDescription} onChange={handleSeoChange} rows={3} className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text" />
                   <p className="mt-2 text-xs text-gray-500">A brief summary of your page's content for search engine results.</p>
               </div>
            </div>
        </div>

        <div className="border-t border-brand-border pt-6">
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <div className="space-y-4">
             <Input label="Google Analytics ID" id="googleAnalyticsId" name="googleAnalyticsId" value={settings.analytics.googleAnalyticsId} onChange={handleAnalyticsChange} placeholder="G-XXXXXXXXXX" helperText="Used to track website traffic and user behavior."/>
          </div>
        </div>

        <div className="flex justify-end items-center mt-6">
            {saved && <span className="text-green-600 mr-4">Settings saved!</span>}
            <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </div>
  );
};

export default AnalyticsSeo;
