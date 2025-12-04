
import React, { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { StoreSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { supabase, supabaseUrl } from '../../../supabaseClient';

const AppearanceEditor = () => {
  const { settings: initialSettings, updateSettings } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };
  
  const getPublicUrl = (filename: string): string => {
    return `${supabaseUrl}/storage/v1/object/public/product-images/${filename}`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const fileName = `${type}-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

    if (uploadError) {
        setError(uploadError.message);
        console.error(`Error uploading ${type}:`, uploadError);
    } else {
        const publicUrl = getPublicUrl(fileName);
        setSettings(prev => {
            if(!prev) return null;
            return type === 'logo' ? { ...prev, logoUrl: publicUrl } : { ...prev, heroImageUrl: publicUrl };
        });
    }
    setUploading(false);
    event.target.value = ''; // Reset file input
  };

  return (
    <div className="space-y-6">
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
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Upload new logo"
                  />
              </div>
          </div>
      </div>

      <div className="border-t border-brand-border pt-6">
          <h3 className="text-lg font-semibold mb-2">Hero Banner Image</h3>
          <p className="text-sm text-gray-500 mb-2">The main large image on your homepage.</p>
          <div className="flex items-center gap-6">
              <img 
                  src={settings.heroImageUrl || 'https://placehold.co/600x200/f8cadd/4a5568?text=Hero+Banner'} 
                  alt="Hero banner preview" 
                  className="h-24 w-auto object-cover bg-gray-100 rounded-md border border-brand-border"
              />
              <div className="relative">
                  <Button type="button" disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Banner'}
                  </Button>
                  <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={(e) => handleFileUpload(e, 'hero')}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Upload hero banner"
                  />
              </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="flex justify-end items-center mt-6">
          {saved && <span className="text-green-600 mr-4">Appearance saved!</span>}
          <Button type="submit" onClick={handleSubmit}>Save Appearance</Button>
      </div>
    </div>
  );
};

export default AppearanceEditor;
