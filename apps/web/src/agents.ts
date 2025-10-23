/**
 * Agent Definitions for AgenticDID.io Demo
 * 
 * Defines the types of AI agents available in the system and their permissions.
 * Each agent has:
 * - name: Display name
 * - role: Authorization role
 * - scopes: Specific permissions (OAuth-style scopes)
 * - icon: Visual representation
 * - color: UI theme color
 * - description: What the agent does
 * - isRogue: (optional) Indicates revoked credential
 * - isTrustedService: (optional) Marks as trusted service provider
 * 
 * Security Model:
 * - Agents must have matching role AND scope for actions
 * - Rogue agents always fail (simulates revocation)
 * - Trusted services (e.g., Amazon) have verified credentials
 */

export type AgentType = 'banker' | 'traveler' | 'shopper' | 'rogue';

export type Agent = {
  name: string;
  role: string;
  scopes: string[];
  icon: string;
  color: string;
  description: string;
  isRogue?: boolean;
  isTrustedService?: boolean;
};

export const AGENTS: Record<AgentType, Agent> = {
  banker: {
    name: 'Legit Banker Agent',
    role: 'Banker' as const,
    scopes: ['bank:transfer', 'bank:balance'],
    icon: '🏦',
    color: 'text-green-400',
    description: 'Authorized to perform banking operations',
  },
  traveler: {
    name: 'Legit Traveler Agent',
    role: 'Traveler' as const,
    scopes: ['travel:book', 'travel:cancel'],
    icon: '✈️',
    color: 'text-blue-400',
    description: 'Authorized to book and manage travel',
  },
  shopper: {
    name: 'Amazon Shopping Agent',
    role: 'Shopper' as const,
    scopes: ['shop:purchase', 'shop:cart'],
    icon: '📦',
    color: 'text-orange-400',
    description: 'Authorized Amazon agent for e-commerce purchases',
    isTrustedService: true,
  },
  rogue: {
    name: 'Rogue Agent',
    role: 'Banker' as const, // Claims to be Banker
    scopes: ['bank:transfer', 'admin:*'], // Suspicious scopes
    icon: '🚨',
    color: 'text-red-400',
    description: 'Unauthorized agent with revoked credentials',
    isRogue: true,
  },
};

export type Action = {
  id: string;
  label: string;
  requiredRole: string;
  requiredScope: string;
  icon: string;
};

export const ACTIONS: Action[] = [
  {
    id: 'transfer',
    label: 'Send $50',
    requiredRole: 'Banker',
    requiredScope: 'bank:transfer',
    icon: '💸',
  },
  {
    id: 'shop',
    label: 'Buy Headphones ($149)',
    requiredRole: 'Shopper',
    requiredScope: 'shop:purchase',
    icon: '🎧',
  },
  {
    id: 'flight',
    label: 'Book Flight',
    requiredRole: 'Traveler',
    requiredScope: 'travel:book',
    icon: '🛫',
  },
];
