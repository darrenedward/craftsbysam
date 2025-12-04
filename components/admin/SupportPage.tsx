
import React, { useState } from 'react';

// Helper component for collapsible sections
const GuideSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full border border-gray-200 text-brand-pink">
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-brand-text">{title}</h3>
                </div>
                <svg 
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-6 border-t border-gray-100 space-y-6 text-gray-700">
                    {children}
                </div>
            )}
        </div>
    );
};

const Step: React.FC<{ num: number; children: React.ReactNode }> = ({ num, children }) => (
    <li className="flex items-start gap-3 mb-2">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-pink text-white text-xs font-bold flex items-center justify-center mt-0.5">
            {num}
        </span>
        <span className="text-sm leading-relaxed">{children}</span>
    </li>
);

const SubHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="font-bold text-brand-header text-md border-b border-gray-100 pb-2 mb-3 mt-2">{children}</h4>
);

const SupportPage = () => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-text">Owner's Knowledge Base</h1>
        <p className="text-lg text-gray-500 mt-2">Step-by-step guides to help you manage your store.</p>
      </div>

      {/* 1. CATEGORIES & SUBCATEGORIES */}
      <GuideSection 
        title="Categories & Subcategories" 
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        }
      >
        <div>
            <p className="text-sm bg-blue-50 p-3 rounded text-blue-800 mb-4">
                <strong>Concept:</strong> Think of <em>Categories</em> as the main aisles (e.g., "Glassware") and <em>Subcategories</em> as the specific shelves (e.g., "Wine Glasses", "Beer Mugs"). You must create a Category before you can add Subcategories to it.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <SubHeader>How to create a Main Category</SubHeader>
                    <ul className="list-none">
                        <Step num={1}>Click 'Categories' in the left sidebar.</Step>
                        <Step num={2}>Look for the section 'Manage Categories'.</Step>
                        <Step num={3}>Type your new name (e.g., 'Weddings') into the 'New Category Name' box.</Step>
                        <Step num={4}>Click the 'Add Category' button.</Step>
                    </ul>
                </div>
                <div>
                    <SubHeader>How to create a Subcategory</SubHeader>
                    <ul className="list-none">
                        <Step num={1}>On the 'Categories' page, find the Main Category you want to add to.</Step>
                        <Step num={2}>Click the '+ Add Subcategory' button inside that category's box.</Step>
                        <Step num={3}>A popup will appear. Type the name (e.g., 'Bridal Party').</Step>
                        <Step num={4}>Click 'Add Subcategory' to save.</Step>
                    </ul>
                </div>
            </div>
        </div>
      </GuideSection>

      {/* 2. PRODUCTS */}
      <GuideSection 
        title="Managing Products" 
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        }
      >
         <div className="space-y-6">
            <div>
                <SubHeader>Adding a New Product</SubHeader>
                <ul className="list-none">
                    <Step num={1}>Click 'Products' in the sidebar.</Step>
                    <Step num={2}>Click the 'Add New Product' button at the top right.</Step>
                    <Step num={3}><strong>Name & Price:</strong> Fill in the product name and the selling price.</Step>
                    <Step num={4}><strong>Category:</strong> Select a Category first, then select the Subcategory.</Step>
                    <Step num={5}><strong>Image:</strong> Click 'Select Image'. You can upload a new photo from your computer or pick one you've uploaded before.</Step>
                    <Step num={6}><strong>Stock:</strong> Enter how many items you have available.</Step>
                    <Step num={7}><strong>Featured:</strong> Check the 'Featured Product' box if you want this item to appear on the home page banner.</Step>
                </ul>
            </div>
            
            <div>
                <SubHeader>Customization Options (Personalization)</SubHeader>
                <p className="text-sm mb-3 text-gray-600">Use this for items where the customer needs to type a name, pick a font, or choose a vinyl color.</p>
                <ul className="list-none">
                    <Step num={1}>Scroll down to 'Customization Options' in the product form.</Step>
                    <Step num={2}>Click 'Add Customization Option'.</Step>
                    <Step num={3}><strong>Option Name:</strong> What is this? (e.g., 'Vinyl Color' or 'Name to Engrave').</Step>
                    <Step num={4}><strong>Type:</strong> Choose 'Text' (typing names), 'Select' (dropdown list), or 'Color Picker'.</Step>
                    <Step num={5}><strong>Helper Instructions:</strong> Add a small note for the customer (e.g., "Max 10 characters").</Step>
                    <Step num={6}>
                        <strong>Lines Configuration (For Text):</strong> If you selected 'Text Input', a new section appears. 
                        You can add multiple lines (e.g. Line 1, Line 2) and set a specific <em>Max Character Limit</em> for each line.
                        This is perfect for items with strict physical space limits like Beer Mugs.
                    </Step>
                </ul>
            </div>
         </div>
      </GuideSection>

      {/* 3. STORE APPEARANCE */}
      <GuideSection 
        title="Store Appearance (Logo & Colors)" 
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        }
      >
        <div className="space-y-6">
            <div>
                <SubHeader>How to Change the Logo</SubHeader>
                <ul className="list-none">
                    <Step num={1}>Click 'Settings' in the sidebar.</Step>
                    <Step num={2}>Click the tab labeled 'Appearance'.</Step>
                    <Step num={3}>Under 'Store Logo', click 'Select from Library'.</Step>
                    <Step num={4}>Click 'Upload Image' to choose a file from your computer, wait for it to upload, then click 'Select' on the image.</Step>
                </ul>
            </div>
            <div>
                <SubHeader>How to Change the Hero Banner</SubHeader>
                <ul className="list-none">
                    <Step num={1}>In 'Settings' &gt; 'Appearance', scroll to 'Hero Banner Image'.</Step>
                    <Step num={2}>This is the large image shown at the top of the home page.</Step>
                    <Step num={3}>Click 'Upload Banner' to choose a wide, high-quality image.</Step>
                </ul>
            </div>
            <div>
                <SubHeader>How to Change Text Colors</SubHeader>
                <ul className="list-none">
                    <Step num={1}>In 'Settings' &gt; 'Appearance', look for 'Logo Text Color' or 'Tagline Color'.</Step>
                    <Step num={2}>Click the colored box. A color picker will appear.</Step>
                    <Step num={3}>Select your desired color.</Step>
                    <Step num={4}>Click 'Save All Settings' at the bottom of the page to apply the changes.</Step>
                </ul>
            </div>
        </div>
      </GuideSection>

       {/* 4. TAXES & INVOICES (NEW) */}
       <GuideSection 
        title="Taxes & Invoices" 
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        }
      >
         <div className="space-y-6">
            <div>
                <SubHeader>Configuring GST / Tax</SubHeader>
                <ul className="list-none">
                    <Step num={1}>Go to <strong>Settings &gt; Tax</strong>.</Step>
                    <Step num={2}>Check 'Charge Tax (GST)' if you are registered for GST.</Step>
                    <Step num={3}>Enter the <strong>Tax Label</strong> (e.g., "GST") and the <strong>Rate</strong> (e.g., 15).</Step>
                    <Step num={4}>Enter your <strong>Tax/GST Number</strong>. This will automatically appear on your PDF invoices.</Step>
                    <Step num={5}><em>Note:</em> The system uses a 'Snapshot' method. Changing the tax rate in the future will NOT affect past orders; they retain the rate they were bought at.</Step>
                </ul>
            </div>
             <div>
                <SubHeader>Customizing Invoice Terms</SubHeader>
                <ul className="list-none">
                    <Step num={1}>Go to <strong>Settings &gt; Invoice</strong>.</Step>
                    <Step num={2}>Edit the 'Conditions of Sale / Footer Text'.</Step>
                    <Step num={3}>This text appears at the bottom of every PDF invoice. Use it for payment terms (e.g. "Due in 7 days") or legal conditions.</Step>
                </ul>
            </div>
            <div>
                 <SubHeader>Generating Invoices</SubHeader>
                 <ul className="list-none">
                    <Step num={1}>Go to 'Orders' (Admin) or 'Order History' (Customer Account).</Step>
                    <Step num={2}>Click the 'Invoice' button next to an order.</Step>
                    <Step num={3}>A PDF will download containing your logo, business info, tax details, and line items.</Step>
                </ul>
            </div>
         </div>
      </GuideSection>

      {/* 5. PAYMENTS & SHIPPING */}
      <GuideSection 
        title="Payments & Shipping" 
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
            </svg>
        }
      >
         <div className="space-y-6">
            <div>
                <SubHeader>Setting up Bank Transfer</SubHeader>
                <ul className="list-none">
                    <Step num={1}>Go to <strong>Settings &gt; Payment</strong>.</Step>
                    <Step num={2}>Check the box next to 'Bank Transfer'.</Step>
                    <Step num={3}>In the 'Instructions' box, type your Bank Name, Account Number, and Reference instructions.</Step>
                    <Step num={4}>This text will be shown to customers at checkout and on the invoice.</Step>
                </ul>
            </div>
             <div>
                <SubHeader>Adjusting Shipping Costs</SubHeader>
                <ul className="list-none">
                    <Step num={1}>You set a base shipping cost per product on the individual Product page.</Step>
                    <Step num={2}>To change shipping globally (e.g., add a 10% packaging fee), go to <strong>Settings &gt; Shipping</strong>.</Step>
                    <Step num={3}>Enter '10' in 'Shipping Cost Adjustment' to increase total shipping by 10%.</Step>
                    <Step num={4}>Enter '-10' to discount shipping by 10%.</Step>
                </ul>
            </div>
         </div>
      </GuideSection>
      
      {/* 6. SECURITY */}
      <GuideSection 
        title="Security Settings" 
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        }
      >
         <div className="space-y-6">
            <div>
                <SubHeader>Force Two-Factor Authentication (2FA)</SubHeader>
                <ul className="list-none">
                    <Step num={1}>Go to <strong>Settings &gt; Security</strong>.</Step>
                    <Step num={2}>Check "Force Two-Factor Authentication (2FA)".</Step>
                    <Step num={3}>When enabled, <strong>everyone</strong> (including you) must set up 2FA in their 'My Account' profile to access the store dashboard.</Step>
                    <Step num={4}>This significantly improves account security by requiring a code from a phone app to log in.</Step>
                </ul>
            </div>
            <div>
                <SubHeader>Google reCAPTCHA (Spam Protection)</SubHeader>
                <ul className="list-none">
                    <Step num={1}>Go to <strong>Settings &gt; Security</strong>.</Step>
                    <Step num={2}>Check "Enable Contact Form Captcha".</Step>
                    <Step num={3}>Enter your <strong>Site Key</strong> and <strong>Secret Key</strong> from Google.</Step>
                    <Step num={4}>This adds a "I'm not a robot" checkbox to your Contact Us page to prevent spam.</Step>
                </ul>
            </div>
         </div>
      </GuideSection>

      {/* 7. AI FEATURES */}
      <GuideSection 
        title="AI Shopping Assistant" 
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        }
      >
         <div>
            <p className="text-sm bg-purple-50 p-3 rounded text-purple-800 mb-4">
                <strong>What is it?</strong> Your store includes a smart Voice AI that customers can talk to. It helps them find products and even fills out the cart for them!
            </p>
            <ul className="list-none">
                <Step num={1}>The microphone icon appears on the bottom right of the store.</Step>
                <Step num={2}>The AI reads your <strong>Product Names</strong>, <strong>Descriptions</strong>, and <strong>Customization Options</strong>.</Step>
                <Step num={3}><strong>Tip:</strong> Write clear descriptions and option names so the AI understands them better.</Step>
                <Step num={4}>The AI can add items to the cart if the customer provides all required details (e.g., "Add 2 Beer Mugs with the name Sam").</Step>
            </ul>
         </div>
      </GuideSection>

       {/* 8. ORDER MANAGEMENT */}
       <GuideSection 
        title="Processing Orders" 
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        }
      >
        <div>
             <p className="text-sm text-gray-600 mb-4">
                When a customer buys something, it appears in the 'Orders' page.
            </p>
            <ul className="list-none">
                <Step num={1}><strong>Pending:</strong> The order has been placed. If they paid via Bank Transfer, check your bank account to see if the money arrived.</Step>
                <Step num={2}><strong>Processing:</strong> Change the status to this when you start making the item.</Step>
                <Step num={3}><strong>Shipped:</strong> Update to this when you have posted the item.</Step>
                <Step num={4}><strong>Delivered:</strong> The final status when the item arrives.</Step>
            </ul>
        </div>
      </GuideSection>

    </div>
  );
};

export default SupportPage;
