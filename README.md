
# Crafts By Sam - Custom Storefront (Supabase Edition)

This project is a fully customizable e-commerce platform connected to a Supabase backend. All data for products, orders, customers, and store settings is fetched from and saved to your Supabase database.

## 🚀 Getting Started: Supabase Setup

To run this application, you need a Supabase project. Follow these steps to set it up correctly.

### 1. Create a Supabase Project

If you don't have one already, go to [supabase.com](https://supabase.com), create an account, and start a new project.

### 2. Run the SQL Setup Script

1.  Go to the **SQL Editor** in your Supabase dashboard.
2.  Click **+ New query**.
3.  **Copy and Paste** the code block below into the editor and click **Run**.

```sql
-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRE-CLEANUP (Optional - Use with caution if you have production data)
-- DROP TABLE IF EXISTS public.reviews; 
-- DROP TABLE IF EXISTS public.order_items;

-- 3. Create or Update Tables

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subcategories
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name, category_id)
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    "discountPrice" NUMERIC,
    "imageUrl" TEXT,
    stock INTEGER DEFAULT 0,
    "shippingCost" NUMERIC DEFAULT 0,
    "lowStockThreshold" INTEGER DEFAULT 5,
    "isFeatured" BOOLEAN DEFAULT false,
    "subcategory_id" UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    customizations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    "shippingAddress" JSONB,
    "billingAddress" JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    "customerId" TEXT REFERENCES public.customers(id),
    "userId" UUID REFERENCES auth.users(id),
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    "shippingCost" NUMERIC DEFAULT 0,
    "paymentMethod" TEXT,
    status TEXT DEFAULT 'Pending',
    "orderDate" DATE DEFAULT CURRENT_DATE,
    "shippingAddress" JSONB,
    "billingAddress" JSONB,
    tax JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Store Settings
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INTEGER NOT NULL DEFAULT 1,
    "logoUrl" TEXT,
    "logoText" TEXT DEFAULT 'Crafts By Sam',
    "logoTextColor" TEXT DEFAULT '#4a5568',
    "heroImageUrl" TEXT,
    tagline TEXT DEFAULT 'Handmade creations, just for you.',
    "taglineColor" TEXT DEFAULT '#718096',
    "aboutUsContent" TEXT,
    socials JSONB DEFAULT '{"instagram": "", "facebook": "", "tiktok": "", "youtube": ""}'::jsonb,
    address TEXT DEFAULT '123 Creative Lane, Artville',
    phone TEXT DEFAULT '021 123 4567',
    "openingHours" TEXT DEFAULT 'Mon - Fri: 9am - 5pm',
    shipping JSONB DEFAULT '{"adjustmentPercentage": 0}'::jsonb,
    "invoiceTerms" TEXT DEFAULT 'Payment is due upon receipt. Title to the goods remains with Crafts By Sam until payment has been made in full.',
    payment JSONB DEFAULT '{"paypal": {"enabled": false, "clientId": ""}, "stripe": {"enabled": false, "publishableKey": "", "secretKey": ""}, "bankTransfer": {"enabled": true, "instructions": "Bank: ASB\nAccount: 12-3456-7890123-00"}, "cashOnPickup": {"enabled": true, "instructions": "Pickup available."}}'::jsonb,
    seo JSONB DEFAULT '{"metaTitle": "Crafts By Sam", "metaDescription": "Handmade goods"}'::jsonb,
    analytics JSONB DEFAULT '{"googleAnalyticsId": ""}'::jsonb,
    recaptcha JSONB DEFAULT '{"enabled": false, "siteKey": "", "secretKey": ""}'::jsonb,
    security JSONB DEFAULT '{"force2fa": false}'::jsonb,
    ai JSONB DEFAULT '{"enabled": false, "apiKey": "", "model": "gemini-2.5-flash", "persona": ""}'::jsonb,
    CONSTRAINT store_settings_pkey PRIMARY KEY (id),
    CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- 4. IMPORTANT: FIX MISSING OR INCORRECT COLUMNS (Run this section to fix errors)

DO $$
BEGIN
    -- Fix: "null value in column date" error
    -- If a legacy 'date' column exists, rename it to 'orderDate' or remove constraints.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'date') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'orderDate') THEN
            -- Rename 'date' to 'orderDate' if 'orderDate' is missing
            ALTER TABLE public.orders RENAME COLUMN "date" TO "orderDate";
        ELSE
            -- If both exist, make 'date' optional so it doesn't block inserts
            ALTER TABLE public.orders ALTER COLUMN "date" DROP NOT NULL;
        END IF;
    END IF;
END $$;

-- Orders Table Fixes
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "shippingCost" NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "shippingAddress" JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "billingAddress" JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "customerId" TEXT REFERENCES public.customers(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "orderDate" DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax JSONB;

-- Customers Table Fixes
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS "shippingAddress" JSONB;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS "billingAddress" JSONB;

-- Products Table Fixes
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "shippingCost" NUMERIC DEFAULT 0;

-- Profiles Table Fixes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_address JSONB;

-- Store Settings Fixes
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS "heroImageUrl" TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS "aboutUsContent" TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS shipping JSONB DEFAULT '{"adjustmentPercentage": 0}'::jsonb;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS payment JSONB DEFAULT '{"paypal": {"enabled": false, "clientId": ""}, "stripe": {"enabled": false, "publishableKey": "", "secretKey": ""}, "bankTransfer": {"enabled": true, "instructions": "Bank: ASB\nAccount: 12-3456-7890123-00"}, "cashOnPickup": {"enabled": true, "instructions": "Pickup available."}}'::jsonb;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS recaptcha JSONB DEFAULT '{"enabled": false, "siteKey": "", "secretKey": ""}'::jsonb;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS "invoiceTerms" TEXT DEFAULT 'Payment is due upon receipt. Title to the goods remains with Crafts By Sam until payment has been made in full.';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS security JSONB DEFAULT '{"force2fa": false}'::jsonb;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS ai JSONB DEFAULT '{"enabled": false, "apiKey": "", "model": "gemini-2.5-flash", "persona": ""}'::jsonb;

-- 5. Insert Initial Data (Settings)
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create/Update Policies (Dropping first to avoid duplication errors)

-- Products
DROP POLICY IF EXISTS "Public products are viewable by everyone." ON products;
CREATE POLICY "Public products are viewable by everyone." ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Categories
DROP POLICY IF EXISTS "Public categories are viewable by everyone." ON categories;
CREATE POLICY "Public categories are viewable by everyone." ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Subcategories
DROP POLICY IF EXISTS "Public subcategories are viewable by everyone." ON subcategories;
CREATE POLICY "Public subcategories are viewable by everyone." ON subcategories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage subcategories" ON subcategories;
CREATE POLICY "Admins can manage subcategories" ON subcategories FOR ALL USING (auth.role() = 'authenticated');

-- Orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = "userId");
DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Customers
DROP POLICY IF EXISTS "Admins can view customers" ON customers;
CREATE POLICY "Admins can view customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Public can create customers" ON customers;
CREATE POLICY "Public can create customers" ON customers FOR INSERT WITH CHECK (true);

-- Store Settings
DROP POLICY IF EXISTS "Public settings are viewable by everyone." ON store_settings;
CREATE POLICY "Public settings are viewable by everyone." ON store_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can update settings" ON store_settings;
CREATE POLICY "Admins can update settings" ON store_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 8. Functions and Triggers (For User Creation)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, created_at)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Force Schema Refresh (CRITICAL)
NOTIFY pgrst, 'reload schema';

---------------------------------------------------------------------------
-- 🌱 SEED INITIAL DATA (Populates Categories, Subcategories & 8 Products)
---------------------------------------------------------------------------

DO $$
DECLARE
    cat_glassware_id UUID;
    cat_decor_id UUID;
    cat_accessories_id UUID;
    sub_beer_id UUID;
    sub_wine_id UUID;
    sub_keyring_id UUID;
    sub_coasters_id UUID;
BEGIN
    -- 1. Create Categories
    INSERT INTO public.categories (name) VALUES ('Glassware') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_glassware_id;
    INSERT INTO public.categories (name) VALUES ('Home Decor') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_decor_id;
    INSERT INTO public.categories (name) VALUES ('Accessories') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_accessories_id;

    -- 2. Create Subcategories
    INSERT INTO public.subcategories (name, category_id) VALUES ('Beer Mugs', cat_glassware_id) ON CONFLICT (name, category_id) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO sub_beer_id;
    INSERT INTO public.subcategories (name, category_id) VALUES ('Wine Glasses', cat_glassware_id) ON CONFLICT (name, category_id) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO sub_wine_id;
    INSERT INTO public.subcategories (name, category_id) VALUES ('Keyrings', cat_accessories_id) ON CONFLICT (name, category_id) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO sub_keyring_id;
    INSERT INTO public.subcategories (name, category_id) VALUES ('Coasters', cat_decor_id) ON CONFLICT (name, category_id) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO sub_coasters_id;

    -- 3. Insert Products (Using ON CONFLICT to avoid duplicates if run multiple times, based on name usually, but name isn't unique constraint by default. I'll just do simple inserts or check if exists. For simplicity in this block, I'll just Insert. Users should clear table if they want fresh seed.)
    
    -- GLASSWARE: Beer Mugs
    -- 1. Standard Mug
    INSERT INTO public.products (name, description, price, stock, "imageUrl", "isFeatured", "subcategory_id", customizations)
    VALUES (
        'Personalized Beer Mug',
        'A robust, heavy-duty beer mug perfect for your favorite brew. Custom etched with your name or a short message.',
        24.99,
        50,
        'https://placehold.co/400x400/e2e8f0/1e293b?text=Beer+Mug',
        true,
        sub_beer_id,
        '[
            {"id": "mug_text", "name": "Custom Text", "type": "text", "required": true, "helperText": "Enter up to 2 lines. Line 1 is larger font.", "lineLengths": [12, 20]},
            {"id": "mug_color", "name": "Vinyl Color", "type": "select", "options": ["Black", "Gold", "Silver", "Etched Effect"], "required": true}
        ]'::jsonb
    );

    -- 2. Frosted Stein
    INSERT INTO public.products (name, description, price, stock, "imageUrl", "isFeatured", "subcategory_id", customizations)
    VALUES (
        'Frosted Beer Stein',
        'Keep your drink ice cold with this premium frosted stein. Perfect for hot summer days.',
        29.99,
        30,
        'https://placehold.co/400x400/cbd5e1/334155?text=Frosted+Stein',
        false,
        sub_beer_id,
        '[
            {"id": "stein_name", "name": "Name", "type": "text", "required": true, "helperText": "Vertical text placement.", "lineLengths": [15]},
            {"id": "stein_color", "name": "Vinyl Color", "type": "select", "options": ["Black", "Navy Blue", "Dark Green"], "required": true}
        ]'::jsonb
    );

    -- GLASSWARE: Wine Glasses
    -- 1. Elegant Glass
    INSERT INTO public.products (name, description, price, stock, "imageUrl", "isFeatured", "subcategory_id", customizations)
    VALUES (
        'Elegant Wine Glass',
        'Sophisticated stemware for the wine lover. Personalized with high-quality permanent vinyl.',
        19.99,
        100,
        'https://placehold.co/400x400/fce7f3/be185d?text=Wine+Glass',
        true,
        sub_wine_id,
        '[
            {"id": "wine_name", "name": "Name", "type": "text", "required": true, "helperText": "Max 12 characters. Single line only.", "lineLengths": [12]},
            {"id": "wine_font", "name": "Font Style", "type": "select", "options": ["Cursive", "Block", "Typewriter"], "required": true},
            {"id": "wine_color", "name": "Vinyl Color", "type": "select", "options": ["Gold", "Rose Gold", "Black", "White"], "required": true}
        ]'::jsonb
    );

    -- 2. Stemless Tumbler
    INSERT INTO public.products (name, description, price, stock, "imageUrl", "isFeatured", "subcategory_id", customizations)
    VALUES (
        'Stemless Wine Tumbler',
        'Modern and chic, these stemless glasses are less prone to tipping. Great for casual gatherings.',
        16.50,
        75,
        'https://placehold.co/400x400/fdf2f8/db2777?text=Stemless+Glass',
        false,
        sub_wine_id,
        '[
            {"id": "tumbler_initial", "name": "Initial", "type": "text", "required": true, "helperText": "Single initial letter.", "lineLengths": [1]},
            {"id": "tumbler_color", "name": "Vinyl Color", "type": "select", "options": ["Holographic", "Gold", "Silver"], "required": true}
        ]'::jsonb
    );

    -- ACCESSORIES: Keyrings
    -- 1. Resin Letter
    INSERT INTO public.products (name, description, price, stock, "imageUrl", "isFeatured", "subcategory_id", customizations)
    VALUES (
        'Resin Letter Keyring',
        'Hand-poured epoxy resin keyring with gold flakes. Choose your letter and flower color.',
        12.50,
        200,
        'https://placehold.co/400x400/fff7ed/c2410c?text=Keyring',
        false,
        sub_keyring_id,
        '[
            {"id": "key_letter", "name": "Letter", "type": "text", "required": true, "helperText": "Enter a single letter (A-Z).", "lineLengths": [1]},
            {"id": "flower_color", "name": "Flower Color", "type": "select", "options": ["Pink", "Blue", "Purple", "Yellow", "White"], "required": true}
        ]'::jsonb
    );

    -- 2. Acrylic Name Tag
    INSERT INTO public.products (name, description, price, stock, "imageUrl", "isFeatured", "subcategory_id", customizations)
    VALUES (
        'Acrylic Name Tag Keyring',
        'Clear acrylic circle with a painted background and your name in cursive vinyl.',
        14.00,
        150,
        'https://placehold.co/400x400/ffedd5/9a3412?text=Name+Tag',
        true,
        sub_keyring_id,
        '[
            {"id": "tag_name", "name": "Name", "type": "text", "required": true, "helperText": "Max 10 chars.", "lineLengths": [10]},
            {"id": "bg_color", "name": "Background Paint Color", "type": "select", "options": ["Pink", "Mint", "Lilac", "White"], "required": true},
            {"id": "text_color", "name": "Text Color", "type": "select", "options": ["Black", "Gold", "White"], "required": true}
        ]'::jsonb
    );

    -- HOME DECOR: Coasters
    -- 1. Geode Coaster
    INSERT INTO public.products (name, description, price, stock, "imageUrl", "isFeatured", "subcategory_id", customizations)
    VALUES (
        'Geode Resin Coaster',
        'Stunning resin coaster mimicking natural geode stones with gold edges.',
        18.00,
        40,
        'https://placehold.co/400x400/f0f9ff/0369a1?text=Geode+Coaster',
        true,
        sub_coasters_id,
        '[
            {"id": "coaster_color", "name": "Main Color", "type": "select", "options": ["Ocean Blue", "Emerald Green", "Amethyst Purple"], "required": true},
            {"id": "edge_color", "name": "Edge Detail", "type": "select", "options": ["Gold Leaf", "Silver Leaf"], "required": true}
        ]'::jsonb
    );
    
    -- 2. Custom Slate Coaster
    INSERT INTO public.products (name, description, price, stock, "imageUrl", "isFeatured", "subcategory_id", customizations)
    VALUES (
        'Engraved Slate Coaster',
        'Natural slate coaster with laser-engraved customization. Rustic and durable.',
        15.00,
        60,
        'https://placehold.co/400x400/f1f5f9/475569?text=Slate+Coaster',
        false,
        sub_coasters_id,
        '[
            {"id": "slate_text", "name": "Custom Text/Quote", "type": "text", "required": true, "helperText": "Max 3 lines.", "lineLengths": [15, 15, 15]}
        ]'::jsonb
    );

END $$;