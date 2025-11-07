/**
 * AI Studio Generated - Shopper Agent
 * Product Card Component
 */

import React from 'react';
import type { Product } from '../types';
import { CartIcon } from './icons';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-gray-700/50 rounded-lg overflow-hidden flex flex-col sm:flex-row max-w-lg w-full border border-gray-600/50">
      <img 
        src={`https://picsum.photos/seed/${product.id}/200/200`} 
        alt={product.name} 
        className="w-full h-40 sm:w-40 sm:h-auto object-cover"
      />
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-bold text-lg text-white">{product.name}</h3>
          <p className="text-sm text-gray-300 mt-1 mb-2 line-clamp-2">{product.description}</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xl font-semibold text-cyan-400">${product.price.toFixed(2)}</p>
          <button 
            onClick={() => onAddToCart(product)} 
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
          >
            <CartIcon className="w-5 h-5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
