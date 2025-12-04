

import React, { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { StoreSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { formatError } from '../../../utils/errorHelper';

const AiSettings = () => {
  const { settings: initialSettings, updateSettings, showToast } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  if (!settings) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading settings...</div>;
  }

  const handleAiChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setSettings(prev => prev ? ({
        ...prev,
        ai: { 
            ...prev.ai, 
            [name]: val 
        }
    }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      try {
          await updateSettings(settings);
          showToast("AI settings saved successfully", 'success');
      } catch (err) {
          console.error(err);
          showToast(`Failed to save AI settings: ${formatError(err)}`, 'error');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-brand-text">AI Integration</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
         <div className="border-t border-brand-border pt-6">
           <h3 className="text-lg font-semibold mb-4">Gemini AI Configuration</h3>
           <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                    <label htmlFor="enabled" className="font-medium text-brand-text">Enable AI Shopping Assistant</label>
                    <input 
                        type="checkbox" 
                        id="enabled" 
                        name="enabled" 
                        checked={settings.ai?.enabled || false} 
                        onChange={handleAiChange} 
                        className="h-5 w-5 rounded text-brand-pink focus:ring-brand-pink"
                    />
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    Enables the voice/chat widget on your storefront and the "Generate Description" button in the product manager.
                </p>
                
                {settings.ai?.enabled && (
                    <div className="space-y-6 border-t border-gray-200 pt-4">
                        <Input 
                            label="Gemini API Key" 
                            id="apiKey" 
                            name="apiKey" 
                            type="password"
                            value={settings.ai?.apiKey || ''} 
                            onChange={handleAiChange} 
                            placeholder="AIzaSy..."
                            helperText="Get your free API key from Google AI Studio."
                            required
                        />
                        <div className="text-right -mt-4 mb-4">
                             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Get API Key &rarr;</a>
                        </div>

                        <div>
                            <label htmlFor="model" className="block text-sm font-medium text-brand-light-text mb-1">AI Model</label>
                            <select 
                                id="model" 
                                name="model" 
                                value={settings.ai?.model || 'gemini-2.5-flash'} 
                                onChange={handleAiChange} 
                                className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink sm:text-sm bg-white text-brand-text"
                            >
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fast & Cheap)</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (More Intelligent, Slower)</option>
                            </select>
                        </div>

                        <div>
                             <label htmlFor="persona" className="block text-sm font-medium text-brand-light-text mb-1">Assistant Persona / System Instructions</label>
                             <textarea 
                                id="persona" 
                                name="persona" 
                                value={settings.ai?.persona || ''} 
                                onChange={handleAiChange} 
                                rows={4} 
                                className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink sm:text-sm bg-white text-brand-text"
                                placeholder="You are a friendly assistant..."
                             />
                             <p className="text-xs text-gray-500 mt-1">
                                 Define how the AI behaves. Leave empty to use the default shopping assistant persona.
                             </p>
                        </div>
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

export default AiSettings;