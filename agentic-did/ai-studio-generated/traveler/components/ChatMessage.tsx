/**
 * AI Studio Generated - Traveler Agent
 * Chat Message Component with Typing Indicator
 */

import React from 'react';
import type { DisplayMessage } from '../types';
import { UserIcon, BotIcon } from './icons';

const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
    </div>
);

const ChatMessage: React.FC<{ message: DisplayMessage }> = ({ message }) => {
    const isUser = message.role === 'user';

    const bubbleClasses = isUser
        ? 'bg-blue-600 text-white'
        : 'bg-slate-700 text-slate-200';

    const containerClasses = isUser
        ? 'justify-end'
        : 'justify-start';
    
    const avatar = isUser
        ? <div className="bg-slate-600 rounded-full p-2"><UserIcon /></div>
        : <div className="bg-blue-600 rounded-full p-2"><BotIcon /></div>;

    return (
        <div className={`flex items-start space-x-4 my-4 ${containerClasses}`}>
            {!isUser && avatar}
            <div className={`rounded-xl px-4 py-3 max-w-lg ${bubbleClasses}`}>
                 {message.isThinking ? <TypingIndicator /> : message.content}
            </div>
            {isUser && avatar}
        </div>
    );
};

export default ChatMessage;
