
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useStore } from '../hooks/useStore';
import { formatError } from '../utils/errorHelper';

interface AuthPageProps {
  goBack: () => void;
}

type AuthView = 'login' | 'signup' | 'mfa_challenge';

const AuthPage: React.FC<AuthPageProps> = ({ goBack }) => {
  const { settings, showToast } = useStore();
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  
  // PRE-FILLED FOR DEV (Only applied in login view initially)
  const [email, setEmail] = useState('darrenedwardhouseofjones@gmail.com');
  const [password, setPassword] = useState('fcA*5-c0nwmFF!!');
  const [mfaCode, setMfaCode] = useState('');
  
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Strength State
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('craftsBySamRememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Calculate Password Strength
  const checkPasswordStrength = (pass: string) => {
      let score = 0;
      const feedback = [];

      if (pass.length >= 8) score += 1;
      else feedback.push("At least 8 characters");

      if (/[A-Z]/.test(pass)) score += 1;
      else feedback.push("Uppercase letter");

      if (/[0-9]/.test(pass)) score += 1;
      else feedback.push("Number");

      if (/[^A-Za-z0-9]/.test(pass)) score += 1;
      else feedback.push("Special character (!@#$%)");

      setPasswordScore(score);
      setPasswordFeedback(feedback);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPass = e.target.value;
      setPassword(newPass);
      if (view === 'signup') {
          checkPasswordStrength(newPass);
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem('craftsBySamRememberedEmail', email);
    } else {
      localStorage.removeItem('craftsBySamRememberedEmail');
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check if user has MFA enabled
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;

        const totpFactor = factorsData.totp.find(f => f.status === 'verified');

        if (totpFactor) {
            // User has MFA, verify it
            setView('mfa_challenge');
            setLoading(false);
            return; // Stop here, UI will update to show code input
        }

        // If no MFA, app will auto-redirect via onAuthStateChange in App.tsx
    } catch (err: any) {
        setError(formatError(err));
        setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const totpFactor = factors?.totp.find(f => f.status === 'verified');

          if (!totpFactor) {
              throw new Error("No MFA factor found.");
          }

          const { data, error } = await supabase.auth.mfa.challengeAndVerify({
              factorId: totpFactor.id,
              code: mfaCode
          });

          if (error) throw error;
          
          showToast("Logged in securely.", 'success');
          // App.tsx will detect the session change/update
      } catch (err: any) {
          setError(formatError(err));
          setLoading(false);
      }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordScore < 3) {
        setError("Please create a stronger password to sign up.");
        return;
    }

    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
        setError(formatError(error));
    } else {
        alert('Check your email for the confirmation link!');
        setView('login');
    }
    setLoading(false);
  };
  
  const toggleView = () => {
      setError(null);
      if (view === 'login') {
          setView('signup');
          checkPasswordStrength(password);
      } else {
          setView('login');
      }
  };

  const renderStrengthBar = () => {
      // 0-4 score
      const colors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
      const width = (passwordScore / 4) * 100;
      const color = colors[passwordScore];

      return (
          <div className="mt-2">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${color}`} style={{ width: `${width}%` }}></div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                  {passwordScore < 4 ? (
                      <span className="text-red-500">{passwordFeedback.join(', ')} missing.</span>
                  ) : (
                      <span className="text-green-600 font-medium">Strong password!</span>
                  )}
              </div>
          </div>
      );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="flex flex-col items-center justify-center w-full mb-8">
            <div className="inline-flex items-center justify-center -ml-10">
                {settings?.logoUrl && (
                    <img src={settings.logoUrl} alt={settings.logoText} className="h-24 w-auto object-contain" />
                )}
                <div className="text-left -ml-8">
                    <h1 className="text-4xl font-bold" style={{ color: settings?.logoTextColor }}>
                        {settings?.logoText || 'Crafts By Sam'}
                    </h1>
                    {settings?.tagline && (
                        <p className="text-sm" style={{ color: settings?.taglineColor }}>
                            {settings.tagline}
                        </p>
                    )}
                </div>
            </div>
            <p className="text-lg text-brand-light-text mt-4">
                {view === 'mfa_challenge' ? 'Two-Factor Verification' : (view === 'signup' ? 'Create an Account' : 'Admin & Account Login')}
            </p>
        </div>
      <div className="max-w-md w-full mx-auto bg-white p-8 border border-brand-border rounded-lg shadow-md">
        
        {/* LOGIN & SIGNUP FORM */}
        {view !== 'mfa_challenge' && (
            <form onSubmit={view === 'login' ? handleLogin : handleSignUp} className="space-y-6">
            <Input 
                label="Email" 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                autoComplete="email" 
            />
            
            <div>
                <Input 
                    label="Password" 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={handlePasswordChange} 
                    required 
                    autoComplete={view === 'login' ? "current-password" : "new-password"} 
                />
                {view === 'signup' && password.length > 0 && renderStrengthBar()}
            </div>
            
            {view === 'login' && (
                <div>
                    <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-brand-pink border-gray-300 rounded focus:ring-brand-pink"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-light-text">
                        Remember me
                    </label>
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">{error}</p>}

            <Button type="submit" disabled={loading || (view === 'signup' && passwordScore < 3)} className="w-full">
                {loading ? (view === 'login' ? 'Signing In...' : 'Creating Account...') : (view === 'login' ? 'Sign In' : 'Sign Up')}
            </Button>

            <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                    {view === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <button type="button" onClick={toggleView} className="ml-2 text-brand-pink font-medium hover:underline">
                        {view === 'login' ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
            </form>
        )}

        {/* MFA CHALLENGE FORM */}
        {view === 'mfa_challenge' && (
             <form onSubmit={handleMfaVerify} className="space-y-6">
                <div className="text-center mb-6">
                    <div className="mx-auto bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Authentication Required</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Enter the 6-digit code from your authenticator app to verify your identity.
                    </p>
                </div>

                <Input 
                    label="Verification Code" 
                    id="mfaCode" 
                    type="text" 
                    value={mfaCode} 
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g,'').slice(0,6))} // Only numbers, max 6
                    placeholder="000000"
                    className="text-center tracking-widest text-xl"
                    required 
                    autoFocus
                />

                {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">{error}</p>}

                <Button type="submit" disabled={loading || mfaCode.length < 6} className="w-full">
                    {loading ? 'Verifying...' : 'Verify & Login'}
                </Button>
                
                <button type="button" onClick={() => setView('login')} className="w-full text-center text-sm text-gray-500 hover:text-gray-800 mt-4">
                    Cancel
                </button>
            </form>
        )}

      </div>
      <div className="mt-4">
        <button onClick={goBack} className="text-sm text-brand-pink hover:underline">
            &larr; Back to Store
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
