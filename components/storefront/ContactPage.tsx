
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ContactPageProps {
  onBack: () => void;
}

// Add global definition for grecaptcha
declare global {
    interface Window {
        grecaptcha: any;
    }
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const { settings, showToast } = useStore();

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const isCaptchaEnabled = settings?.recaptcha?.enabled && settings?.recaptcha?.siteKey;

  useEffect(() => {
    if (isCaptchaEnabled && recaptchaRef.current) {
        const renderCaptcha = () => {
            if (window.grecaptcha && window.grecaptcha.render) {
                 if (widgetIdRef.current !== null) {
                    // reset if already rendered
                    window.grecaptcha.reset(widgetIdRef.current);
                 } else {
                     try {
                        const id = window.grecaptcha.render(recaptchaRef.current, {
                            sitekey: settings.recaptcha!.siteKey,
                            callback: (token: string) => {
                                setCaptchaToken(token);
                                setCaptchaError(null);
                            },
                            'expired-callback': () => {
                                setCaptchaToken(null);
                            }
                        });
                        widgetIdRef.current = id;
                     } catch (e) {
                         console.error("Recaptcha render error:", e);
                     }
                 }
            }
        };

        if (window.grecaptcha) {
            renderCaptcha();
        } else {
            const interval = setInterval(() => {
                if (window.grecaptcha) {
                    clearInterval(interval);
                    renderCaptcha();
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }
  }, [isCaptchaEnabled, settings?.recaptcha?.siteKey]);

  if (!settings) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-6xl mx-auto text-center">Loading contact information...</div>
        </div>
    );
  }

  const { address, openingHours } = settings;
  
  // FIX: Use ONLY the address for the map query. 
  // Including the business name (logoText) often causes Google Maps to fail if the business isn't 
  // officially registered/verified at that exact address in Google's database.
  // Using strictly the address ensures the pin drops on the physical location.
  const mapQuery = address;
  
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=B&output=embed`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCaptchaEnabled && !captchaToken) {
        setCaptchaError("Please complete the captcha to verify you are human.");
        return;
    }

    // In a real application, this would send an email via an API which verifies the secret key.
    console.log('Form submitted:', formState, 'Captcha Token:', captchaToken);
    
    // Clear form and show toast
    setFormState({ name: '', email: '', subject: '', message: '' });
    setCaptchaToken(null);
    if (widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
    }
    showToast("Message sent successfully! We'll get back to you soon.", 'success');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-brand-text mb-10">Get In Touch</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-brand-border order-2 lg:order-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-1">
                     <h2 className="text-2xl font-semibold text-brand-text">Send us a Message</h2>
                     <p className="text-brand-light-text text-sm">We'd love to hear from you.</p>
                </div>
                
                <Input label="Your Name" id="name" name="name" type="text" value={formState.name} onChange={handleChange} required className="bg-white" />
                <Input label="Your Email" id="email" name="email" type="email" value={formState.email} onChange={handleChange} required className="bg-white" />
                <Input label="Subject" id="subject" name="subject" type="text" value={formState.subject} onChange={handleChange} required className="bg-white" />
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brand-light-text mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text"
                    value={formState.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                {isCaptchaEnabled && (
                    <div>
                        <div ref={recaptchaRef}></div>
                        {captchaError && <p className="text-red-500 text-xs mt-2">{captchaError}</p>}
                    </div>
                )}

                <Button type="submit" className="w-full py-3 text-lg shadow-md">Send Message</Button>
              </form>
          </div>
          {/* Map and Details */}
          <div className="order-1 lg:order-2 space-y-6">
             <div className="bg-gray-50 p-6 rounded-xl border border-brand-border shadow-sm">
                <h3 className="text-xl font-semibold text-brand-text mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Visit Us
                </h3>
                <div className="space-y-2 text-brand-text">
                    <p className="font-medium">{address}</p>
                    <p className="text-brand-light-text whitespace-pre-wrap">{openingHours}</p>
                </div>
             </div>
            <div className="h-80 rounded-xl overflow-hidden shadow-lg border border-brand-border">
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map showing ${address}`}
              ></iframe>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
            <Button onClick={onBack} variant="secondary">&larr; Back to Store</Button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
