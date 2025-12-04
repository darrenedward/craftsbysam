
import React from 'react';
import { Button } from '../ui/Button';

interface HelpPageProps {
  onBack: () => void;
}

const HelpSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-10 border-b border-brand-border pb-8 last:border-0">
    <h2 className="text-2xl font-bold text-brand-text mb-4">{title}</h2>
    <div className="space-y-4 text-brand-light-text leading-relaxed text-lg">
        {children}
    </div>
  </div>
);

const HelpPage: React.FC<HelpPageProps> = ({ onBack }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-brand-text mb-4 text-center">Help</h1>
        <p className="text-center text-gray-500 mb-12 text-lg">Everything you need to know about ordering custom handmade items.</p>
        
        <HelpSection title="How to Order Custom Products">
            <p>Ordering a personalized item is easy! Just follow these steps:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2 font-medium text-gray-700">
                <li>Browse our catalog and select the product you want (e.g., Beer Mug, Keyring).</li>
                <li>On the product page, you will see <strong>Customization Options</strong>.</li>
                <li>Fill in the required fields, such as your <strong>Name</strong>, specific <strong>Text</strong>, or <strong>Initials</strong>.</li>
                <li>Select your preferred <strong>Colors</strong> or <strong>Fonts</strong> from the dropdowns.</li>
                <li>Double-check your spelling! We copy exactly what you type.</li>
                <li>Click "Add to Cart" and proceed to checkout.</li>
            </ol>
        </HelpSection>

        <HelpSection title="Understanding Colours & Matching">
            <p>We want your item to look exactly how you imagined, but there are a few things to know about handmade colors:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Vinyl Colors:</strong> Vinyl comes in specific, pre-manufactured rolls (like "Matte Black", "Holographic Gold", etc.). When you select a color, we match it to the closest stock vinyl we have.</li>
                <li><strong>Epoxy Resin:</strong> Resin is colored by hand using mica powders and dyes. Because each batch is mixed manually, slight variations in shade and swirl patterns will occur. This makes every piece truly one-of-a-kind!</li>
                <li><strong>Screen vs. Reality:</strong> Please note that colors may look slightly different on your phone or computer screen compared to real life due to display settings.</li>
            </ul>
            <p className="mt-2 italic bg-yellow-50 p-3 rounded border border-yellow-100 text-sm">
                <strong>Note:</strong> If you need a very specific color match (e.g., for a wedding theme), please <span className="underline cursor-pointer text-brand-pink" onClick={() => window.location.href = 'mailto:contact@craftsbysam.co.nz'}>contact us</span> before placing your order so we can check our stock.
            </p>
        </HelpSection>

        <HelpSection title="The Creation Process">
            <p>
                "Crafts By Sam" is a handmade business. We don't just pull items off a shelf; we create them for you!
            </p>
            <p>
                <strong>Vinyl Items:</strong> We cut, weed, and apply high-quality permanent vinyl by hand. This process ensures precision and durability.
            </p>
            <p>
                <strong>Resin Items:</strong> Working with epoxy resin is an art form that takes time. Resin requires 24-72 hours to fully cure and harden. Because of this, custom resin orders may take a few extra days to ship. We appreciate your patience as we ensure your item is perfectly set.
            </p>
        </HelpSection>

        <HelpSection title="Product Care & Safety">
            <p>To ensure your custom items last a long time, please follow these care instructions:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-brand-text mb-2">Glassware & Mugs (Vinyl)</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Hand wash only.</strong></li>
                        <li>Do not scrub the vinyl decal directly with abrasive sponges.</li>
                        <li><strong>Not dishwasher safe.</strong> High heat can peel the vinyl.</li>
                        <li>Not microwave safe.</li>
                    </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-brand-text mb-2">Epoxy Resin Items</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Clean with a soft, damp cloth.</li>
                        <li>Keep away from extreme heat (e.g., hot cars) as resin can soften.</li>
                        <li>Resin is durable but can scratch if treated roughly.</li>
                        <li>Generally food safe for cold service, but decorative use is recommended.</li>
                    </ul>
                </div>
            </div>
        </HelpSection>

        <div className="mt-12 pt-6 border-t border-brand-border text-center">
          <p className="mb-6 text-lg font-medium">Still have questions?</p>
          <div className="flex justify-center gap-4">
              <Button onClick={onBack} variant="secondary">&larr; Back to Store</Button>
              <Button onClick={() => {/* Navigation handled by parent if needed, or simple href */ window.location.hash = '#contact'; onBack(); }} variant="primary">Contact Us</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
