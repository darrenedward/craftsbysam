
import React from 'react';
import { useStore } from '../../hooks/useStore';
import { Page } from '../../types';

// Brand-colored SVG icons
const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44c0-.795-.645-1.44-1.441-1.44z" />
    </svg>
);
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z" />
    </svg>
);
const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.86-.95-6.69-2.8-1.95-1.98-2.69-4.71-2.5-7.15.02-.16.03-.33.05-.51 1.94-.02 3.88-.02 5.83-.01.01.92-.01 1.84.02 2.75.04 1.13.56 2.06 1.42 2.73 1.06.81 2.37.9 3.53.25.92-.51 1.4-1.47 1.46-2.52.02-1.07.01-2.14.01-3.21 0-2.14-.02-4.28-.01-6.42-.01-1.28-.58-2.55-1.48-3.5-1.01-1.04-2.34-1.46-3.72-1.42-.1-.04-.19-.08-.28-.13-1.06-.61-2.04-1.3-2.9-2.11C6.27 3.24 5.92 2.03 5.9 1.01c-.02-1.06.33-2.22 1.22-3.02.93-.82 2.14-1.28 3.4-1.28.02 0 .03 0 .05.01z" />
    </svg>
);
const YouTubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
    </svg>
);


interface FooterProps {
    setPage: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ setPage }) => {
    // FIX: Destructure settings directly from useStore.
    const { settings } = useStore();
    
    const linkClasses = "opacity-90 hover:opacity-100 transition-opacity";

    // FIX: Handle case where settings may not be loaded yet.
    if (!settings) {
        return <footer></footer>;
    }

    return (
        <footer>
          <div className="bg-brand-pink text-brand-text">
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm text-left">
                  {/* Column 1: Business Info */}
                  <div className="sm:col-span-2">
                      <h3 className="text-xl font-semibold">{settings.logoText}</h3>
                      <p className="mt-2 opacity-90">{settings.tagline}</p>
                      <div className="mt-4 opacity-90 space-y-1">
                          <p>{settings.address}</p>
                          <p>{settings.openingHours}</p>
                      </div>
                  </div>

                  {/* Column 2: Quick Links */}
                  <div>
                      <h3 className="font-semibold tracking-wider">Quick Links</h3>
                      <ul className="mt-4 space-y-2">
                        <li><button onClick={() => setPage('home')} className={linkClasses}>Shop</button></li>
                        <li><button onClick={() => setPage('about')} className={linkClasses}>About</button></li>
                        <li><button onClick={() => setPage('help')} className={linkClasses}>Help</button></li>
                        <li><button onClick={() => setPage('contact')} className={linkClasses}>Contact</button></li>
                      </ul>
                  </div>
                  
                  {/* Column 3: Socials */}
                  <div>
                      <h3 className="font-semibold tracking-wider">Follow Us</h3>
                      <div className="flex space-x-6 mt-4">
                          <a href={settings.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:text-social-instagram transition-colors duration-200"><span className="sr-only">Instagram</span><InstagramIcon /></a>
                          <a href={settings.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:text-social-facebook transition-colors duration-200"><span className="sr-only">Facebook</span><FacebookIcon /></a>
                          <a href={settings.socials.tiktok} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:text-social-tiktok transition-colors duration-200"><span className="sr-only">TikTok</span><TikTokIcon /></a>
                          <a href={settings.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:text-social-youtube transition-colors duration-200"><span className="sr-only">YouTube</span><YouTubeIcon /></a>
                      </div>
                  </div>
              </div>
            </div>
          </div>
          <div className="bg-white text-brand-text border-t border-brand-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6 flex flex-col sm:flex-row justify-between items-center text-sm">
                    <p className="opacity-80 text-center sm:text-left mb-4 sm:mb-0">
                        &copy; {new Date().getFullYear()} {settings.logoText}. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <button onClick={() => setPage('terms')} className={linkClasses}>Terms of Service</button>
                        <button onClick={() => setPage('privacy')} className={linkClasses}>Privacy Policy</button>
                    </div>
                </div>
            </div>
          </div>
        </footer>
      );
};

export default Footer;
