/**
 * AI Studio Generated - Shopper Agent
 * Generated: October 23, 2025
 * Source: Google AI Studio (Gemini 2.5 Pro)
 * 
 * Analyzed for 127 seconds - Gus worked hard on this one!
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getShoppingResponse } from './services/geminiService';
import type { Message, Product, CartItem, Order } from './types';
import { OrderStatus } from './types';
import { UserIcon, AgentIcon, SendIcon, SecurityIcon, CheckIcon, LoadingSpinner } from './components/icons';
import ProductCard from './components/ProductCard';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    const addWelcomeMessage = () => {
        const welcomeMessage: Message = {
            id: 'welcome-message',
            role: 'agent',
            content: (
                <div className="flex flex-col gap-2">
                    <p>Hello! I'm Shopper, your private e-commerce agent.</p>
                    <p>You can ask me to find products, like "Buy headphones for $150", and I'll handle the rest securely.</p>
                </div>
            ),
            timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
    };
    addWelcomeMessage();
  }, []);

  const addMessage = useCallback((role: 'user' | 'agent', content: React.ReactNode) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    addMessage('agent', `Added "${product.name}" to your cart.`);
  };

  const handlePurchase = (orderId: string, confirmationMessage: string) => {
    if (cart.length === 0) {
      addMessage('agent', 'Your cart is empty. Add some items before purchasing!');
      return;
    }
    
    const securitySteps = [
      "Verifying purchase authorization...",
      "Spoofing queries to prevent tracking...",
      "Executing zero-knowledge proof of funds...",
      "Securing payment channel...",
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
        if (stepIndex < securitySteps.length) {
            const stepContent = (
                <div className="flex items-center gap-2 text-green-400">
                    <SecurityIcon className="w-5 h-5"/>
                    <span>{securitySteps[stepIndex]}</span>
                </div>
            );
            addMessage('agent', stepContent);
            stepIndex++;
        } else {
            clearInterval(interval);
            const newOrder: Order = {
                id: orderId,
                items: [...cart],
                total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
                status: OrderStatus.PLACED,
                date: new Date(),
            };
            setOrders(prev => [...prev, newOrder]);
            setCart([]);
            const finalContent = (
                <div className="flex items-center gap-2 text-green-300">
                    <CheckIcon className="w-5 h-5" />
                    <span>{confirmationMessage} Your order ID is <strong>{orderId}</strong>.</span>
                </div>
            );
            addMessage('agent', finalContent);
        }
    }, 1000);
  };
  
  const handleTrackOrder = (orderId: string, status: string) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            addMessage('agent', `Order ${orderId} status: ${status}.`);
        } else {
            addMessage('agent', `I couldn't find an order with the ID ${orderId}.`);
        }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessageContent = userInput;
    addMessage('user', userMessageContent);
    setUserInput('');
    setIsLoading(true);

    const chatHistory = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: typeof msg.content === 'string' ? msg.content : '[UI Component]' }]
    }));

    const response = await getShoppingResponse(userMessageContent, chatHistory);

    // FIX: Restructured the conditional logic to help TypeScript correctly narrow down the types.
    // Also, added iteration to handle multiple function calls, which was a bug in the original code.
    if (response.type === 'functionCall') {
        const calls = response.data;
        if (Array.isArray(calls)) {
          for (const call of calls) {
            if (call.name === 'searchProducts') {
                const { products } = call.args;
                const productCards = (
                    <div className="flex flex-col gap-4">
                        <p>I found a few options for you:</p>
                        {products.map((p: Product) => (
                            <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                        ))}
                    </div>
                );
                addMessage('agent', productCards);
            } else if (call.name === 'purchaseItems') {
                handlePurchase(call.args.orderId, call.args.message);
            } else if (call.name === 'trackOrder') {
                handleTrackOrder(call.args.orderId, call.args.status);
            }
          }
        }
    } else {
      // Both 'text' and 'error' types result in a string message for the user.
      addMessage('agent', response.data);
    }

    setIsLoading(false);
  };

  const renderMessageContent = (message: Message) => {
    const Icon = message.role === 'user' ? UserIcon : AgentIcon;
    const bgColor = message.role === 'user' ? 'bg-blue-600/30' : 'bg-gray-700/30';
    const alignment = message.role === 'user' ? 'justify-end' : 'justify-start';

    return (
        <div key={message.id} className={`flex items-start gap-3 my-4 ${alignment}`}>
            {message.role === 'agent' && <div className="p-2 bg-gray-800 rounded-full"><Icon className="w-6 h-6 text-cyan-400" /></div>}
            <div className={`max-w-xl p-4 rounded-lg text-white ${bgColor}`}>
                {message.content}
            </div>
            {message.role === 'user' && <div className="p-2 bg-gray-800 rounded-full"><Icon className="w-6 h-6 text-gray-300" /></div>}
        </div>
    );
  };
  
  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="flex-1 flex flex-col h-screen">
        <header className="bg-gray-800/50 border-b border-gray-700/50 p-4 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-center text-cyan-400">Shopper AI</h1>
          <p className="text-center text-sm text-gray-400">Your Private E-Commerce Agent</p>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
                {messages.map(renderMessageContent)}
                {isLoading && (
                    <div className="flex items-start gap-3 my-4 justify-start">
                        <div className="p-2 bg-gray-800 rounded-full"><AgentIcon className="w-6 h-6 text-cyan-400" /></div>
                        <div className="max-w-xl p-4 rounded-lg bg-gray-700/30 text-white flex items-center gap-3">
                            <LoadingSpinner />
                            <span>Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
        </div>
        <div className="p-4 bg-gray-800/50 border-t border-gray-700/50 backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask me to find a product..."
              className="flex-1 p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
              disabled={isLoading || !userInput.trim()}
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default App;
