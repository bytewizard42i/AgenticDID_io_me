/**
 * AI Studio Generated Types
 * Generated: October 23, 2025
 * Source: Google AI Studio (Gemini 2.5 Pro)
 */

export interface Agent {
  did: string;
  name: string;
  role: 'finance' | 'commerce' | 'travel';
  scope: string[];
  description: string;
}


export type LogStatus = 'pending' | 'success' | 'error' | 'info' | 'loading';


export interface LogEntry {
  id: number;
  title: string;
  details: string;
  status: LogStatus;
}
