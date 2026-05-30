
import { Product, Category, Subcategory, Order, Customer, Profile } from '../types';

export const mockCategories: Category[] = [
    { id: 'cat_glass', name: 'Glassware', created_at: new Date().toISOString() },
    { id: 'cat_decor', name: 'Home Decor', created_at: new Date().toISOString() },
    { id: 'cat_access', name: 'Accessories', created_at: new Date().toISOString() },
];

export const mockSubcategories: Subcategory[] = [
    { id: 'sub_beer', name: 'Beer Mugs', category_id: 'cat_glass', created_at: new Date().toISOString() },
    { id: 'sub_wine', name: 'Wine Glasses', category_id: 'cat_glass', created_at: new Date().toISOString() },
    { id: 'sub_whiskey', name: 'Whiskey Glasses', category_id: 'cat_glass', created_at: new Date().toISOString() },
    { id: 'sub_champagne', name: 'Champagne Flutes', category_id: 'cat_glass', created_at: new Date().toISOString() },
    { id: 'sub_keyring', name: 'Keyrings', category_id: 'cat_access', created_at: new Date().toISOString() },
    { id: 'sub_phonecase', name: 'Phone Cases', category_id: 'cat_access', created_at: new Date().toISOString() },
    { id: 'sub_totebag', name: 'Tote Bags', category_id: 'cat_access', created_at: new Date().toISOString() },
    { id: 'sub_coasters', name: 'Coasters', category_id: 'cat_decor', created_at: new Date().toISOString() },
];

export const mockProducts: Product[] = [
    {
        id: 'prod_1',
        name: 'Personalized Beer Mug',
        description: 'A robust, heavy-duty beer mug perfect for your favorite brew. Custom etched with your name or a short message.',
        price: 24.99,
        stock: 50,
        imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Beer+Mug',
        isFeatured: true,
        subcategory: { id: 'sub_beer', name: 'Beer Mugs', category: { id: 'cat_glass', name: 'Glassware' } },
        customizations: [
            { id: "mug_text", name: "Custom Text", type: "text", required: true, helperText: "Enter up to 2 lines. Line 1 is larger font.", lineLengths: [12, 20] },
            { id: "mug_color", name: "Vinyl Color", type: "select", options: ["Black", "Gold", "Silver", "Etched Effect"], required: true }
        ],
        created_at: new Date().toISOString()
    },
    {
        id: 'prod_2',
        name: 'Frosted Beer Stein',
        description: 'Keep your drink ice cold with this premium frosted stein. Perfect for hot summer days.',
        price: 29.99,
        stock: 30,
        imageUrl: 'https://placehold.co/400x400/cbd5e1/334155?text=Frosted+Stein',
        isFeatured: false,
        subcategory: { id: 'sub_beer', name: 'Beer Mugs', category: { id: 'cat_glass', name: 'Glassware' } },
        customizations: [
            { id: "stein_name", name: "Name", type: "text", required: true, helperText: "Vertical text placement.", lineLengths: [15] },
            { id: "stein_color", name: "Vinyl Color", type: "select", options: ["Black", "Navy Blue", "Dark Green"], required: true }
        ],
        created_at: new Date().toISOString()
    },
    {
        id: 'prod_3',
        name: 'Elegant Wine Glass',
        description: 'Sophisticated stemware for the wine lover. Personalized with high-quality permanent vinyl.',
        price: 19.99,
        stock: 100,
        imageUrl: 'https://placehold.co/400x400/fce7f3/be185d?text=Wine+Glass',
        isFeatured: true,
        subcategory: { id: 'sub_wine', name: 'Wine Glasses', category: { id: 'cat_glass', name: 'Glassware' } },
        customizations: [
            { id: "wine_name", name: "Name", type: "text", required: true, helperText: "Max 12 characters. Single line only.", lineLengths: [12] },
            { id: "wine_font", name: "Font Style", type: "select", options: ["Cursive", "Block", "Typewriter"], required: true },
            { id: "wine_color", name: "Vinyl Color", type: "select", options: ["Gold", "Rose Gold", "Black", "White"], required: true }
        ],
        created_at: new Date().toISOString()
    },
    {
        id: 'prod_4',
        name: 'Stemless Wine Tumbler',
        description: 'Modern and chic, these stemless glasses are less prone to tipping. Great for casual gatherings.',
        price: 16.50,
        stock: 75,
        imageUrl: 'https://placehold.co/400x400/fdf2f8/db2777?text=Stemless+Glass',
        isFeatured: false,
        subcategory: { id: 'sub_wine', name: 'Wine Glasses', category: { id: 'cat_glass', name: 'Glassware' } },
        customizations: [
            { id: "tumbler_initial", name: "Initial", type: "text", required: true, helperText: "Single initial letter.", lineLengths: [1] },
            { id: "tumbler_color", name: "Vinyl Color", type: "select", options: ["Holographic", "Gold", "Silver"], required: true }
        ],
        created_at: new Date().toISOString()
    },
    {
        id: 'prod_5',
        name: 'Resin Letter Keyring',
        description: 'Hand-poured epoxy resin keyring with gold flakes. Choose your letter and flower color.',
        price: 12.50,
        stock: 200,
        imageUrl: 'https://placehold.co/400x400/fff7ed/c2410c?text=Keyring',
        isFeatured: false,
        subcategory: { id: 'sub_keyring', name: 'Keyrings', category: { id: 'cat_access', name: 'Accessories' } },
        customizations: [
            { id: "key_letter", name: "Letter", type: "text", required: true, helperText: "Enter a single letter (A-Z).", lineLengths: [1] },
            { id: "flower_color", name: "Flower Color", type: "select", options: ["Pink", "Blue", "Purple", "Yellow", "White"], required: true }
        ],
        created_at: new Date().toISOString()
    },
    {
        id: 'prod_6',
        name: 'Geode Resin Coaster',
        description: 'Stunning resin coaster mimicking natural geode stones with gold edges.',
        price: 18.00,
        stock: 40,
        imageUrl: 'https://placehold.co/400x400/f0f9ff/0369a1?text=Geode+Coaster',
        isFeatured: true,
        subcategory: { id: 'sub_coasters', name: 'Coasters', category: { id: 'cat_decor', name: 'Home Decor' } },
        customizations: [
            { id: "coaster_color", name: "Main Color", type: "select", options: ["Ocean Blue", "Emerald Green", "Amethyst Purple"], required: true },
            { id: "edge_color", name: "Edge Detail", type: "select", options: ["Gold Leaf", "Silver Leaf"], required: true }
        ],
        created_at: new Date().toISOString()
    },
    {
        id: 'prod_7',
        name: 'Personalised Whiskey Glass',
        description: 'Weighted base, crystal-clear clarity, and a rocks glass silhouette built for serious sippers.',
        price: 28.99,
        stock: 60,
        imageUrl: 'https://placehold.co/400x400/fef3c7/b45309?text=Whiskey+Glass',
        isFeatured: true,
        subcategory: { id: 'sub_whiskey', name: 'Whiskey Glasses', category: { id: 'cat_glass', name: 'Glassware' } },
        customizations: [
            { id: "whiskey_text", name: "Engraving", type: "text", required: true, helperText: "Name, message, or quote. Up to 2 lines.", lineLengths: [15, 20] },
            { id: "whiskey_font", name: "Font Style", type: "select", options: ["Bold", "Script", "Rustic"], required: true },
            { id: "whiskey_gold", name: "Gold Accent", type: "select", options: ["No", "Yes - +$5"], required: true }
        ],
        created_at: new Date().toISOString()
    },
    {
        id: 'prod_8',
        name: 'Personalised Champagne Flute',
        description: 'Elegant, tall-stemmed, and designed to showcase bubbles at their best.',
        price: 24.99,
        stock: 45,
        imageUrl: 'https://placehold.co/400x400/fae8ff/7e22ce?text=Champagne+Flute',
        isFeatured: true,
        subcategory: { id: 'sub_champagne', name: 'Champagne Flutes', category: { id: 'cat_glass', name: 'Glassware' } },
        customizations: [
            { id: "champ_names", name: "Names/Message", type: "text", required: true, helperText: "Bride & Groom names, or personal message. Up to 2 lines.", lineLengths: [20, 25] },
            { id: "champ_placement", name: "Engraving Placement", type: "select", options: ["Bowl (visible)", "Stem (subtle)"], required: true },
            { id: "champ_font", name: "Font Style", type: "select", options: ["Delicate Script", "Modern Clean", "Sparkle Contrast"], required: true }
        ],
        created_at: new Date().toISOString()
    },
    {
        id: 'prod_9',
        name: 'Personalised Phone Case',
        description: 'Crafted from durable impact-resistant polycarbonate, each case offers reliable protection without bulk.',
        price: 34.99,
        stock: 80,
        imageUrl: 'https://placehold.co/400x400/f0fdf4/166534?text=Phone+Case',
        isFeatured: false,
        subcategory: { id: 'sub_phonecase', name: 'Phone Cases', category: { id: 'cat_access', name: 'Accessories' } },
        customizations: [
            { id: "phone_model", name: "Phone Model", type: "select", options: ["iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "Samsung S21", "Samsung S22", "Samsung S23", "Samsung S24", "Google Pixel 7", "Google Pixel 8"], required: true },
            { id: "phone_text", name: "Personalisation", type: "text", required: true, helperText: "Name, initials, or short quote. Up to 2 lines.", lineLengths: [12, 20] },
            { id: "phone_color", name: "Case Color", type: "select", options: ["Black", "White", "Navy Blue", "Forest Green"], required: true },
            { id: "phone_placement", name: "Text Placement", type: "select", options: ["Centered", "Corner", "Full-width"], required: true }
        ],
        created_at: new Date().toISOString()
    },
    {
        id: 'prod_10',
        name: 'Personalised Tote Bag',
        description: 'Sewn from heavyweight 100% cotton canvas, each tote is built to handle groceries, books, gym gear, or everyday essentials.',
        price: 29.99,
        stock: 70,
        imageUrl: 'https://placehold.co/400x400/fffbeb/92400e?text=Tote+Bag',
        isFeatured: true,
        subcategory: { id: 'sub_totebag', name: 'Tote Bags', category: { id: 'cat_access', name: 'Accessories' } },
        customizations: [
            { id: "tote_text", name: "Personalisation", type: "text", required: true, helperText: "Your name, phrase, or motto. Up to 2 lines.", lineLengths: [15, 25] },
            { id: "tote_method", name: "Decoration Method", type: "select", options: ["Embroidery", "Screen Print"], required: true },
            { id: "tote_color", name: "Bag Color", type: "select", options: ["Natural Canvas", "Black", "Navy", "Forest Green"], required: true },
            { id: "tote_placement", name: "Placement", type: "select", options: ["Centered Pocket", "Strap Tag", "Full-width Statement"], required: true }
        ],
        created_at: new Date().toISOString()
    }
];

export const mockOrders: Order[] = [];
export const mockCustomers: Customer[] = [];
export const mockProfiles: Profile[] = [];
