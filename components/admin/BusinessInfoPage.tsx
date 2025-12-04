
import React, { useState } from 'react';
import BusinessSettings from './settings/BusinessSettings';
import AppearanceEditor from './settings/AppearanceEditor';
import AboutSettings from './settings/AboutSettings';
import SocialSettings from './settings/SocialSettings';

type Tab = 'General' | 'Appearance' | 'About Us' | 'Socials';

const BusinessInfoPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('General');
  const tabs: Tab[] = ['General', 'Appearance', 'About Us', 'Socials'];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-brand-text">Business Information</h2>
      <p className="text-sm text-gray-500 mb-6">Manage your public profile, look & feel, and content.</p>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab 
                  ? 'border-brand-pink text-brand-header' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="min-h-[300px] animate-fade-in">
        {activeTab === 'General' && <BusinessSettings />}
        {activeTab === 'Appearance' && <AppearanceEditor />}
        {activeTab === 'About Us' && <AboutSettings />}
        {activeTab === 'Socials' && <SocialSettings />}
      </div>
    </div>
  );
};

export default BusinessInfoPage;
