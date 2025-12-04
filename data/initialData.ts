

import { StoreSettings } from '../types';

export const initialSettings: StoreSettings = {
  logoUrl: "",
  logoText: "Crafts By Sam",
  logoTextColor: "#4a5568",
  heroImageUrl: "https://picsum.photos/seed/crafts-by-sam-hero/1920/1080", // Default fallback
  tagline: "Handmade creations, just for you.",
  taglineColor: "#718096",
  aboutUsContent: `
    <h3>Welcome to Crafts By Sam</h3>
    <p>Welcome to Crafts By Sam, where creativity comes to life! My name is Sam, and I pour my heart and soul into every piece I create. What started as a hobby has blossomed into a passion for making beautiful, personalized items that bring joy to others.</p>
    <p><br></p>
    <p>I specialize in custom creations using high-quality vinyls and shimmering epoxy resin. From elegant personalized glassware perfect for weddings and special occasions, to unique keyrings and custom-quoted ash trays, each item is handcrafted with precision and care.</p>
    <p><br></p>
    <p>My goal is to create something truly special and unique for you. Whether you're looking for the perfect gift or a little something to treat yourself, I'm here to bring your vision to life. Thank you for supporting my small business and my dream!</p>
  `,
  socials: {
    instagram: "https://instagram.com/craftsbysam",
    facebook: "https://facebook.com/craftsbysam",
    tiktok: "https://tiktok.com/@craftsbysam",
    youtube: "https://youtube.com/@craftsbysam",
  },
  address: "123 Creative Lane, Artville",
  phone: "021 123 4567",
  openingHours: "Mon - Fri: 9am - 5pm",
  shipping: {
    adjustmentPercentage: 0,
  },
  tax: {
      enabled: false,
      rate: 15,
      label: "GST",
      taxNumber: ""
  },
  invoiceTerms: "Payment is due upon receipt. Title to the goods remains with Crafts By Sam until payment has been made in full. Please reference your Invoice Number on all bank transfers.",
  payment: {
    paypal: { enabled: false, clientId: '' },
    stripe: { enabled: false, publishableKey: '', secretKey: '' },
    bankTransfer: { enabled: true, instructions: 'Bank: ASB\nAccount: 12-3456-7890123-00\nReference: Your Order ID' },
    cashOnPickup: { enabled: true, instructions: 'Pickup from 123 Creative Lane. We will contact you to arrange a time.' }
  },
  seo: {
    metaTitle: "Crafts By Sam | Handmade Custom Creations",
    metaDescription: "Shop for personalized glassware, epoxy resin keyrings, and more. Unique, handcrafted gifts made with love.",
  },
  analytics: {
    googleAnalyticsId: "", // e.g., "G-XXXXXXXXXX"
  },
  recaptcha: {
    enabled: false,
    siteKey: "",
    secretKey: ""
  },
  security: {
      force2fa: false
  },
  ai: {
      enabled: false,
      apiKey: "",
      model: "gemini-2.5-flash",
      persona: "You are a friendly and helpful voice shopping assistant for 'Crafts By Sam'. Help customers find products and customize them."
  }
};