
import React, { useState } from 'react';
import ProductManager from './admin/ProductManager';
import OrderManager from './admin/OrderManager';
import ClientManager from './admin/ClientManager';
import ImageManager from './admin/ImageManager';
import Sidebar from './admin/Sidebar';
import SettingsPage from './admin/settings/SettingsPage';
import { useStore } from '../hooks/useStore';
import CategoryManager from './admin/CategoryManager';
import Dashboard from './admin/Dashboard';
import SupportPage from './admin/SupportPage';
import BusinessInfoPage from './admin/BusinessInfoPage';

interface AdminPanelProps {
  goHome: () => void;
}

export type AdminPage = 'Dashboard' | 'Products' | 'Categories' | 'Orders' | 'Clients' | 'Images' | 'Settings' | 'Support' | 'BusinessInfo';

const AdminPanel: React.FC<AdminPanelProps> = ({ goHome }) => {
  const [activePage, setActivePage] = useState<AdminPage>('Dashboard');
  const { showSettingsWarning } = useStore();

  const renderContent = () => {
    switch (activePage) {
      case 'Products':
        return <ProductManager />;
      case 'Categories':
        return <CategoryManager />;
      case 'Orders':
        return <OrderManager />;
      case 'Clients':
        return <ClientManager />;
      case 'Images':
        return <ImageManager />;
      case 'Settings':
          return <SettingsPage />;
      case 'BusinessInfo':
          return <BusinessInfoPage />;
      case 'Support':
          return <SupportPage />;
      case 'Dashboard':
      default:
        return <Dashboard navigateToSupport={() => setActivePage('Support')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage={activePage} setActivePage={setActivePage} goHome={goHome} />
      <main className="flex-1 p-8 overflow-y-auto">
        {showSettingsWarning && activePage !== 'BusinessInfo' && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md" role="alert">
                <p className="font-bold">Welcome! Your store is almost ready.</p>
                <p>
                    Your store settings haven't been saved to the database yet. Please go to the 
                    <button onClick={() => setActivePage('BusinessInfo')} className="font-bold underline hover:text-yellow-800 mx-1">Business Info page</button> 
                    and save your details to initialize the store.
                </p>
            </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanel;
