/**
 * AI Studio Generated - Traveler Agent
 * Flight Option Component
 */

import React from 'react';
import type { Flight } from '../types';
import { PlaneIcon } from './icons';

interface FlightOptionProps {
  flight: Flight;
  onBook: (flightId: string) => void;
}

const FlightOption: React.FC<FlightOptionProps> = ({ flight, onBook }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 my-2 border border-slate-700 w-full max-w-md">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{flight.airlineLogo}</span>
          <span className="font-bold text-lg text-slate-100">{flight.airline}</span>
        </div>
        <div className="text-xl font-bold text-green-400">${flight.price}</div>
      </div>
      <div className="flex justify-between items-center text-slate-300">
        <div>
          <div className="text-sm text-slate-400">From</div>
          <div className="font-semibold text-lg">{flight.from}</div>
          <div className="text-sm">{flight.departureTime}</div>
        </div>
        <div className="flex-1 text-center px-2">
            <div className="text-sm text-slate-400">{flight.duration}</div>
            <div className="w-full bg-slate-600 rounded-full h-1 my-1 flex items-center">
                <div className="text-blue-400 -ml-1 text-lg">●</div>
                <div className="flex-1 border-t-2 border-dotted border-slate-500"></div>
                <div className="text-blue-400 -mr-1 text-lg">✈</div>
            </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">To</div>
          <div className="font-semibold text-lg">{flight.to}</div>
          <div className="text-sm">{flight.arrivalTime}</div>
        </div>
      </div>
       <button
          onClick={() => onBook(flight.id)}
          className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Book This Flight
        </button>
    </div>
  );
};

export default FlightOption;
