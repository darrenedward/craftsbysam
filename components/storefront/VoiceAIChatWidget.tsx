
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../hooks/useStore';
import { getAiChatResponse } from '../../services/geminiService';
import { ChatMessage } from '../../types';

interface VoiceAIChatWidgetProps {
  openCart: () => void;
}

const MicIcon = ({ isListening }: { isListening: boolean }) => (
  <svg className={`w-6 h-6 ${isListening ? 'text-white' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
  </svg>
);

const ThinkingIcon = () => (
    <div className="w-6 h-6 flex justify-center items-center">
        <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s] mx-0.5"></div>
        <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
    </div>
);


const VoiceAIChatWidget: React.FC<VoiceAIChatWidgetProps> = ({ openCart }) => {
  const { products, dispatchCartAction, settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Don't render if settings aren't loaded or AI is disabled
  if (!settings || !settings.ai?.enabled) return null;

  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const hasApiKey = !!settings.ai?.apiKey;

  useEffect(() => {
    if (!isOpen || !isSupported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };

    recognitionRef.current.onresult = async (event: any) => {
      const userText = event.results[0][0].transcript;
      const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userText }];
      setMessages(newMessages);
      setIsThinking(true);

      const aiResponse = await getAiChatResponse(
          newMessages, 
          products, 
          settings.ai?.apiKey, 
          settings.ai?.model,
          settings.ai?.persona
      );
      
      if (aiResponse.functionCall?.name === 'addProductToCart') {
        const { productId, quantity, customizations } = aiResponse.functionCall.args;
        const product = products.find(p => p.id === productId);
        if (product) {
            const cartItem = {
                cartItemId: `cart${Date.now()}`,
                productId,
                productName: product.name,
                quantity,
                price: product.price,
                customizations,
            };
            dispatchCartAction({ type: 'ADD_TO_CART', payload: cartItem });
            const confirmationText = `OK! I've added ${quantity} ${product.name} to your cart.`;
            setMessages(prev => [...prev, { role: 'model', text: confirmationText }]);
            speak(confirmationText);
            setTimeout(openCart, 1500);
        } else {
             const errorText = "I'm sorry, I couldn't find that product to add to your cart.";
             setMessages(prev => [...prev, { role: 'model', text: errorText }]);
             speak(errorText);
        }
      } else {
         setMessages(prev => [...prev, { role: 'model', text: aiResponse.text }]);
         speak(aiResponse.text);
      }
      setIsThinking(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [isOpen, messages, products, dispatchCartAction, openCart, isSupported, settings, hasApiKey]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);
  
  useEffect(() => {
    // Initial Greeting or Error Check
    if (isOpen && messages.length === 0) {
        if (!hasApiKey) {
            setMessages([{ role: 'model', text: "⚠️ Setup Required: Please add your Gemini API Key in the Dashboard > Settings > AI Integration tab to use the assistant." }]);
        } else {
            const greeting = "Hi! I'm your voice shopping assistant. Tap the microphone and say something like 'Show me beer mugs'.";
            setMessages([{ role: 'model', text: greeting }]);
            speak(greeting);
        }
    }
  }, [isOpen, hasApiKey]);

  const speak = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };
  
  const handleMicClick = () => {
    if (!isSupported) {
        alert("Sorry, your browser doesn't support voice recognition.");
        return;
    }
    if (!hasApiKey) {
        alert("Please configure the AI API Key in settings first.");
        return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else if (!isThinking && !isSpeaking) {
      recognitionRef.current?.start();
    }
  };

  const getStatusText = () => {
      if (isListening) return "Listening...";
      if (isThinking) return "Thinking...";
      if (isSpeaking) return "Speaking...";
      return "Tap to Speak";
  };

  if (!isSupported) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-brand-pink text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-brand-dark-pink transition-colors"
        aria-label="Open AI Chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden border border-brand-border">
          <header className="bg-brand-pink text-white p-4 flex justify-between items-center shadow-sm">
            <span className="font-bold">AI Shopping Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
          </header>
          
          <div className="flex-grow p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                 {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                           msg.role === 'user' 
                           ? 'bg-brand-pink text-brand-text rounded-tr-none' 
                           : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                        }`}>
                            {msg.text}
                       </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-sm italic">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
          </div>

          <footer className="p-4 border-t bg-white flex flex-col justify-center items-center">
            <button
                onClick={handleMicClick}
                disabled={isSpeaking || isThinking || !hasApiKey}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isListening ? 'bg-red-500 animate-pulse ring-4 ring-red-200' : 'bg-brand-dark-pink'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
                {isThinking ? <ThinkingIcon /> : <MicIcon isListening={isListening} />}
            </button>
            <span className="text-xs text-gray-500 mt-2 font-medium min-h-[1rem]">
                {getStatusText()}
            </span>
          </footer>
        </div>
      )}
    </>
  );
};

export default VoiceAIChatWidget;
