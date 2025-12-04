

// A structured address object
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// New relational types
export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  created_at?: string;
}

// New Profile type for user-editable data
export interface Profile {
  id: string; // This is the user's UUID from auth.users
  full_name: string | null;
  avatar_url: string | null;
  shipping_address?: Address;
  billing_address?: Address;
  created_at?: string;
  updated_at?: string;
}

// Supabase Schema: `products` table
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  stock: number;
  shippingCost?: number;
  lowStockThreshold?: number;
  isFeatured: boolean;
  customizations: CustomizationOption[] | null;
  created_at?: string;
  // This represents the joined data from Supabase
  subcategory: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    }
  } | null;
}

// Supabase Schema: Part of `products` table JSONB column `customizations`
export interface CustomizationOption {
  id: string;
  name: string; // e.g., "Color", "Custom Text"
  type: 'color' | 'text' | 'select';
  options?: string[]; // For 'select' type, e.g., ["Small", "Medium", "Large"]
  maxLength?: number; // Legacy support for single line limits
  lineLengths?: number[]; // NEW: Array of max lengths for each line. If [20, 15], renders 2 inputs.
  isMultiline?: boolean; // Deprecated in favor of lineLengths
  helperText?: string; // Instructions for the customer
  required: boolean;
}

// Supabase Schema: `customers` table
export interface Customer {
  id: string;
  name: string;
  email: string;
  shippingAddress: Address;
  billingAddress: Address;
}

// Supabase Schema: `orders` table
export interface Order {
  id: string;
  customerId: string;
  userId: string | null; // Link to the auth.users table
  items: CartItem[];
  total: number;
  shippingCost: number;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  orderDate: string;
  created_at?: string;
  shippingAddress: Address;
  billingAddress: Address;
  // Tax Snapshot: Stores the tax details at the time of purchase
  tax?: {
    rate: number;
    amount: number;
    label: string;
  };
}

export interface CartItem {
  cartItemId: string; // Unique ID for the cart item instance
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  customizations: Record<string, string>; // { customizationId: value }
}

// Supabase Schema: `store_settings` table (single row)
export interface StoreSettings {
  logoUrl: string;
  logoText: string;
  logoTextColor: string;
  heroImageUrl: string; // New field for the hero banner
  tagline: string;
  taglineColor: string;
  aboutUsContent: string; // New field for HTML content
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
  };
  address: string;
  phone: string; // New Phone field
  openingHours: string;
  shipping: {
    adjustmentPercentage: number;
  };
  // New Tax configuration
  tax: {
      enabled: boolean;
      rate: number; // Percentage (e.g., 15)
      label: string; // e.g., "GST"
      taxNumber: string; // e.g., GST Number
  };
  // Terms to appear on the invoice
  invoiceTerms: string;
  payment: {
    paypal: {
      enabled: boolean;
      clientId: string;
    };
    stripe: {
      enabled: boolean;
      publishableKey: string;
      secretKey: string;
    };
    bankTransfer: {
      enabled: boolean;
      instructions: string;
    };
    cashOnPickup: {
      enabled: boolean;
      instructions: string;
    };
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  analytics: {
    googleAnalyticsId: string;
  };
  recaptcha?: {
      enabled: boolean;
      siteKey: string;
      secretKey: string;
  };
  // New Security Configuration
  security: {
      force2fa: boolean;
  };
  // New AI Configuration
  ai: {
      enabled: boolean;
      apiKey: string;
      model: string;
      persona: string;
  };
}

// New type for the AI Chat Widget
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string } // payload is cartItemId
  | { type: 'ADD_MULTIPLE_TO_CART'; payload: CartItem[] }
  | { type: 'CLEAR_CART' };