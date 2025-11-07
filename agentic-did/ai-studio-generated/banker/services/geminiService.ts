/**
 * AI Studio Generated - Banker Agent
 * Gemini Service with Function Calling
 */

import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION, checkBalanceFunctionDeclaration, transferFundsFunctionDeclaration, getTransactionReportFunctionDeclaration } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat | null = null;

export const startChatSession = (): Chat => {
    if (chat) {
        return chat;
    }
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{
                functionDeclarations: [
                    checkBalanceFunctionDeclaration,
                    transferFundsFunctionDeclaration,
                    getTransactionReportFunctionDeclaration,
                ]
            }],
        },
    });
    return chat;
};

export const sendMessageToAI = async (message: string) => {
    const chatSession = startChatSession();
    const result = await chatSession.sendMessage({ message });
    return result;
};
