
import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AddressForm } from '../ui/AddressForm';
import { supabase, supabaseUrl } from '../../supabaseClient';
import { Address } from '../../types';
import { formatError } from '../../utils/errorHelper';

const initialAddressState: Address = { street: '', city: '', postalCode: '', country: '' };

const ProfileEditor = () => {
    const { profile, updateProfile, showToast } = useStore();
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    
    const [shippingAddress, setShippingAddress] = useState<Address>(initialAddressState);
    const [billingAddress, setBillingAddress] = useState<Address>(initialAddressState);
    const [sameAsShipping, setSameAsShipping] = useState(true);

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // 2FA State
    const [mfaEnrolling, setMfaEnrolling] = useState(false);
    const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
    const [mfaSecret, setMfaSecret] = useState<string | null>(null);
    const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
    const [mfaVerifyCode, setMfaVerifyCode] = useState('');
    const [mfaEnabled, setMfaEnabled] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setAvatarUrl(profile.avatar_url);
            
            if (profile.shipping_address) {
                setShippingAddress(profile.shipping_address);
            }
            
            if (profile.billing_address) {
                setBillingAddress(profile.billing_address);
                const matches = JSON.stringify(profile.shipping_address) === JSON.stringify(profile.billing_address);
                setSameAsShipping(matches || !profile.billing_address);
            }
        }
    }, [profile]);

    useEffect(() => {
        const fetchUserEmail = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setEmail(session.user.email);
            }
        };
        const checkMfaStatus = async () => {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const totp = factors?.totp.find(f => f.status === 'verified');
            setMfaEnabled(!!totp);
        };

        fetchUserEmail();
        checkMfaStatus();
    }, []);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const fileName = `avatar-${profile?.id}-${Date.now()}`;
        const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file);

        if (uploadError) {
            showToast(`Error uploading avatar: ${formatError(uploadError)}`, 'error');
        } else {
            const newAvatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${data.path}`;
            setAvatarUrl(newAvatarUrl);
            await handleSave({ avatar_url: newAvatarUrl });
            showToast("Avatar uploaded successfully", 'success');
        }
        setUploading(false);
    };

    const handleSave = async (updates: { full_name?: string, avatar_url?: string, shipping_address?: Address, billing_address?: Address }) => {
        setSaving(true);
        try {
            await updateProfile(updates);
            showToast('Profile updated successfully!', 'success');
        } catch (err: any) {
            showToast(`Error updating profile: ${formatError(err)}`, 'error');
        } finally {
            setSaving(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave({ 
            full_name: fullName,
            shipping_address: shippingAddress,
            billing_address: sameAsShipping ? shippingAddress : billingAddress
        });
    };
    
    // --- 2FA HANDLERS ---

    const startMfaEnrollment = async () => {
        try {
            setMfaEnrolling(true);
            const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
            if (error) throw error;
            
            setMfaFactorId(data.id);
            setMfaSecret(data.secret);
            setMfaQrCode(data.totp.qr_code);
        } catch (err) {
            showToast(`Failed to start 2FA enrollment: ${formatError(err)}`, 'error');
            setMfaEnrolling(false);
        }
    };

    const verifyMfaEnrollment = async () => {
        if (!mfaFactorId || !mfaVerifyCode) return;
        try {
            const { data, error } = await supabase.auth.mfa.challengeAndVerify({
                factorId: mfaFactorId,
                code: mfaVerifyCode
            });
            if (error) throw error;
            
            setMfaEnabled(true);
            setMfaEnrolling(false);
            setMfaVerifyCode('');
            showToast("Two-Factor Authentication enabled successfully!", 'success');
        } catch (err) {
            showToast(`Invalid code: ${formatError(err)}`, 'error');
        }
    };

    const disableMfa = async () => {
        if (!window.confirm("Are you sure you want to disable 2FA? Your account will be less secure.")) return;
        try {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const totp = factors?.totp.find(f => f.status === 'verified');
            if (totp) {
                const { error } = await supabase.auth.mfa.unenroll({ factorId: totp.id });
                if (error) throw error;
                setMfaEnabled(false);
                showToast("Two-Factor Authentication disabled.", 'success');
            }
        } catch (err) {
             showToast(`Error disabling 2FA: ${formatError(err)}`, 'error');
        }
    };


    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBillingAddress(prev => ({ ...prev, [name]: value }));
    };

    if (!profile) {
        return <div className="bg-white p-6 rounded-lg shadow">Loading profile...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-brand-text mb-6">Edit Profile</h2>
                <div className="flex items-center gap-6 mb-8 pb-8 border-b">
                    <img
                        src={avatarUrl || `https://ui-avatars.com/api/?name=${fullName || 'A'}&background=EBC7C7&color=5C374C`}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover bg-gray-200"
                    />
                    <div className="relative">
                        <Button type="button" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload New Avatar'}
                        </Button>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp, image/svg+xml"
                            onChange={handleAvatarUpload}
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-brand-text border-b pb-2">Personal Info</h3>
                        <Input
                            label="Full Name"
                            id="full_name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        <div>
                            <Input
                                label="Email"
                                id="email"
                                value={email}
                                disabled
                                helperText="Email address cannot be changed."
                            />
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-brand-text border-b pb-2">Default Addresses</h3>
                        <p className="text-sm text-gray-500">These addresses will be automatically used at checkout.</p>
                        
                        <AddressForm 
                            title="Shipping Address" 
                            address={shippingAddress} 
                            onChange={handleShippingChange} 
                        />

                        <div className="flex items-center pt-2">
                            <input
                                id="sameAsShipping"
                                type="checkbox"
                                checked={sameAsShipping}
                                onChange={(e) => setSameAsShipping(e.target.checked)}
                                className="h-4 w-4 text-brand-pink border-gray-300 rounded focus:ring-brand-pink"
                            />
                            <label htmlFor="sameAsShipping" className="ml-2 block text-sm text-brand-text">
                                Billing address is the same as shipping
                            </label>
                        </div>

                        {!sameAsShipping && (
                            <AddressForm 
                                title="Billing Address" 
                                address={billingAddress} 
                                onChange={handleBillingChange} 
                            />
                        )}
                    </div>

                    <div className="flex justify-end items-center pt-6 border-t">
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* SECURITY & 2FA SECTION */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-brand-text mb-4">Account Security</h2>
                <div className="border-t pt-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-brand-text">Two-Factor Authentication (2FA)</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Add an extra layer of security to your account by requiring a verification code from an authenticator app (like Google Authenticator) when logging in.
                            </p>
                        </div>
                        <div className="ml-4">
                            {mfaEnabled ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Enabled
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Disabled
                                </span>
                            )}
                        </div>
                    </div>

                    {mfaEnabled ? (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                             <p className="text-sm text-gray-700 mb-4">
                                 2FA is currently protecting your account. You will be asked for a code whenever you sign in from a new session.
                             </p>
                             <Button variant="danger" onClick={disableMfa}>Disable 2FA</Button>
                        </div>
                    ) : (
                        !mfaEnrolling ? (
                             <Button onClick={startMfaEnrollment}>Enable 2FA</Button>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg border animate-fade-in">
                                <h4 className="font-semibold text-brand-text mb-2">Setup Instructions</h4>
                                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 mb-6">
                                    <li>Download an authenticator app (Google Authenticator, Authy, etc.).</li>
                                    <li>Scan the QR code below.</li>
                                    <li>Enter the 6-digit code generated by the app to verify.</li>
                                </ol>
                                
                                <div className="flex flex-col md:flex-row gap-8 items-center mb-6">
                                    <div className="bg-white p-2 rounded border">
                                        {mfaQrCode && (
                                             // Using a secure QR code generation API for display
                                            <img 
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mfaQrCode)}`} 
                                                alt="Scan this QR Code" 
                                                className="w-36 h-36"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 max-w-xs">
                                        <Input 
                                            label="Verification Code" 
                                            id="mfaVerifyCode" 
                                            value={mfaVerifyCode} 
                                            onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                                            placeholder="000000"
                                            className="text-center text-lg tracking-widest"
                                        />
                                        <div className="flex gap-2 mt-4">
                                            <Button onClick={verifyMfaEnrollment} disabled={mfaVerifyCode.length < 6} className="flex-1">Verify</Button>
                                            <Button variant="secondary" onClick={() => setMfaEnrolling(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Can't scan? Manual Secret: <code className="bg-gray-100 p-1 rounded">{mfaSecret}</code>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileEditor;
