
import React, { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { StoreSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { formatError } from '../../../utils/errorHelper';

const BusinessSettings = () => {
  const { settings: initialSettings, updateSettings, showToast } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);
  const [saving, setSaving] = useState(false);

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
      setSaving(true);
      try {
        await updateSettings(settings);
        showToast("Business settings saved successfully", 'success');
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Address" id="address" name="address" value={settings.address} onChange={handleChange} />
        <Input label="Phone Number" id="phone" name="phone" value={settings.phone} onChange={handleChange} />
        <div className="md:col-span-2">
            <Input label="Opening Hours" id="openingHours" name="openingHours" value={settings.openingHours} onChange={handleChange} />
        </div>
      </div>

      <div className="flex justify-end items-center mt-6 border-t pt-6">
          <Button type="submit" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save Business Info'}</Button>
      </div>
    </div>
  );
};

export default BusinessSettings;
