
import React from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../hooks/useStore';

const Hero = () => {
  const { settings } = useStore();
  const heroImage = settings?.heroImageUrl || "https://picsum.photos/seed/crafts-by-sam-hero/1920/1080";

  return (
    <div className="relative bg-brand-pink overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-brand-pink sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-brand-pink transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <div className="relative pt-6 px-4 sm:px-6 lg:px-8"></div>

          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Custom Creations</span>
                <span className="block text-white xl:inline"> Made With Love</span>
              </h1>
              <p className="mt-3 text-base text-brand-text sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                From personalized glassware to unique epoxy resin art, discover handcrafted items that tell your story. Every piece is made with passion and precision.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                   <Button variant="primary" className="w-full text-base px-8 py-3">
                     Shop Now
                   </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button variant="secondary" className="w-full text-base px-8 py-3">
                      Learn More
                   </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src={heroImage} alt="Handmade crafts" />
      </div>
    </div>
  );
};

export default Hero;
