
import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  openCart: () => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack, openCart }) => {
  const { dispatchCartAction } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customizationValues, setCustomizationValues] = useState<Record<string, string>>(() => {
    const initialValues: Record<string, string> = {};
    (product.customizations || []).forEach(cust => {
        if (cust.type === 'select') {
          initialValues[cust.id] = cust.options?.[0] || '';
        } else if (cust.type === 'color') {
          initialValues[cust.id] = '#000000'; // Default to black
        } else {
          initialValues[cust.id] = '';
        }
    });
    return initialValues;
  });

  const handleCustomizationChange = (id: string, value: string) => {
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    setCustomizationValues(prev => ({ ...prev, [id]: value }));
  };

  const handleLineChange = (custId: string, lineIndex: number, newValue: string, totalLines: number) => {
     if (errors[custId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[custId];
        return newErrors;
      });
    }

    setCustomizationValues(prev => {
        const currentVal = prev[custId] || '';
        // Split by newline to get current lines. Pad with empty strings if the array is too short.
        const lines = currentVal.split('\n');
        while(lines.length < totalLines) lines.push('');
        
        lines[lineIndex] = newValue;
        
        // Join them back up. We slice to totalLines to ensure we don't keep garbage data if config changed.
        return { ...prev, [custId]: lines.slice(0, totalLines).join('\n') };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    (product.customizations || []).forEach(cust => {
        // For text types (single or multi-line), check if the trimmed value is empty
        if (cust.required && !customizationValues[cust.id]?.replace(/\n/g, '').trim()) {
            newErrors[cust.id] = `${cust.name} is required.`;
        }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleAddToCart = () => {
    if (!validateForm()) {
        return;
    }
    const cartItem = {
      cartItemId: `cart${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.discountPrice ?? product.price,
      customizations: customizationValues,
    };
    dispatchCartAction({ type: 'ADD_TO_CART', payload: cartItem });
    openCart();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="mb-8 text-brand-pink hover:underline">&larr; Back to all products</button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <img src={product.imageUrl} alt={product.name} className="w-full rounded-lg shadow-lg object-cover aspect-square" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-brand-text">{product.name}</h1>
            <div className="flex items-baseline my-4">
                {product.discountPrice ? (
                    <>
                        <p className="text-2xl font-semibold text-red-600">${product.discountPrice.toFixed(2)}</p>
                        <p className="text-lg text-gray-500 line-through ml-3">${product.price.toFixed(2)}</p>
                    </>
                ) : (
                    <p className="text-2xl font-semibold text-brand-pink">${product.price.toFixed(2)}</p>
                )}
            </div>
            {product.shippingCost && product.shippingCost > 0 && (
                <p className="text-sm text-brand-light-text -mt-2 mb-4">
                    + ${product.shippingCost.toFixed(2)} shipping
                </p>
            )}
            <p className="text-brand-light-text leading-relaxed">{product.description}</p>
            
            <div className="mt-8 space-y-6">
                <h3 className="text-xl font-semibold text-brand-text border-b pb-2">Personalize Your Item</h3>
                {(product.customizations || []).map(cust => (
                    <div key={cust.id}>
                        <label className="block text-sm font-medium text-brand-light-text mb-1">
                            {cust.name} {cust.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {cust.type === 'select' && (
                            <select
                                value={customizationValues[cust.id]}
                                onChange={(e) => handleCustomizationChange(cust.id, e.target.value)}
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink sm:text-sm bg-white text-brand-text ${errors[cust.id] ? 'border-red-500' : 'border-brand-border'}`}
                            >
                                {cust.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        )}

                        {cust.type === 'text' && (
                            <div className="space-y-2">
                                {(cust.lineLengths || [cust.maxLength || 20]).map((maxLength, lineIdx, arr) => {
                                    const totalLines = arr.length;
                                    const currentFullValue = customizationValues[cust.id] || '';
                                    const lineValue = currentFullValue.split('\n')[lineIdx] || '';
                                    
                                    return (
                                        <div key={lineIdx} className="relative">
                                            {totalLines > 1 && <span className="text-xs text-gray-500 mb-0.5 block">Line {lineIdx + 1}</span>}
                                            <input 
                                                type="text"
                                                maxLength={maxLength}
                                                value={lineValue}
                                                onChange={(e) => handleLineChange(cust.id, lineIdx, e.target.value, totalLines)}
                                                required={cust.required && lineIdx === 0} // Only require first line technically, but validateForm handles full check
                                                placeholder={maxLength ? `Max ${maxLength} chars` : ''}
                                                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-pink sm:text-sm bg-white text-brand-text ${errors[cust.id] ? 'border-red-500' : 'border-brand-border'}`}
                                            />
                                            <p className="text-right text-xs text-brand-light-text mt-0.5" aria-live="polite">
                                                {lineValue.length} / {maxLength}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                         {cust.type === 'color' && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        id={`cust-color-${cust.id}`}
                                        value={customizationValues[cust.id]?.startsWith('#') ? customizationValues[cust.id] : '#000000'}
                                        onChange={(e) => handleCustomizationChange(cust.id, e.target.value)}
                                        className="p-0 h-10 w-12 rounded-md border-2 border-transparent cursor-pointer"
                                        aria-label={cust.name}
                                    />
                                    <input
                                        id={`cust-text-${cust.id}`}
                                        type="text"
                                        value={customizationValues[cust.id]}
                                        onChange={(e) => handleCustomizationChange(cust.id, e.target.value)}
                                        className="font-mono w-full block px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink sm:text-sm bg-white text-brand-text"
                                        placeholder="Hex Code or Color Name"
                                    />
                                </div>
                                <div className="text-xs text-orange-800 bg-orange-50 p-2 rounded border border-orange-100">
                                    <strong>Note:</strong> Not all colors are available. We do our best to choose the color closest to your choice, but shades may vary. If you need an exact color match, please contact us before placing your order.
                                </div>
                            </div>
                        )}
                        {cust.helperText && <p className="text-xs text-gray-500 mt-1">{cust.helperText}</p>}
                        {errors[cust.id] && <p className="text-red-500 text-xs mt-1">{errors[cust.id]}</p>}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
                <label htmlFor="quantity" className="font-semibold text-brand-text">Quantity:</label>
                <input 
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                    className="w-20 block px-3 py-2 border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-brand-pink sm:text-sm bg-white text-brand-text"
                />
            </div>
            
            <div className="mt-8">
                <Button onClick={handleAddToCart} className="w-full text-lg py-3">Add to Cart</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
