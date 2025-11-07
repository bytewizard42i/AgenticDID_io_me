/**
 * AI Studio Generated - Traveler Agent
 * Mock API for Flight and Hotel Searches & Bookings
 */

import type { Flight, Hotel, MockApiResponse } from '../types';

const generateFutureDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const mockFlights: Flight[] = [
    { id: 'FL123', airline: 'Gemini Airways', airlineLogo: '✈️', from: 'SFO', to: 'NYC', departureTime: '08:00', arrivalTime: '16:30', duration: '5h 30m', price: 350 },
    { id: 'FL456', airline: 'React Jet', airlineLogo: '🚀', from: 'SFO', to: 'NYC', departureTime: '10:15', arrivalTime: '18:45', duration: '5h 30m', price: 375 },
    { id: 'FL789', airline: 'Cloud Nine', airlineLogo: '☁️', from: 'SFO', to: 'NYC', departureTime: '13:00', arrivalTime: '21:30', duration: '5h 30m', price: 320 },
];

const mockHotels: Hotel[] = [
    { id: 'HTL1', name: 'The Binary Grand', rating: 5, pricePerNight: 450, amenities: ['Pool', 'Spa', 'Free WiFi'], imageUrl: 'https://picsum.photos/400/300?random=1' },
    { id: 'HTL2', name: 'Code & Comfort Inn', rating: 4, pricePerNight: 250, amenities: ['Gym', 'Breakfast Included'], imageUrl: 'https://picsum.photos/400/300?random=2' },
    { id: 'HTL3', name: 'The Array Apartments', rating: 4, pricePerNight: 180, amenities: ['Kitchenette', 'Free WiFi'], imageUrl: 'https://picsum.photos/400/300?random=3' },
];

export const search_flights = (args: { destination: string; origin: string; departure_date: string }): MockApiResponse => {
    console.log('Searching flights with args:', args);
    return mockFlights.map(f => ({ ...f, from: args.origin || 'SFO', to: args.destination || 'NYC' }));
};

export const search_hotels = (args: { location: string; check_in_date: string; check_out_date: string }): MockApiResponse => {
    console.log('Searching hotels with args:', args);
    return mockHotels.map(h => ({ ...h, name: `${h.name} in ${args.location}` }));
};

export const book_reservation = (args: { type: 'flight' | 'hotel'; id: string }): MockApiResponse => {
    console.log('Booking reservation with args:', args);
    if (args.type === 'flight') {
        const flight = mockFlights.find(f => f.id === args.id);
        if (flight) {
            return { success: true, bookingId: `BKF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, message: `Flight ${flight.id} booked successfully!` };
        }
    }
    if (args.type === 'hotel') {
        const hotel = mockHotels.find(h => h.id === args.id);
        if (hotel) {
            return { success: true, bookingId: `BKH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, message: `Hotel ${hotel.name} booked successfully!` };
        }
    }
    return { success: false, message: 'Booking failed. Item not found.' };
};

export const mockApi = {
    search_flights,
    search_hotels,
    book_reservation,
};
