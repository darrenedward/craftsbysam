import React, { useEffect, useRef, useState } from 'react';
import { logger } from '../../../utils/logger';

interface PayPalButtonsProps {
  amount: number;
  clientId: string;
  onSuccess: (details: any) => void;
  onError: (err: any) => void;
}

export const PayPalButtons: React.FC<PayPalButtonsProps> = ({
  amount,
  clientId,
  onSuccess,
  onError,
}) => {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (document.getElementById('paypal-sdk')) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=NZD`;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => onError("Failed to load PayPal SDK.");
    document.body.appendChild(script);

    return () => {
      // Optional: cleanup if needed, though usually keeping SDK loaded is fine
    };
  }, [clientId, onError]);

  useEffect(() => {
    if (scriptLoaded && buttonContainerRef.current && (window as any).paypal && !isInitialized) {
      // Use safe DOM methods instead of innerHTML
      while (buttonContainerRef.current.firstChild) {
        buttonContainerRef.current.removeChild(buttonContainerRef.current.firstChild);
      }

      (window as any).paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toFixed(2)
              }
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            onSuccess(details);
          });
        },
        onError: (err: any) => {
          logger.error("PayPal Error:", err);
          onError(err);
        }
      }).render(buttonContainerRef.current);

      setIsInitialized(true);
    }
  }, [scriptLoaded, amount, onSuccess, onError, isInitialized]);

  if (!scriptLoaded) return <div className="text-center text-gray-500 py-4">Loading secure payment...</div>;

  return <div ref={buttonContainerRef} className="mt-4 z-0 relative"></div>;
};
