/**
 * AI Studio Generated - Traveler Agent
 * Hotel Option Component with Star Rating
 */

import React from 'react';
import type { Hotel } from '../types';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-slate-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);


const HotelOption: React.FC<{ hotel: Hotel; onBook: (hotelId: string) => void }> = ({ hotel, onBook }) => {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden my-2 border border-slate-700 w-full max-w-md">
      <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <div className="flex justify-between items-start">
            <div>
                 <h3 className="font-bold text-lg text-slate-100">{hotel.name}</h3>
                 <StarRating rating={hotel.rating} />
            </div>
            <div className="text-right">
                <div className="text-xl font-bold text-green-400">${hotel.pricePerNight}</div>
                <div className="text-sm text-slate-400">/ night</div>
            </div>
        </div>
        <div className="mt-2">
            <p className="text-sm text-slate-300">{hotel.amenities.join(' · ')}</p>
        </div>
         <button
          onClick={() => onBook(hotel.id)}
          className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Book This Hotel
        </button>
      </div>
    </div>
  );
};

export default HotelOption;
