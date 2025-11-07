/**
 * AI Studio Generated - Banker Agent
 * ChatMessage Component
 */

import React from 'react';
import { Message, Role } from '../types';
import { BankerIcon, UserIcon } from './Icons';


interface ChatMessageProps {
  message: Message;
}


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;


  return (
    <div className={`flex items-start gap-4 p-4 ${isUser ? '' : 'bg-gray-800/50'}`}>
      <div className="flex-shrink-0">
        {isUser ? <UserIcon /> : <BankerIcon />}
      </div>
      <div className="flex-1 pt-1">
        <p className="font-bold text-sm">
          {isUser ? 'You' : 'Banker'}
        </p>
        <p className="text-gray-300 whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};


export default ChatMessage;
