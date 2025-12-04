
import React from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../hooks/useStore';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const { settings } = useStore();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-brand-text mb-6 border-b border-brand-border pb-4">About Crafts By Sam</h1>
        
        {/* Dynamic HTML Content */}
        <div className="prose prose-pink max-w-none text-brand-text">
            <div dangerouslySetInnerHTML={{ __html: settings?.aboutUsContent || '<p>Loading...</p>' }} />
        </div>
        
        {/* Custom Styling to match the Rich Text Editor output */}
        <style>{`
            .prose h2 { font-size: 1.5rem; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; color: #5C374C; }
            .prose h3 { font-size: 1.25rem; font-weight: bold; margin-top: 1.2em; margin-bottom: 0.5em; color: #5C374C; }
            .prose p { margin-bottom: 1em; line-height: 1.7; color: #4a5568; }
            .prose img { max-width: 100%; height: auto; border-radius: 0.5rem; margin-top: 1rem; margin-bottom: 1rem; }
            .prose b, .prose strong { font-weight: bold; color: #2d3748; }
        `}</style>

        <div className="mt-8 pt-6 border-t border-brand-border text-center">
          <Button onClick={onBack}>&larr; Back to Store</Button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
