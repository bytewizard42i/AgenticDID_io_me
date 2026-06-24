/**
 * AI Studio Generated - Traveler Agent
 * Constants, System Instructions, and Function Declarations
 */

import { FunctionDeclaration, Type } from '@google/genai';

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const SYSTEM_INSTRUCTION = `You are "Traveler", a sophisticated AI travel agent.
Your capabilities include:
1.  Searching for flights and hotels.
2.  Comparing options to find the best deals.
3.  Making reservations upon user approval.
4.  Managing existing bookings.
5.  Handling cancellations.

Your required credentials are:
-   Role: "travel"
-   Scopes: "search:flights", "book:travel", "manage:reservations"

Security is your top priority. You must:
-   Always verify booking authorization before finalizing.
-   Protect personal information meticulously.
-   Maintain user privacy during all searches.
-   Inform the user that payment verification is handled securely (e.g., via ZKP), but do not process real payments.

Interaction flow:
When a user asks to book something, first search for options, then present them. Await user approval before proceeding to book. Always confirm actions like booking or cancellation. Be friendly, efficient, and clear in your communication.
`;

export const searchFlightsTool: FunctionDeclaration = {
    name: "search_flights",
    description: "Searches for available flights based on user criteria.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            destination: { type: Type.STRING, description: "The destination city or airport code, e.g., 'NYC', 'SFO'" },
            origin: { type: Type.STRING, description: "The origin city or airport code, e.g., 'LAX'" },
            departure_date: { type: Type.STRING, description: "The departure date in YYYY-MM-DD format." },
            return_date: { type: Type.STRING, description: "The return date in YYYY-MM-DD format (optional for one-way)." },
        },
        required: ["destination", "origin", "departure_date"],
    },
};

export const searchHotelsTool: FunctionDeclaration = {
    name: "search_hotels",
    description: "Searches for available hotels in a specific location.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            location: { type: Type.STRING, description: "The city or area to search for hotels, e.g., 'New York City'" },
            check_in_date: { type: Type.STRING, description: "The check-in date in YYYY-MM-DD format." },
            check_out_date: { type: Type.STRING, description: "The check-out date in YYYY-MM-DD format." },
            guests: { type: Type.INTEGER, description: "Number of guests." },
        },
        required: ["location", "check_in_date", "check_out_date", "guests"],
    },
};

export const bookReservationTool: FunctionDeclaration = {
    name: "book_reservation",
    description: "Books a selected flight or hotel for the user after they have approved it.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, description: "The type of booking, either 'flight' or 'hotel'." },
            id: { type: Type.STRING, description: "The ID of the flight or hotel to book." },
            passenger_details: { type: Type.OBJECT, description: "Details of the passenger(s) or guest(s)." },
        },
        required: ["type", "id", "passenger_details"],
    },
};

export const tools = [searchFlightsTool, searchHotelsTool, bookReservationTool];
