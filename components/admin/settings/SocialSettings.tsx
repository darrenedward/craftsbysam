
import React, { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { StoreSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { formatError } from '../../../utils/errorHelper';

const SocialSettings = () => {
  const { settings: initialSettings, updateSettings, showToast } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? ({
        ...prev,
        socials: { ...prev.socials, [name]: value }
    }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      setSaving(true);
      try {
          await updateSettings(settings);
          showToast("Social media settings saved successfully", 'success');
      } catch (err) {
          console.error(err);
          showToast(`Failed to save settings: ${formatError(err)}`, 'error');
      } finally {
          setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 mb-6">Add links to your social media profiles to display them in the website footer.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Instagram URL" id="instagram" name="instagram" value={settings.socials.instagram} onChange={handleSocialChange} placeholder="https://instagram.com/..." />
          <Input label="Facebook URL" id="facebook" name="facebook" value={settings.socials.facebook} onChange={handleSocialChange} placeholder="https://facebook.com/..." />
          <Input label="TikTok URL" id="tiktok" name="tiktok" value={settings.socials.tiktok} onChange={handleSocialChange} placeholder="https://tiktok.com/..." />
          <Input label="YouTube URL" id="youtube" name="youtube" value={settings.socials.youtube || ''} onChange={handleSocialChange} placeholder="https://youtube.com/..." />
      </div>

      <div className="flex justify-end items-center mt-6 border-t pt-6">
          <Button type="submit" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save Social Links'}</Button>
      </div>
    </div>
  );
};

export default SocialSettings;
