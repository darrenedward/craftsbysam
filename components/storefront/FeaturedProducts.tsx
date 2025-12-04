import React from 'react';
import { Product } from '../../types';
import ProductGrid from './ProductGrid';

interface FeaturedProductsProps {
  products: Product[];
  onViewProduct: (productId: string) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products, onViewProduct }) => {
  if (products.length === 0) {
    return null; // Don't render anything if there are no featured products
  }

  return (
    <div className="bg-pink-50 py-8 px-6 rounded-lg mb-12 border border-pink-100">
      <h2 className="text-2xl font-bold text-brand-text mb-6">
        Featured Products
      </h2>
      <ProductGrid products={products} onViewProduct={onViewProduct} />
    </div>
  );
};

export default FeaturedProducts;