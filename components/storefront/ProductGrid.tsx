import React from 'react';
import { Product } from '../../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onViewProduct: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onViewProduct }) => {
  if (products.length === 0) {
    return <p className="text-center text-brand-light-text">No products found.</p>;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map(product => (
        <ProductCard key={product.id} product={product} onViewProduct={onViewProduct} />
      ))}
    </div>
  );
};

export default ProductGrid;