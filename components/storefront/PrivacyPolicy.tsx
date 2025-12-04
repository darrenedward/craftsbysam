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

const PrivacyPolicy: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
       <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-brand-text mb-6 border-b border-brand-border pb-4">Privacy Policy</h1>
        
        <p className="mb-6 text-brand-light-text">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <p className="mb-6 text-brand-text">Crafts By Sam ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and protect your personal information in accordance with the New Zealand Privacy Act 2020.</p>

        <LegalSection title="1. Information We Collect">
          <p>To process your order, we collect personal information such as your name, email address, shipping address, and details of the product you’re ordering. You may also provide us with additional personal information for a custom order.</p>
        </LegalSection>

        <LegalSection title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Fulfill your order and provide customer support.</li>
            <li>Communicate with you about your order.</li>
            <li>Settle disputes or legal obligations.</li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Data Storage and Security">
          <p>Your personal information is stored on a secure cloud platform. We take reasonable steps to protect your information from unauthorized access, loss, or misuse.</p>
        </LegalSection>
        
        <LegalSection title="4. Third-Party Services">
          <p>We share information with trusted third-party services to the extent necessary to perform their functions, such as payment processors (e.g., PayPal) and delivery companies.</p>
        </LegalSection>

        <LegalSection title="5. Your Rights">
          <p>Under the New Zealand Privacy Act 2020, you have the right to access and request correction of your personal information held by us. If you wish to do so, please contact us.</p>
        </LegalSection>

        <LegalSection title="6. Contact Us">
            <p>If you have any questions or concerns about our privacy practices, please contact us at <a href="mailto:privacy@craftsbysam.co.nz" className="text-brand-pink underline">privacy@craftsbysam.co.nz</a>.</p>
        </LegalSection>

        <div className="mt-8 pt-6 border-t border-brand-border text-center">
          <Button onClick={onBack}>&larr; Back to Store</Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;