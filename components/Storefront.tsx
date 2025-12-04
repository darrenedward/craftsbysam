
import React, { useState, useMemo, useRef } from 'react';
import Header from './storefront/Header';
import Hero from './storefront/Hero';
import ProductGrid from './storefront/ProductGrid';
import Footer from './storefront/Footer';
import { useStore } from '../hooks/useStore';
import TermsOfService from './storefront/TermsOfService';
import PrivacyPolicy from './storefront/PrivacyPolicy';
import ContactPage from './storefront/ContactPage';
import AboutPage from './storefront/AboutPage';
import ProductDetailPage from './storefront/ProductDetailPage';
import CartPanel from './storefront/CartPanel';
import CheckoutPage from './storefront/CheckoutPage';
import VoiceAIChatWidget from './storefront/VoiceAIChatWidget';
import Sidebar from './storefront/Sidebar';
import FeaturedProducts from './storefront/FeaturedProducts';
import HelpPage from './storefront/HelpPage';

interface StorefrontProps {
  goToAdmin: () => void;
  goToAccount: () => void;
  session: any | null;
}

export type Page = 'home' | 'terms' | 'privacy' | 'contact' | 'about' | 'checkout' | 'orderConfirmation' | 'help';

const Storefront: React.FC<StorefrontProps> = ({ goToAdmin, goToAccount, session }) => {
  const { products, categories, subcategories } = useStore();
  const [page, setPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<{ type: 'category' | 'subcategory' | 'featured', id: string } | null>(null);
  
  const productGridRef = useRef<HTMLDivElement>(null);

  const selectedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;
  
  const featuredProducts = useMemo(() => {
    return products.filter(p => p.isFeatured);
  }, [products]);

  const currentFilterName = useMemo(() => {
    if (!selectedFilter) return "All Products";
    if (selectedFilter.type === 'featured') return "Featured Products";
    if (selectedFilter.type === 'category') {
      return categories.find(c => c.id === selectedFilter.id)?.name || "All Products";
    }
    if (selectedFilter.type === 'subcategory') {
      const sub = subcategories.find(s => s.id === selectedFilter.id);
      const cat = categories.find(c => c.id === sub?.category_id);
      return sub && cat ? `${cat.name} / ${sub.name}` : "All Products";
    }
  }, [selectedFilter, categories, subcategories]);

  const filteredProducts = useMemo(() => {
    let results = products;

    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(lowercasedTerm) ||
        p.description.toLowerCase().includes(lowercasedTerm) ||
        (p.subcategory?.name.toLowerCase().includes(lowercasedTerm)) ||
        (p.subcategory?.category.name.toLowerCase().includes(lowercasedTerm))
      );
    }

    if (selectedFilter) {
      if (selectedFilter.type === 'category') {
        results = results.filter(p => p.subcategory?.category.id === selectedFilter.id);
      } else if (selectedFilter.type === 'subcategory') {
        results = results.filter(p => p.subcategory?.id === selectedFilter.id);
      } else if (selectedFilter.type === 'featured') {
        results = results.filter(p => p.isFeatured);
      }
    }

    return results;
  }, [products, searchTerm, selectedFilter]);


  const navigate = (targetPage: Page) => {
    setPage(targetPage);
    setSelectedProductId(null); // Reset product selection when changing main pages
    window.scrollTo(0, 0);
  };
  
  const viewProduct = (productId: string) => {
      setSelectedProductId(productId);
      window.scrollTo(0,0);
  }
  
  const goHome = () => {
    setSelectedProductId(null);
    setPage('home');
    window.scrollTo(0, 0);
  }
  
  const handleOrderPlaced = (orderId: string) => {
    setLastOrderId(orderId);
    setPage('orderConfirmation');
    window.scrollTo(0, 0);
  }

  const handleFilterSelect = (filter: { type: 'category' | 'subcategory' | 'featured', id: string } | null) => {
    if (selectedFilter?.id === filter?.id && selectedFilter?.type === filter?.type) {
        setSelectedFilter(null);
    } else {
        setSelectedFilter(filter);
    }
    // Scroll to product grid when a filter is selected to ensure user sees results
    setTimeout(() => {
        productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  const renderContent = () => {
    if (selectedProduct) {
        return <ProductDetailPage product={selectedProduct} onBack={goHome} openCart={() => setIsCartOpen(true)} />;
    }

    switch (page) {
      case 'terms':
        return <TermsOfService onBack={() => navigate('home')} />;
      case 'privacy':
        return <PrivacyPolicy onBack={() => navigate('home')} />;
      case 'contact':
        return <ContactPage onBack={() => navigate('home')} />;
      case 'about':
        return <AboutPage onBack={() => navigate('home')} />;
      case 'help':
        return <HelpPage onBack={() => navigate('home')} />;
      case 'checkout':
        return <CheckoutPage onBack={() => setIsCartOpen(true)} onOrderPlaced={handleOrderPlaced} />;
      case 'orderConfirmation':
        return (
            <div className="text-center py-20">
                <h1 className="text-3xl font-bold text-green-600">Thank You For Your Order!</h1>
                <p className="mt-4 text-lg">Your order ID is: <span className="font-mono bg-gray-100 p-1 rounded">{lastOrderId}</span></p>
                <p className="mt-2">We've received your order and will start working on it right away.</p>
                <button onClick={() => navigate('home')} className="mt-8 px-6 py-2 bg-brand-pink text-white rounded-lg">Continue Shopping</button>
            </div>
        );
      case 'home':
      default:
        return (
          <>
            <Hero />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-col md:flex-row gap-8">
                <Sidebar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedFilter={selectedFilter}
                  onFilterSelect={handleFilterSelect}
                />
                <main className="w-full md:w-3/4">
                  {/* Featured Products Section - Only show on home view with no filters/search */}
                  {!selectedFilter && !searchTerm.trim() && (
                      <FeaturedProducts products={featuredProducts} onViewProduct={viewProduct} />
                  )}

                  {/* Main Product Grid Header */}
                  <div ref={productGridRef} className="scroll-mt-36 flex justify-between items-center mb-8 flex-wrap gap-4">
                      <h2 className="text-3xl font-bold text-brand-text">
                        {currentFilterName}
                      </h2>
                      <span className="text-sm text-brand-light-text font-medium bg-gray-100 px-3 py-1 rounded-full">
                          {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                      </span>
                  </div>
                  <ProductGrid products={filteredProducts} onViewProduct={viewProduct} />
                </main>
              </div>
            </div>
          </>
        );
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Header setPage={navigate} toggleCart={() => setIsCartOpen(!isCartOpen)} goToAdmin={goToAdmin} goToAccount={goToAccount} session={session} />
      <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} goToCheckout={() => { setIsCartOpen(false); navigate('checkout'); }} />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer setPage={navigate} />
      <VoiceAIChatWidget openCart={() => setIsCartOpen(true)}/>
    </div>
  );
};

export default Storefront;
