import React from 'react';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { useStore } from '../../hooks/useStore';

interface ProductCardProps {
  product: Product;
  onViewProduct: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewProduct }) => {
  // FIX: use 'dispatchCartAction' from the context, not 'dispatch'.
  const { dispatchCartAction } = useStore();
  const hasRequiredCustomizations = product.customizations?.some(c => c.required);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    const cartItem = {
      cartItemId: `cart${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.discountPrice ?? product.price,
      customizations: {}, // No customizations for quick add
    };
    // FIX: Call the correct dispatch function.
    dispatchCartAction({ type: 'ADD_TO_CART', payload: cartItem });
    // Consider adding a visual confirmation in a future update
  };

  return (
    <div 
        className="group relative flex flex-col bg-white border border-brand-border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        onClick={() => onViewProduct(product.id)}
    >
      <div className="aspect-w-1 aspect-h-1 bg-gray-200 overflow-hidden">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-center object-cover group-hover:opacity-80 transition-opacity" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-brand-text">
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
        </h3>
        <p className="mt-1 text-sm text-brand-light-text flex-grow">{product.description.substring(0, 60)}...</p>
        <div className="flex justify-between items-center mt-4">
            <div>
                {product.discountPrice ? (
                    <>
                        <p className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</p>
                        <p className="text-lg font-bold text-red-600">${product.discountPrice.toFixed(2)}</p>
                    </>
                ) : (
                    <p className="text-lg font-bold text-brand-text">${product.price.toFixed(2)}</p>
                )}
                {product.shippingCost && product.shippingCost > 0 && (
                    <p className="text-xs text-brand-light-text">+ ${product.shippingCost.toFixed(2)} shipping</p>
                )}
            </div>
            <div className="relative z-10">
                {hasRequiredCustomizations ? (
                    <div className="text-sm py-2 px-4 bg-gray-200 text-brand-text rounded-lg group-hover:bg-gray-300 transition-colors">
                        View Options
                    </div>
                ) : (
                    <Button 
                        variant="primary" 
                        className="text-sm py-2" 
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </Button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;