/**
 * AI Studio Generated - Traveler Agent
 * Gemini Service with Chat Session Creation
 */

import { GoogleGenAI, Chat } from '@google/genai';
import { GEMINI_MODEL, SYSTEM_INSTRUCTION, tools } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function createChatSession(): Chat {
    // FIX: Use `ai.chats.create` as `ai.models[...].createChat` is deprecated.
    return ai.chats.create({
        model: GEMINI_MODEL,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: tools }],
        }
    });
}
