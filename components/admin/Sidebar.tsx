
import React from 'react';
import { useStore } from '../../hooks/useStore';
import { AdminPage } from '../AdminPanel';
import { Button } from '../ui/Button';

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const CategoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const OrderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const ClientIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SupportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BusinessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;


interface SidebarProps {
  activePage: AdminPage;
  setActivePage: (page: AdminPage) => void;
  goHome: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, goHome }) => {
  const { settings } = useStore();

  const NavLink: React.FC<{ page: AdminPage; children: React.ReactNode; icon: React.ReactNode }> = ({ page, children, icon }) => {
    const isActive = activePage === page;
    const baseClasses = `flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 text-left`;
    const activeClasses = 'bg-brand-pink text-white';
    const inactiveClasses = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

    return (
      <button onClick={() => setActivePage(page)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        {icon}
        <span>{children}</span>
      </button>
    );
  };
  
  if (!settings) {
    return <aside className="w-64 bg-white border-r border-brand-border flex flex-col h-screen sticky top-0"></aside>;
  }

  return (
    <aside className="w-64 bg-white border-r border-brand-border flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-brand-border flex items-center gap-3">
             {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={`${settings.logoText} logo`} className="h-10 w-auto object-contain" />
            ) : (
                <div className="h-10 w-10 bg-brand-pink rounded-md"></div>
            )}
            <h1 className="text-lg font-bold text-brand-text truncate">{settings.logoText}</h1>
        </div>
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
            <NavLink page="Dashboard" icon={<HomeIcon />}>Dashboard</NavLink>
            <NavLink page="Products" icon={<ProductIcon />}>Products</NavLink>
            <NavLink page="Categories" icon={<CategoryIcon />}>Categories</NavLink>
            <NavLink page="Orders" icon={<OrderIcon />}>Orders</NavLink>
            <NavLink page="Clients" icon={<ClientIcon />}>Clients</NavLink>
            <NavLink page="Images" icon={<ImageIcon />}>Images</NavLink>
            
            <div className="my-2 pt-2 border-t border-gray-100">
                <NavLink page="BusinessInfo" icon={<BusinessIcon />}>Business Info</NavLink>
                <NavLink page="Settings" icon={<SettingsIcon />}>Settings</NavLink>
            </div>

            <div className="pt-2 mt-2 border-t border-gray-100">
              <NavLink page="Support" icon={<SupportIcon />}>Support & Help</NavLink>
            </div>
        </nav>
        <div className="p-4 border-t border-brand-border">
            <Button onClick={goHome} variant="secondary" className="w-full">
                &larr; Back to Store
            </Button>
        </div>
    </aside>
  );
};

export default Sidebar;
