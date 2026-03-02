/**
 * Agent Definitions for AgenticDID.io Demo
 * 
 * Updated to match REAL-DEAL naming conventions and structure.
 * 
 * NAMING CONVENTION:
 * - Registered Agents use RA- prefix (though not shown in UI)
 * - Organized by role: LOCAL_AGENT, ISSUER_AGENT, TASK_AGENT
 * - Stanford demonstrates multi-issuer architecture (3 separate agents)
 * 
 * Each agent has:
 * - name: Display name
 * - role: Authorization role
 * - scopes: Specific permissions (OAuth-style scopes)
 * - icon: Visual representation
 * - color: UI theme color
 * - description: What the agent does
 * - category: Agent category (local, issuer, task)
 * - isRogue: (optional) Indicates revoked credential
 * - isTrustedService: (optional) Marks as trusted service provider
 * 
 * Security Model:
 * - Agents must have matching role AND scope for actions
 * - Rogue agents always fail (simulates revocation)
 * - Trusted services have verified credentials
 */

export type AgentType = 
  | 'comet'
  | 'agenticdid_agent'
  | 'bank_agent'
  | 'cex_agent'
  | 'amazon_agent'
  | 'airline_agent'
  | 'voting_agent'
  | 'doctors_office_agent'
  | 'stanford_hospital_agent'
  | 'stanford_ivf_agent'
  | 'stanford_college_agent'
  | 'blue_cross_agent'
  | 'medical_records_agent'
  | 'rogue';

export type Agent = {
  name: string;
  role: string;
  scopes: string[];
  icon: string;
  color: string;
  description: string;
  category: 'local' | 'issuer' | 'task';
  isRogue?: boolean;
  isTrustedService?: boolean;
  issuerType?: 'CORPORATION' | 'GOVERNMENT' | 'INSTITUTION';
};

export const AGENTS: Record<AgentType, Agent> = {
  // LOCAL AGENT
  comet: {
    name: 'Comet (Local User Agent)',
    role: 'LOCAL_AGENT' as const,
    scopes: ['*'], // Local agent has full user permissions
    icon: '☄️',
    color: 'text-purple-400',
    description: 'Your personal AI assistant running on your device',
    category: 'local',
  },

  // ISSUER AGENT
  agenticdid_agent: {
    name: 'AgenticDID Protocol Agent',
    role: 'ISSUER_AGENT' as const,
    scopes: ['issuer:kyc', 'issuer:verify', 'issuer:issue'],
    icon: '🔮',
    color: 'text-indigo-400',
    description: 'AgenticDID Foundation - REGULATED_ENTITY credential issuer',
    category: 'issuer',
    issuerType: 'CORPORATION',
  },

  // TASK AGENTS - Financial
  bank_agent: {
    name: 'Bank of America Agent',
    role: 'TASK_AGENT' as const,
    scopes: ['bank:transfer', 'bank:balance', 'bank:statements'],
    icon: '👋🏦🤚',
    color: 'text-green-400',
    description: 'Traditional banking - REGULATED_ENTITY verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'CORPORATION',
  },

  cex_agent: {
    name: 'Crypto Exchange Agent',
    role: 'TASK_AGENT' as const,
    scopes: ['crypto:trade', 'crypto:balance', 'crypto:withdraw'],
    icon: '👋₿🤚',
    color: 'text-yellow-400',
    description: 'Cryptocurrency exchange - REGULATED_ENTITY verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'CORPORATION',
  },

  // TASK AGENTS - E-Commerce
  amazon_agent: {
    name: 'Amazon Shopping & Delivery Agent',
    role: 'TASK_AGENT' as const,
    scopes: ['shop:purchase', 'shop:cart', 'shop:track'],
    icon: '👋📦🤚',
    color: 'text-orange-400',
    description: 'E-commerce marketplace - REGULATED_ENTITY verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'CORPORATION',
  },

  // TASK AGENTS - Travel
  airline_agent: {
    name: 'Airline Travel Services Agent',
    role: 'TASK_AGENT' as const,
    scopes: ['travel:book', 'travel:cancel', 'travel:checkin'],
    icon: '👋✈️🤚',
    color: 'text-blue-400',
    description: 'Flight booking & travel - REGULATED_ENTITY verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'CORPORATION',
  },

  // TASK AGENTS - Government
  voting_agent: {
    name: 'Ecuadorian Election Authority Agent',
    role: 'TASK_AGENT' as const,
    scopes: ['voting:register', 'voting:cast', 'voting:verify'],
    icon: '👋🗳️🤚',
    color: 'text-teal-400',
    description: 'Government voting services - SYSTEM_CRITICAL verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'GOVERNMENT',
  },

  // TASK AGENTS - Healthcare (Primary Care)
  doctors_office_agent: {
    name: "Doctor's Office Agent",
    role: 'TASK_AGENT' as const,
    scopes: ['medical:appointment', 'medical:prescription', 'medical:records'],
    icon: '👋👨‍⚕️🤚',
    color: 'text-cyan-400',
    description: 'Primary care medical services - REGULATED_ENTITY verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'INSTITUTION',
  },

  // TASK AGENTS - Stanford Multi-Issuer Architecture
  stanford_hospital_agent: {
    name: 'Stanford Hospital Agent',
    role: 'TASK_AGENT' as const,
    scopes: ['hospital:admit', 'hospital:surgery', 'hospital:emergency', 'hospital:records'],
    icon: '👋🏥🤚',
    color: 'text-red-400',
    description: 'Acute care hospital - REGULATED_ENTITY verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'INSTITUTION',
  },

  stanford_ivf_agent: {
    name: 'Stanford IVF Research Center Agent',
    role: 'TASK_AGENT' as const,
    scopes: ['ivf:consultation', 'ivf:treatment', 'ivf:embryo', 'ivf:pregnancy'],
    icon: '👋🤰🤚',
    color: 'text-pink-400',
    description: 'Specialized fertility care - REGULATED_ENTITY verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'INSTITUTION',
  },

  stanford_college_agent: {
    name: 'Stanford University Agent',
    role: 'TASK_AGENT' as const,
    scopes: ['education:transcript', 'education:enroll', 'education:degree', 'research:lab'],
    icon: '👋🎓🤚',
    color: 'text-amber-400',
    description: 'Academic credentials & research - REGULATED_ENTITY verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'INSTITUTION',
  },

  // TASK AGENTS - Health Insurance
  blue_cross_agent: {
    name: 'Blue Cross Blue Shield Agent',
    role: 'TASK_AGENT' as const,
    scopes: ['insurance:coverage', 'insurance:claim', 'insurance:benefit'],
    icon: '👋💙🤚',
    color: 'text-blue-600',
    description: 'Health insurance - REGULATED_ENTITY verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'CORPORATION',
  },

  // TASK AGENTS - Medical Records Coordination
  medical_records_agent: {
    name: 'Blue Cross Medical Records Agent',
    role: 'TASK_AGENT' as const,
    scopes: ['records:aggregate', 'records:consent', 'records:share'],
    icon: '👋📋🤚',
    color: 'text-slate-400',
    description: 'Medical records coordination - REGULATED_ENTITY verifier',
    category: 'task',
    isTrustedService: true,
    issuerType: 'CORPORATION',
  },

  // ROGUE AGENT (for demo purposes)
  rogue: {
    name: 'Rogue Agent (Revoked)',
    role: 'TASK_AGENT' as const,
    scopes: ['bank:transfer', 'admin:*'], // Suspicious scopes
    icon: '🚨',
    color: 'text-red-600',
    description: 'Unauthorized agent with revoked credentials',
    category: 'task',
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
  // Financial Actions
  {
    id: 'bank_transfer',
    label: 'Send $50 (Bank)',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'bank:transfer',
    icon: '💸',
  },
  {
    id: 'crypto_trade',
    label: 'Buy 0.01 BTC',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'crypto:trade',
    icon: '₿',
  },
  
  // E-Commerce Actions
  {
    id: 'amazon_shop',
    label: 'Buy Headphones ($149)',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'shop:purchase',
    icon: '🎧',
  },
  
  // Travel Actions
  {
    id: 'book_flight',
    label: 'Book Flight to NYC',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'travel:book',
    icon: '🛫',
  },
  
  // Government Actions
  {
    id: 'register_vote',
    label: 'Register to Vote',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'voting:register',
    icon: '📝',
  },
  {
    id: 'cast_ballot',
    label: 'Cast Ballot',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'voting:cast',
    icon: '🗳️',
  },
  
  // Healthcare Actions
  {
    id: 'book_appointment',
    label: 'Book Doctor Appointment',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'medical:appointment',
    icon: '🩺',
  },
  {
    id: 'hospital_admit',
    label: 'Hospital Admission',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'hospital:admit',
    icon: '🏥',
  },
  {
    id: 'ivf_consultation',
    label: 'Schedule IVF Consultation',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'ivf:consultation',
    icon: '🤰',
  },
  
  // Education Actions
  {
    id: 'view_transcript',
    label: 'View Transcript',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'education:transcript',
    icon: '📜',
  },
  {
    id: 'enroll_course',
    label: 'My Diplomas and Certificates',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'education:enroll',
    icon: '📚',
  },
  
  // Insurance Actions
  {
    id: 'check_coverage',
    label: 'Check Insurance Coverage',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'insurance:coverage',
    icon: '💙',
  },
  {
    id: 'aggregate_records',
    label: 'Interact with Your Medical Records',
    requiredRole: 'TASK_AGENT',
    requiredScope: 'records:aggregate',
    icon: '📋',
  },
];

/**
 * Workflow Mapping: Action → Agent → TI
 * Maps each action to its required agent and corresponding trusted issuer
 */
export const WORKFLOW_MAPPING: Record<string, { agentKey: AgentType; tiKey: AgentType }> = {
  // Financial Actions - Banking
  'bank_transfer': { agentKey: 'bank_agent', tiKey: 'bank_agent' },
  
  // Financial Actions - Crypto
  'crypto_trade': { agentKey: 'cex_agent', tiKey: 'cex_agent' },
  
  // E-commerce Actions
  'amazon_shop': { agentKey: 'amazon_agent', tiKey: 'amazon_agent' },
  
  // Travel Actions
  'book_flight': { agentKey: 'airline_agent', tiKey: 'airline_agent' },
  
  // Government Actions - Voting
  'register_vote': { agentKey: 'voting_agent', tiKey: 'voting_agent' },
  'cast_ballot': { agentKey: 'voting_agent', tiKey: 'voting_agent' },
  
  // Healthcare Actions - Doctor
  'book_appointment': { agentKey: 'doctors_office_agent', tiKey: 'doctors_office_agent' },
  
  // Healthcare Actions - Hospital
  'hospital_admit': { agentKey: 'stanford_hospital_agent', tiKey: 'stanford_hospital_agent' },
  
  // Healthcare Actions - IVF
  'ivf_consultation': { agentKey: 'stanford_ivf_agent', tiKey: 'stanford_ivf_agent' },
  
  // Education Actions
  'view_transcript': { agentKey: 'stanford_college_agent', tiKey: 'stanford_college_agent' },
  'enroll_course': { agentKey: 'stanford_college_agent', tiKey: 'stanford_college_agent' },
  
  // Insurance Actions
  'check_coverage': { agentKey: 'blue_cross_agent', tiKey: 'blue_cross_agent' },
  
  // Medical Records Actions
  'aggregate_records': { agentKey: 'medical_records_agent', tiKey: 'medical_records_agent' },
};
