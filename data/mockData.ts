
import { Product, Category, Subcategory, Order, Customer, Profile } from '../types';

export const mockCategories: Category[] = [
    { id: 'cat_glass', name: 'Glassware', created_at: new Date().toISOString() },
    { id: 'cat_decor', name: 'Home Decor', created_at: new Date().toISOString() },
    { id: 'cat_access', name: 'Accessories', created_at: new Date().toISOString() },
];

export const mockSubcategories: Subcategory[] = [
    { id: 'sub_beer', name: 'Beer Mugs', category_id: 'cat_glass', created_at: new Date().toISOString() },
    { id: 'sub_wine', name: 'Wine Glasses', category_id: 'cat_glass', created_at: new Date().toISOString() },
    { id: 'sub_keyring', name: 'Keyrings', category_id: 'cat_access', created_at: new Date().toISOString() },
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
    }
];

export const mockOrders: Order[] = [];
export const mockCustomers: Customer[] = [];
export const mockProfiles: Profile[] = [];
