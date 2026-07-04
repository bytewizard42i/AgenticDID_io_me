/**
 * AI Studio Generated - Shopper Agent
 * Gemini Service with Function Calling for E-commerce
 */

import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const searchProductsFunctionDeclaration: FunctionDeclaration = {
  name: 'searchProducts',
  description: 'Searches for products based on a user query like "headphones under $150".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      products: {
        type: Type.ARRAY,
        description: 'An array of 2 to 4 products that match the query.',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'A unique product ID.' },
            name: { type: Type.STRING, description: 'The name of the product.' },
            price: { type: Type.NUMBER, description: 'The price of the product.' },
            description: { type: Type.STRING, description: 'A brief, compelling description of the product.' },
          },
          required: ['id', 'name', 'price', 'description'],
        },
      },
    },
    required: ['products'],
  },
};

const purchaseItemsFunctionDeclaration: FunctionDeclaration = {
  name: 'purchaseItems',
  description: 'Completes the purchase for items in the user\'s shopping cart.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: { type: Type.STRING, description: 'A unique order confirmation ID.' },
      message: { type: Type.STRING, description: 'A confirmation message for the user.' },
    },
    required: ['orderId', 'message'],
  },
};

const trackOrderFunctionDeclaration: FunctionDeclaration = {
    name: 'trackOrder',
    description: 'Provides a status update for a given order ID.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            orderId: { type: Type.STRING, description: 'The ID of the order to track.' },
            status: { type: Type.STRING, description: 'The current delivery status of the order.' },
        },
        required: ['orderId', 'status'],
    },
};


export const getShoppingResponse = async (prompt: string, chatHistory: { role: string, parts: { text: string }[] }[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [...chatHistory, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{
            functionDeclarations: [searchProductsFunctionDeclaration, purchaseItemsFunctionDeclaration, trackOrderFunctionDeclaration],
        }],
        systemInstruction: `You are "Shopper", a helpful and privacy-focused e-commerce AI agent.
- Your role is "commerce" and your capabilities are: searching products, comparing prices, adding items to cart, completing purchases, and tracking deliveries.
- When a user asks to buy something, use the searchProducts function.
- When a user wants to complete their purchase, use the purchaseItems function.
- When a user asks for an order update, use the trackOrder function.
- For general conversation, provide friendly, concise responses.
- Do not make up product details; always use the searchProducts function to get them.
- Be proactive. If a user asks to buy something, suggest some options.`,
      },
    });

    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      return { type: 'functionCall', data: functionCalls };
    }

    return { type: 'text', data: response.text };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { type: 'error', data: 'Sorry, I encountered an error. Please try again.' };
  }
};
