
import React from 'react';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  goToCheckout: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ isOpen, onClose, goToCheckout }) => {
  // FIX: Destructure cart, products, and dispatchCartAction directly from useStore.
  const { products, cart, dispatchCartAction } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleRemove = (cartItemId: string) => {
    dispatchCartAction({ type: 'REMOVE_FROM_CART', payload: cartItemId });
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-30 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <header className="flex justify-between items-center p-6 border-b border-brand-border">
            <h2 className="text-2xl font-bold text-brand-text">Shopping Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
          </header>

          <div className="flex-grow overflow-y-auto p-6">
            {cart.length === 0 ? (
              <p className="text-center text-brand-light-text mt-10">Your cart is empty.</p>
            ) : (
              <ul className="space-y-4">
                {cart.map(item => (
                  <li key={item.cartItemId} className="flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex-shrink-0 w-24 h-24 border border-brand-border rounded-md overflow-hidden bg-gray-50">
                       <img src={products.find(p => p.id === item.productId)?.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-brand-text">{item.productName}</h3>
                      <p className="text-sm text-brand-light-text mb-1">Qty: {item.quantity}</p>
                      <div className="space-y-1 mt-2">
                        {Object.entries(item.customizations).map(([custId, value]) => {
                            const label = (products.find(p => p.id === item.productId)?.customizations || []).find(c => c.id === custId)?.name;
                            return (
                                <div key={custId} className="text-xs text-gray-600">
                                    <span className="font-medium text-gray-500">{label}: </span>
                                    {/* Use whitespace-pre-wrap to preserve newlines from multi-line inputs */}
                                    <span className="whitespace-pre-wrap block pl-2 border-l-2 border-gray-200 mt-1">{value}</span>
                                </div>
                            );
                        })}
                      </div>
                      <p className="font-bold text-brand-text mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button onClick={() => handleRemove(item.cartItemId)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {cart.length > 0 && (
             <footer className="p-6 border-t border-brand-border bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-brand-text">Subtotal</span>
                    <span className="text-xl font-bold text-brand-text">${subtotal.toFixed(2)}</span>
                </div>
                <Button onClick={goToCheckout} className="w-full text-lg py-3">Proceed to Checkout</Button>
            </footer>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPanel;
