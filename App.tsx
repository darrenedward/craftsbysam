
import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import Storefront from './components/Storefront';
import AdminPanel from './components/AdminPanel';
import { supabase, isMockMode } from './supabaseClient';
import AuthPage from './components/AuthPage';
import { useStore } from './hooks/useStore';
import AccountPage from './components/account/AccountPage';
import { ToastContainer } from './components/ui/Toast';

const AppContent = () => {
  const [view, setView] = useState<'store' | 'admin' | 'auth' | 'account'>('store');
  const [session, setSession] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const store = useStore();

  useEffect(() => {
    if (store.isMockMode) {
        setAuthLoading(false);
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      if (_event === 'SIGNED_OUT') {
        setView('store');
      }
      if (_event === 'SIGNED_IN') {
        setView('store');
      }
    });

    return () => subscription.unsubscribe();
  }, [store.isMockMode]);

  // Security Enforcement: Check if Force 2FA is on and user doesn't have it
  useEffect(() => {
      if (!authLoading && !store.loading && session && store.settings?.security?.force2fa && !store.mfaEnabled && !store.isMockMode) {
          // Prevent infinite loop if already on account page
          if (view !== 'account') {
              setView('account');
              store.showToast("Security Alert: Two-Factor Authentication is required. Please enable it in your profile to continue.", "error");
          }
      }
  }, [session, store.settings, store.mfaEnabled, authLoading, store.loading, view, store.isMockMode]);

  if (authLoading || store.loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-brand-text">Loading Store...</div>;
  }
  
  if (store.error) {
     return (
        <div className="min-h-screen flex items-center justify-center p-4">
           <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-lg max-w-2xl text-left">
               <h1 className="text-2xl font-bold mb-4 text-center">Oops! Something went wrong.</h1>
               <p className="mb-4">We couldn't load the store data.</p>
               <p className="text-sm font-mono bg-red-100 p-3 rounded">{store.error}</p>
           </div>
       </div>
     );
  }

  const navigateToAdmin = () => {
    if (store.isMockMode) {
        // Allow admin access in mock mode for demo purposes
        setView('admin');
        return;
    }

    if (session && store.isAdmin) {
        // Additional check for 2FA before allowing admin access if enforced
        if (store.settings?.security?.force2fa && !store.mfaEnabled) {
            setView('account');
            store.showToast("Admin Access Denied: 2FA is required.", "error");
            return;
        }
        setView('admin');
    } else if (session && !store.isAdmin) {
      alert("You do not have permission to access the admin dashboard.");
    } else {
      setView('auth');
    }
  };
  
  const navigateToAccount = () => {
    if (session) {
      setView('account');
    } else {
      setView('auth');
    }
  };

  const renderContent = () => {
    // If 2FA is forced and missing, ONLY allow Account page (where they set it up)
    if (session && store.settings?.security?.force2fa && !store.mfaEnabled && view !== 'account' && !store.isMockMode) {
        return <AccountPage goHome={() => setView('store')} goToAdmin={navigateToAdmin} />;
    }

    switch (view) {
      case 'auth':
        return <AuthPage goBack={() => setView('store')} />;
      case 'admin':
        if ((session && store.isAdmin) || store.isMockMode) {
          return <AdminPanel goHome={() => setView('store')} />;
        }
        return <Storefront session={session} goToAdmin={navigateToAdmin} goToAccount={navigateToAccount} />;
      case 'account':
        if (session) {
            return <AccountPage goHome={() => setView('store')} goToAdmin={navigateToAdmin} />;
        }
        return <AuthPage goBack={() => setView('store')} />;
      case 'store':
      default:
        return <Storefront session={session} goToAdmin={navigateToAdmin} goToAccount={navigateToAccount} />;
    }
  };
  
  return (
      <>
        {store.isMockMode && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-center text-sm font-medium border-b border-yellow-200">
                Running in Demo Mode (Mock Data) — Connect to Supabase to enable real database features.
            </div>
        )}
        <ToastContainer />
        {renderContent()}
      </>
  );
}


function App() {
  return (
    <StoreProvider>
      <div className="bg-white min-h-screen font-sans text-brand-text">
        <AppContent />
      </div>
    </StoreProvider>
  );
}

export default App;
