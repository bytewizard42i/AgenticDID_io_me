/**
 * AI Studio Generated - Gemini Service
 * Generated: October 23, 2025
 * Source: Google AI Studio (Gemini 2.5 Pro)
 * 
 * This service uses Google's Gemini API to analyze user intent
 * and intelligently select the appropriate agent.
 * 
 * KEY HACKATHON FEATURE: Demonstrates Gemini AI integration!
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Agent } from '../types';


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


const responseSchema = {
  type: Type.OBJECT,
  properties: {
    selectedAgentId: {
      type: Type.STRING,
      description: "The 'did' of the most appropriate agent from the provided list.",
    },
    reason: {
      type: Type.STRING,
      description: "A brief, one-sentence explanation for why this agent was selected.",
    },
  },
  required: ['selectedAgentId', 'reason'],
};


export const analyzeIntent = async (userInput: string, agents: Agent[]): Promise<{ selectedAgentId: string; reason: string }> => {
  const prompt = `
    You are an AI agent orchestrator named Comet. Your task is to analyze a user's request and select the most appropriate specialist agent from a given list.


    The user's request is: "${userInput}"


    Here is the list of available agents in JSON format:
    ${JSON.stringify(agents.map(a => ({ did: a.did, name: a.name, role: a.role, scope: a.scope, description: a.description })), null, 2)}


    Based on the user's request and the agents' roles and scopes, determine the best agent for the task.


    Respond ONLY with a valid JSON object that adheres to the provided schema. Do not include any other text, markdown formatting, or explanations.
  `;


  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });


    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);


    // Validate if the selected agent exists
    if (!agents.some(agent => agent.did === result.selectedAgentId)) {
        throw new Error("Gemini selected an agent that does not exist in the provided list.");
    }


    return result;


  } catch (error) {
    console.error("Error analyzing intent with Gemini:", error);
    throw new Error("Failed to analyze user intent. Please check your API key and network connection.");
  }
};
