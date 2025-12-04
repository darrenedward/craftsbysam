

import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { StoreSettings } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase, supabaseUrl } from '../../supabaseClient';

const SettingsEditor = () => {
  // FIX: Destructure settings and updateSettings correctly from the context.
  const { settings: initialSettings, updateSettings } = useStore();
  // FIX: Initialize state with initialSettings from context and allow null.
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  // FIX: Handle the case where settings are not yet loaded.
  if (!settings) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading settings...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? ({ ...prev, [name]: value }) : null);
  };
  
  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? ({
        ...prev,
        socials: { ...prev.socials, [name]: value }
    }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Use the updateSettings function from the context, not dispatch.
    if (settings) {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };
  
  const getPublicUrl = (filename: string): string => {
    return `${supabaseUrl}/storage/v1/object/public/product-images/${filename}`;
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const fileName = `logo-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

    if (uploadError) {
        setError(uploadError.message);
        console.error('Error uploading logo:', uploadError);
    } else {
        const publicUrl = getPublicUrl(fileName);
        setSettings(prev => prev ? ({ ...prev, logoUrl: publicUrl }) : null);
    }
    setUploading(false);
    event.target.value = ''; // Reset file input
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-brand-text">Storefront Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Logo Text" id="logoText" name="logoText" value={settings.logoText} onChange={handleChange} />
          <div>
            <label htmlFor="logoTextColor" className="block text-sm font-medium text-brand-light-text mb-1">Logo Text Color</label>
            <input type="color" id="logoTextColor" name="logoTextColor" value={settings.logoTextColor} onChange={handleChange} className="h-10 w-full border border-brand-border rounded-md"/>
          </div>
          <Input label="Tagline" id="tagline" name="tagline" value={settings.tagline} onChange={handleChange} />
          <div>
            <label htmlFor="taglineColor" className="block text-sm font-medium text-brand-light-text mb-1">Tagline Color</label>
            <input type="color" id="taglineColor" name="taglineColor" value={settings.taglineColor} onChange={handleChange} className="h-10 w-full border border-brand-border rounded-md"/>
          </div>
        </div>
        
        <div className="border-t border-brand-border pt-6">
            <h3 className="text-lg font-semibold mb-2">Store Logo</h3>
            <div className="flex items-center gap-6">
                <img 
                    src={settings.logoUrl || 'https://placehold.co/150x50/f8cadd/4a5568?text=Your+Logo'} 
                    alt="Logo preview" 
                    className="h-16 w-auto object-contain bg-gray-100 rounded-md border border-brand-border"
                />
                <div className="relative">
                    <Button type="button" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                    <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Upload new logo"
                    />
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="border-t border-brand-border pt-6">
          <h3 className="text-lg font-semibold mb-2">Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input label="Instagram URL" id="instagram" name="instagram" value={settings.socials.instagram} onChange={handleSocialChange} />
             <Input label="Facebook URL" id="facebook" name="facebook" value={settings.socials.facebook} onChange={handleSocialChange} />
             <Input label="TikTok URL" id="tiktok" name="tiktok" value={settings.socials.tiktok} onChange={handleSocialChange} />
             <Input label="YouTube URL" id="youtube" name="youtube" value={settings.socials.youtube || ''} onChange={handleSocialChange} />
          </div>
        </div>

        <div className="border-t border-brand-border pt-6">
           <h3 className="text-lg font-semibold mb-2">Business Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Address" id="address" name="address" value={settings.address} onChange={handleChange} />
              <Input label="Opening Hours" id="openingHours" name="openingHours" value={settings.openingHours} onChange={handleChange} />
            </div>
        </div>

        <div className="flex justify-end items-center">
            {saved && <span className="text-green-600 mr-4">Settings saved!</span>}
            <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsEditor;
