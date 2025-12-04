
import React, { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { StoreSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { formatError } from '../../../utils/errorHelper';

const AboutSettings = () => {
  const { settings: initialSettings, updateSettings, showToast } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  const handleContentChange = (content: string) => {
    setSettings(prev => prev ? ({ ...prev, aboutUsContent: content }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      setSaving(true);
      try {
          await updateSettings(settings);
          showToast("About Us content saved successfully", 'success');
      } catch (err) {
          console.error(err);
          showToast(`Failed to save content: ${formatError(err)}`, 'error');
      } finally {
          setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 mb-6">
          Use the editor below to customize the content shown on your storefront's "About Us" page. 
          You can format text and insert images from your gallery.
      </p>
      
      <div className="mb-8">
          <RichTextEditor 
              value={settings.aboutUsContent || ''} 
              onChange={handleContentChange} 
          />
      </div>
      
      <div className="flex justify-end items-center mt-6">
          <Button type="submit" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Content'}
          </Button>
      </div>
    </div>
  );
};

export default AboutSettings;
