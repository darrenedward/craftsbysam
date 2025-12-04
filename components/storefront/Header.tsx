
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { Page } from '../../types';
import { supabase } from '../../supabaseClient';

const ShoppingBagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

const UserIcon = ({ avatarUrl }: { avatarUrl?: string | null }) => {
    if (avatarUrl) {
        return <img src={avatarUrl} alt="User avatar" className="h-8 w-8 rounded-full object-cover" />;
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
};


interface HeaderProps {
    setPage: (page: Page) => void;
    toggleCart: () => void;
    goToAdmin: () => void;
    goToAccount: () => void;
    session: any | null;
}

const Header: React.FC<HeaderProps> = ({ setPage, toggleCart, goToAdmin, goToAccount, session }) => {
  const { settings, cart, isAdmin, profile } = useStore();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const navButtonClasses = "text-base font-medium hover:opacity-80 transition-opacity duration-200";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const displayName = profile?.full_name || session?.user?.email?.split('@')[0] || 'Account';

  if (!settings) {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-20 text-brand-text border-b border-brand-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 h-[128px]">
                {/* Placeholder to prevent layout shift */}
            </div>
          </div>
        </header>
    );
  }


  return (
    <header className="bg-white shadow-sm sticky top-0 z-20 text-brand-text border-b border-brand-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          <div className="flex items-center cursor-pointer md:-ml-12" onClick={() => setPage('home')}>
            {settings.logoUrl && (
                <img src={settings.logoUrl} alt={`${settings.logoText} logo`} className="h-24 w-auto object-contain" />
            )}
            <div className="text-left -ml-8">
                <h1 className="text-3xl font-bold" style={{ color: settings.logoTextColor }}>
                  {settings.logoText}
                </h1>
                <p className="text-sm" style={{ color: settings.taglineColor }}>
                  {settings.tagline}
                </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-8">
                <button onClick={() => setPage('home')} className={navButtonClasses}>Shop</button>
                <button onClick={() => setPage('about')} className={navButtonClasses}>About</button>
                <button onClick={() => setPage('help')} className={navButtonClasses}>Help</button>
                <button onClick={() => setPage('contact')} className={navButtonClasses}>Contact</button>
            </nav>
            
             <button onClick={toggleCart} className="relative cursor-pointer hover:opacity-80 transition-opacity">
                <ShoppingBagIcon />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-pink text-brand-text text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            
            {session ? (
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <UserIcon avatarUrl={profile?.avatar_url} />
                        <span className="font-medium hidden sm:block">{displayName}</span>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 text-brand-text">
                            <div className="px-4 py-3 border-b">
                                <p className="text-sm text-gray-700">Signed in as</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{session.user.email}</p>
                            </div>
                            <a href="#" onClick={(e) => { e.preventDefault(); goToAccount(); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</a>
                            {isAdmin && (
                                <a href="#" onClick={(e) => { e.preventDefault(); goToAdmin(); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</a>
                            )}
                            <a href="#" onClick={(e) => { e.preventDefault(); supabase.auth.signOut(); setIsDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                Log Out
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <button onClick={goToAdmin} className={navButtonClasses}>Admin Login</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
