/**
 * AI Studio Generated - Banker Agent
 * Generated: October 23, 2025
 * Source: Google AI Studio (Gemini 2.5 Pro)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Role, AccountInfo, Transaction, AuditLogEntry, AuditStatus } from './types';
import { sendMessageToAI } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import { SendIcon, Spinner } from './components/Icons';
import { MOCK_TRANSACTIONS } from './constants';
import { GenerateContentResponse, FunctionCall } from '@google/genai';


const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: Role.MODEL, text: "Hello! I am Banker, your secure financial assistant. How can I help you today? You can ask me to check your balance, transfer funds, or show recent transactions.", timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [account, setAccount] = useState<AccountInfo>({
        id: 'acc_12345',
        maskedNumber: '**** **** **** 6789',
        balance: 2847.53
    });
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);


    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };


    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const addAuditLog = (operation: string, details: string, status: AuditStatus) => {
        setAuditLog(prev => [{ id: `log_${Date.now()}`, timestamp: new Date(), operation, details, status }, ...prev]);
    };


    const handleFunctionCall = useCallback(async (functionCall: FunctionCall): Promise<any> => {
        const { name, args } = functionCall;
        
        // Simulate ZKP verification
        const zkpMessage: Message = { role: Role.SYSTEM, text: 'Verifying identity with Zero-Knowledge Proof...', timestamp: new Date() };
        setMessages(prev => [...prev, zkpMessage]);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMessages(prev => prev.filter(m => m.text !== zkpMessage.text));


        switch (name) {
            case 'check_balance':
                addAuditLog('Check Balance', `Account: ${account.maskedNumber}`, AuditStatus.SUCCESS);
                return { balance: account.balance };
            case 'transfer_funds':
                const amount = args.amount as number;
                const recipient = args.recipient as string;
                if (account.balance >= amount) {
                    setAccount(prev => ({ ...prev, balance: prev.balance - amount }));
                    addAuditLog('Transfer Funds', `Amount: $${amount.toFixed(2)} to ${recipient}`, AuditStatus.SUCCESS);
                    return { success: true, newBalance: account.balance - amount };
                } else {
                    addAuditLog('Transfer Funds', `Amount: $${amount.toFixed(2)} to ${recipient}`, AuditStatus.FAILURE);
                    return { success: false, error: 'Insufficient funds.' };
                }
            case 'get_transaction_report':
                 addAuditLog('Transaction Report', `Generated report for ${account.maskedNumber}`, AuditStatus.SUCCESS);
                return { transactions: MOCK_TRANSACTIONS };
            default:
                addAuditLog('Unknown Operation', `Function: ${name}`, AuditStatus.FAILURE);
                return { error: `Unknown function: ${name}` };
        }
    }, [account]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;


        const userMessage: Message = { role: Role.USER, text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        addAuditLog('User Query', `"${input}"`, AuditStatus.PENDING);


        try {
            let response: GenerateContentResponse = await sendMessageToAI(input);
            
            if(response.functionCalls && response.functionCalls.length > 0) {
                 const fc = response.functionCalls[0];
                 const functionResult = await handleFunctionCall(fc);
                 
                 response = await sendMessageToAI(JSON.stringify({functionResponse: {
                    name: fc.name,
                    response: functionResult
                 }}));
            }


            const modelMessage: Message = { role: Role.MODEL, text: response.text, timestamp: new Date() };
            setMessages(prev => [...prev, modelMessage]);
            setAuditLog(prev => prev.map(log => log.details === `"${input}"` ? {...log, status: AuditStatus.SUCCESS} : log));


        } catch (error) {
            console.error(error);
            const errorMessage: Message = { role: Role.MODEL, text: "Sorry, I encountered an error. Please try again.", timestamp: new Date() };
            setMessages(prev => [...prev, errorMessage]);
            setAuditLog(prev => prev.map(log => log.details === `"${input}"` ? {...log, status: AuditStatus.FAILURE} : log));
        } finally {
            setIsLoading(false);
        }
    };
    
    const getStatusColor = (status: AuditStatus) => {
        switch(status) {
            case AuditStatus.SUCCESS: return 'text-green-400';
            case AuditStatus.FAILURE: return 'text-red-400';
            case AuditStatus.PENDING: return 'text-yellow-400';
        }
    }



    return (
        <div className="flex h-screen font-sans bg-gray-900 text-gray-100">
            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                <header className="p-4 border-b border-gray-700">
                    <h1 className="text-xl font-bold text-cyan-400">Banker Financial AI</h1>
                    <p className="text-sm text-gray-400">Your private and secure financial agent.</p>
                </header>


                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col gap-4">
                        {messages.map((msg, index) => {
                            if (msg.role === Role.SYSTEM) {
                                return (
                                <div key={index} className="flex justify-center items-center gap-2 p-2 my-2 text-sm text-yellow-400 bg-yellow-900/30 rounded-md">
                                    <Spinner />
                                    <span>{msg.text}</span>
                                </div>
                                )
                            }
                            return <ChatMessage key={index} message={msg} />
                        })}
                        {isLoading && messages[messages.length - 1].role === Role.USER && (
                             <div className="flex items-start gap-4 p-4">
                                <div className="flex-shrink-0">
                                   <div className="h-8 w-8 text-cyan-400 animate-pulse rounded-full bg-gray-700"></div>
                                </div>
                                <div className="flex-1 pt-1">
                                    <p className="font-bold text-sm">Banker</p>
                                    <div className="w-4 h-4 bg-gray-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>


                <div className="p-4 border-t border-gray-700">
                    <form onSubmit={handleSubmit} className="flex items-center bg-gray-800 rounded-lg p-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Banker something..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                             <SendIcon isDisabled={isLoading || !input.trim()} />
                        </button>
                    </form>
                </div>
            </main>


            {/* Right Sidebar */}
            <aside className="w-1/3 border-l border-gray-700 flex flex-col">
                {/* Account Details */}
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-cyan-400 mb-4">Account Overview</h2>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Account Number</p>
                        <p className="text-lg font-mono tracking-wider">{account.maskedNumber}</p>
                        <p className="text-sm text-gray-400 mt-4">Current Balance</p>
                        <p className="text-3xl font-bold text-green-400">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>


                {/* Audit Trail */}
                <div className="p-6 flex-1 flex flex-col overflow-hidden">
                    <h2 className="text-lg font-semibold text-cyan-400 mb-4">Cryptographic Audit Trail</h2>
                    <div className="flex-1 overflow-y-auto bg-gray-800 p-4 rounded-lg text-sm">
                        {auditLog.length === 0 ? (
                            <p className="text-gray-500">No operations logged yet.</p>
                        ) : (
                            auditLog.map(log => (
                                <div key={log.id} className="mb-3 pb-3 border-b border-gray-700 last:border-b-0">
                                    <div className="flex justify-between items-center">
                                       <span className={`font-bold ${getStatusColor(log.status)}`}>{log.operation}</span>
                                       <span className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-gray-400 font-mono text-xs truncate">{log.details}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
};


export default App;
