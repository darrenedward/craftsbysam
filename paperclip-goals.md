# Crafts By Sam - Project Goals

## Overview
Fully customizable e-commerce storefront for a handmade crafts business (glassware, home decor, accessories). Built with React + Vite on the frontend, Supabase as backend (auth, database, RLS), and Stripe for payments. The store owner manages everything through an admin dashboard — no code changes needed for day-to-day operations.

## Tech Stack
- Frontend: React 18, TypeScript, Vite
- Backend: Supabase (PostgreSQL, Auth, RLS policies)
- Payments: Stripe (Checkout + Elements), PayPal, bank transfer, cash on pickup
- PDF: jsPDF + autotable for invoice generation
- AI: Google Gemini (store chatbot assistant)
- Hosting: Vercel

## Core Features

### Store Management
- Single-row `store_settings` table controls all branding: logo, hero image, tagline, about us, socials, SEO meta tags, Google Analytics
- Configurable payment methods (enable/disable Stripe, PayPal, bank transfer, cash on pickup)
- Shipping cost adjustment percentage, per-product shipping costs
- Invoice terms and recaptcha settings

### Product Catalog
- Categories and subcategories with cascading deletes
- Products with customizations (JSONB array of text inputs, color selectors, font options)
- Stock tracking with low-stock thresholds
- Featured products flag for homepage spotlight

### Order System
- Full order lifecycle: Pending → Processing → Shipped → Delivered
- PDF invoice generation via jsPDF
- Shipping and billing address capture
- Tax calculation support
- Payment method tracking per order

### Customer Management
- Customer profiles with shipping/billing addresses
- Order history linked to customers
- Guest checkout support (no account required)
- Authenticated user profiles via Supabase Auth

### Security
- Row Level Security (RLS) on all tables
- Public read for products/categories/settings, authenticated write for admin actions
- Users can only view their own orders
- Optional 2FA enforcement via store settings
- Optional reCAPTCHA integration

### AI Store Assistant
- Gemini-powered chatbot with configurable persona
- Enabled/disabled and API key managed from store settings

## Current State
The app is functional with seed data for 8 products across 3 categories (Glassware, Home Decor, Accessories). Uses placeholder images. Supabase project is live. Storefront and admin dashboard are both working.

## Priority Areas for Development
1. Polish UI/UX — better product images, responsive mobile experience, checkout flow refinement
2. Payment integration completion — Stripe Checkout end-to-end, PayPal integration
3. Order management improvements — status update notifications, email receipts
4. Admin dashboard enhancements — sales analytics, inventory alerts, customer insights
5. AI chatbot — wire up Gemini assistant with product knowledge and order status lookup
6. Performance — lazy loading, image optimization, caching strategy
