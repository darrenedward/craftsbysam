import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import Storefront from './components/Storefront';
import AdminPanel from './components/AdminPanel';
import { supabase } from './supabaseClient';
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
  }, []);

  // Security Enforcement: Check if Force 2FA is on and user doesn't have it
  useEffect(() => {
      if (!authLoading && !store.loading && session && store.settings?.security?.force2fa && !store.mfaEnabled) {
          // Prevent infinite loop if already on account page
          if (view !== 'account') {
              setView('account');
              store.showToast("Security Alert: Two-Factor Authentication is required. Please enable it in your profile to continue.", "error");
          }
      }
  }, [session, store.settings, store.mfaEnabled, authLoading, store.loading, view]);

  if (authLoading || store.loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-brand-text">Loading Store...</div>;
  }
  
  if (store.error) {
     const isRlsError = store.error.includes('RLS_POLICY_ERROR');
     return (
        <div className="min-h-screen flex items-center justify-center p-4">
           <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-lg max-w-2xl text-left">
               <h1 className="text-2xl font-bold mb-4 text-center">Oops! Something went wrong.</h1>
               {isRlsError ? (
                   <>
                       <p className="mb-4"><strong>Database Configuration Error:</strong> We couldn't load the store data due to a database security policy issue.</p>
                       <p className="text-sm font-mono bg-red-100 p-3 rounded">{store.error.replace('RLS_POLICY_ERROR: ', '')}</p>
                       <p className="mt-4 text-sm"><strong>How to fix:</strong> Please go to the SQL Editor in your Supabase project and run all the scripts provided in the `README.md` file, especially the ones for creating Row-Level Security (RLS) policies.</p>
                   </>
               ) : (
                    <>
                       <p className="mb-4">We couldn't load the store data. This might be a connection issue or a different database problem.</p>
                       <p className="text-sm font-mono bg-red-100 p-3 rounded">{store.error}</p>
                       <p className="mt-4 text-sm">Please check your internet connection, Supabase project status, and the setup instructions in `README.md`.</p>
                    </>
               )}
           </div>
       </div>
     );
  }

  const navigateToAdmin = () => {
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
    if (session && store.settings?.security?.force2fa && !store.mfaEnabled && view !== 'account') {
        return <AccountPage goHome={() => setView('store')} goToAdmin={navigateToAdmin} />;
    }

    switch (view) {
      case 'auth':
        return <AuthPage goBack={() => setView('store')} />;
      case 'admin':
        if (session && store.isAdmin) {
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