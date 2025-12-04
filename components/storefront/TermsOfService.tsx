
import React from 'react';
import { Button } from '../ui/Button';

interface LegalPageProps {
  onBack: () => void;
}

const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-brand-text mb-2">{title}</h2>
    <div className="space-y-2 text-brand-light-text">{children}</div>
  </div>
);

const TermsOfService: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-brand-text mb-6 border-b border-brand-border pb-4">Terms of Service</h1>
        
        <p className="mb-6 text-brand-light-text">Last Updated: {new Date().toLocaleDateString()}</p>

        <LegalSection title="1. Agreement to Terms">
          <p>By accessing our website and purchasing products from Crafts By Sam ("we", "us", "our"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
        </LegalSection>

        <LegalSection title="2. Custom Orders">
          <p>All our products are custom-made to your specifications. Please double-check all details, including spelling, colors, and dates, before submitting your order. We are not responsible for errors submitted by the customer.</p>
          <p>Due to the personalized nature of our products, all sales are final. We cannot accept returns or provide refunds for change-of-mind purchases.</p>
        </LegalSection>

        <LegalSection title="3. Pricing and Payment">
          <p>All prices are listed in New Zealand Dollars (NZD) and are inclusive of Goods and Services Tax (GST) where applicable. Payment is required in full at the time of ordering. We securely process payments through trusted third-party providers like PayPal.</p>
        </LegalSection>
        
        <LegalSection title="4. Color Matching & Availability">
            <p>Please note that not all colors are always available in stock. We do our best to choose the color that is closest to the one you have chosen. However, if you require a specific or exact color match, please contact us before placing your order to ensure we can accommodate your request.</p>
        </LegalSection>

        <LegalSection title="5. Shipping and Delivery">
          <p>We take great care in packaging our products for safe delivery. Shipping times are estimates and may vary. We are not liable for any delays, loss, or damage caused by third-party courier services once the item has been dispatched.</p>
        </LegalSection>

        <LegalSection title="6. Returns and Refunds">
          <p>We stand by the quality of our work. In the unlikely event that your product is faulty or not as described, please contact us within 7 days of receipt with photos of the issue. Our obligations are subject to the Consumer Guarantees Act 1993. We will assess the issue and may offer a replacement or refund at our discretion.</p>
        </LegalSection>
        
        <LegalSection title="7. Intellectual Property">
            <p>All designs, images, and content on this website are the intellectual property of Crafts By Sam. They may not be reproduced or used without our express written permission.</p>
        </LegalSection>

        <LegalSection title="8. Governing Law">
          <p>These terms and conditions are governed by and construed in accordance with the laws of New Zealand and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
        </LegalSection>

        <div className="mt-8 pt-6 border-t border-brand-border text-center">
          <Button onClick={onBack}>&larr; Back to Store</Button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
