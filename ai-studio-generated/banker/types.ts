/**
 * AI Studio Generated - Banker Agent
 * Type Definitions
 */

export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export interface Message {
  role: Role;
  text: string;
  timestamp: Date;
}

export interface AccountInfo {
  id: string;
  maskedNumber: string;
  balance: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

export enum AuditStatus {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    PENDING = 'PENDING',
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  operation: string;
  details: string;
  status: AuditStatus;
}
