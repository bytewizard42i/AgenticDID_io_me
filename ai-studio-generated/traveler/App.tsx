/**
 * AI Studio Generated - Traveler Agent
 * Generated: October 23, 2025
 * Source: Google AI Studio (Gemini 2.5 Pro)
 * 
 * Analyzed for 73 seconds - Gemini Pro's thorough analysis!
 */

import { GenerateContentResponse, Chat } from '@google/genai';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import FlightOption from './components/FlightOption';
import HotelOption from './components/HotelOption';
import { createChatSession } from './services/geminiService';
import { mockApi } from './services/mockApi';
import type { DisplayMessage, MockApiResponse, Flight, Hotel } from './types';

const App: React.FC = () => {
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setChatSession(createChatSession());
        setMessages([
            {
                id: 'init',
                role: 'model',
                content: "Hello! I'm Traveler, your AI travel agent. How can I help you plan your next trip?",
            },
        ]);
    }, []);
    
    useEffect(() => {
        chatHistoryRef.current?.scrollTo({ top: chatHistoryRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);
    
    const handleBook = useCallback((type: 'flight' | 'hotel', id: string) => {
        const passengerDetails = { name: "Alex Doe", contact: "alex.doe@example.com" };
        const message = `Please book the ${type} with ID ${id} for ${passengerDetails.name}.`;
        handleSendMessage(message);
    }, []);

    const renderApiResponse = (response: MockApiResponse) => {
        if (Array.isArray(response)) {
            // Check if it's an array of flights or hotels
            if (response.length > 0 && 'airline' in response[0]) {
                 return (
                    <div className="flex flex-col items-start space-y-2">
                        {(response as Flight[]).map(flight => <FlightOption key={flight.id} flight={flight} onBook={(id) => handleBook('flight', id)} />)}
                    </div>
                );
            }
            if (response.length > 0 && 'pricePerNight' in response[0]) {
                 return (
                    <div className="flex flex-col items-start space-y-2">
                        {(response as Hotel[]).map(hotel => <HotelOption key={hotel.id} hotel={hotel} onBook={(id) => handleBook('hotel', id)}/>)}
                    </div>
                );
            }
        }
        return null;
    };

    const handleSendMessage = async (input: string) => {
        if (!chatSession) return;
        
        setIsLoading(true);
        const userMessage: DisplayMessage = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);

        try {
            // FIX: The `sendMessage` method expects an object with a `message` property.
            let response: GenerateContentResponse = await chatSession.sendMessage({ message: input });

            while (response.functionCalls && response.functionCalls.length > 0) {
                const functionCalls = response.functionCalls;

                // Add a "thinking" message from the bot
                const thinkingMessageContent = `Okay, I'm now calling the function: \`${functionCalls[0].name}\`...`;
                const thinkingMessageId = `${Date.now()}-thinking`;
                const thinkingMessage: DisplayMessage = { id: thinkingMessageId, role: 'model', content: thinkingMessageContent, isThinking: true };
                setMessages(prev => [...prev, thinkingMessage]);
                
                const call = functionCalls[0];
                const apiResponse = (mockApi as any)[call.name](call.args);

                // FIX: A function response should be sent as a `Part` within the `message` property.
                const modelResponse = await chatSession.sendMessage({
                    message: [{
                        functionResponse: {
                            name: call.name,
                            response: apiResponse,
                        },
                    }],
                });
                response = modelResponse;

                 // Update the "thinking" message with the final result
                setMessages(prev => prev.map(msg => msg.id === thinkingMessageId ? 
                    {...msg, isThinking: false, content: `Finished calling \`${call.name}\`. Here's what I found:`} : msg
                ));

                // Add message with rendered API response components
                const apiMessageContent = renderApiResponse(apiResponse);
                if (apiMessageContent) {
                    const apiMessage: DisplayMessage = {
                        id: `${Date.now()}-api`,
                        role: 'model',
                        content: apiMessageContent
                    };
                    setMessages(prev => [...prev, apiMessage]);
                }
            }

            const modelText = response.text;
            if (modelText) {
                const modelMessage: DisplayMessage = { id: Date.now().toString(), role: 'model', content: modelText };
                setMessages(prev => [...prev, modelMessage]);
            }

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: DisplayMessage = { id: Date.now().toString(), role: 'model', content: 'Sorry, something went wrong. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
            <header className="p-4 border-b border-slate-700 text-center bg-slate-800/50 backdrop-blur-sm">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Traveler</h1>
                <p className="text-sm text-slate-400">Your Personal AI Travel Agent</p>
            </header>
            <main ref={chatHistoryRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                 {isLoading && messages[messages.length-1].role === 'user' && (
                    <ChatMessage message={{id: 'loading', role: 'model', content: '', isThinking: true}}/>
                )}
            </main>
            <footer className="p-2 border-t border-slate-700 bg-slate-900">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </footer>
        </div>
    );
};

export default App;
