/**
 * AI Studio Generated - Traveler Agent
 * Chat Input Component
 */

import React, { useState } from 'react';
import { SendIcon } from './icons';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-4 p-4">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Traveler to book a flight or hotel..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded-full py-3 px-6 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
            >
                <SendIcon />
            </button>
        </form>
    );
};

export default ChatInput;
