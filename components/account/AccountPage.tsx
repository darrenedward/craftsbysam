import React, { useState } from 'react';
import ProfileEditor from './ProfileEditor';
import OrderHistory from './OrderHistory';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';

interface AccountPageProps {
  goHome: () => void;
  goToAdmin: () => void;
}

type AccountTab = 'Profile' | 'Order History';

const AccountSidebar: React.FC<{ 
    activeTab: AccountTab, 
    setActiveTab: (tab: AccountTab) => void, 
    goHome: () => void, 
    goToAdmin: () => void,
    isAdmin: boolean 
}> = ({ activeTab, setActiveTab, goHome, goToAdmin, isAdmin }) => {
    const NavLink: React.FC<{ tab: AccountTab }> = ({ tab }) => {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-brand-pink text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                {tab}
            </button>
        );
    };

    return (
        <aside className="w-full md:w-1/4 lg:w-1/5">
            <div className="sticky top-28 space-y-2">
                <NavLink tab="Profile" />
                <NavLink tab="Order History" />
                
                <div className="pt-6 mt-6 border-t border-gray-200 space-y-3">
                     <Button variant="secondary" onClick={goHome} className="w-full text-sm justify-center">
                        &larr; Back to Store
                    </Button>
                    {isAdmin && (
                         <Button variant="primary" onClick={goToAdmin} className="w-full text-sm justify-center">
                            Admin Dashboard &rarr;
                        </Button>
                    )}
                </div>
            </div>
        </aside>
    );
};


const AccountPage: React.FC<AccountPageProps> = ({ goHome, goToAdmin }) => {
  const [activeTab, setActiveTab] = useState<AccountTab>('Profile');
  const { isAdmin } = useStore();

  const renderContent = () => {
    switch(activeTab) {
        case 'Order History':
            return <OrderHistory />;
        case 'Profile':
        default:
            return <ProfileEditor />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-brand-text mb-8">My Account</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <AccountSidebar 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    goHome={goHome} 
                    goToAdmin={goToAdmin}
                    isAdmin={isAdmin}
                />
                <main className="w-full md:w-3/4 lg:w-4/5">
                    {renderContent()}
                </main>
            </div>
        </div>
    </div>
  );
};

export default AccountPage;