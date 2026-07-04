/**
 * AI Studio Generated - Traveler Agent
 * Type Definitions
 */

import type { ReactNode } from 'react';

export interface DisplayMessage {
  id: string;
  role: 'user' | 'model';
  content: ReactNode;
  isThinking?: boolean;
}

export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  imageUrl: string;
}

export type MockApiResponse = Flight[] | Hotel[] | { success: boolean; bookingId?: string; message: string };
