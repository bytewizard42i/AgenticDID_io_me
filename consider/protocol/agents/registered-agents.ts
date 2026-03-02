/**
 * Registered Agents Registry
 * 
 * All registered agents in the AgenticDID protocol.
 * Agents are turned OFF until their corresponding issuer and workflows are implemented.
 * 
 * Matches the demo UI structure.
 */

import type { AgentRole } from '../../backend/midnight/src/types.js';
import { AGENTICDID_ISSUER_AGENT_0_DID, CANONICAL_AGENT_101_DID } from '../../backend/shared/src/canonical-ids.js';
import {
  BANK_ISSUER_DID,
  AMAZON_ISSUER_DID,
  AIRLINE_ISSUER_DID,
  ECUADORIAN_VOTING_ISSUER_DID,
  DOCTORS_OFFICE_ISSUER_DID,
  STANFORD_ISSUER_DID,
  BLUE_CROSS_ISSUER_DID,
  HOSPITAL_ISSUER_DID,
} from '../issuers/index.js';

export interface RegisteredAgentConfig {
  agentDid: string;
  agentId: string;
  agentHumanName: string;
  role: AgentRole;
  parentIssuerDid?: string;
  description: string;
  capabilities: string[];
  requiredCredentials?: string[];
  isSystemAgent: boolean;
  isActive: boolean;
  metadata: {
    icon?: string;
    color?: string;
    category?: string;
  };
}

/**
 * LOCAL AGENT: Comet (canonical_agent_101)
 * 
 * User's personal AI assistant - ACTIVE
 */
export const COMET_AGENT_CONFIG: RegisteredAgentConfig = {
  agentDid: CANONICAL_AGENT_101_DID,
  agentId: 'canonical_agent_101',
  agentHumanName: 'Comet',
  role: 'LOCAL_AGENT',
  description: "Your personal AI assistant and the voice of AgenticDID. Comet manages your credentials, delegates to task agents, and narrates your journey.",
  capabilities: [
    'credential_management',
    'proof_generation',
    'task_delegation',
    'user_interaction',
    'narration',
  ],
  isSystemAgent: false,
  isActive: true,  // ✅ ACTIVE
  metadata: {
    icon: '☄️',
    color: '#4A90E2',
    category: 'personal',
  },
};

/**
 * ISSUER AGENT: agenticdid_agent (AgenticDID Issuer Agent)
 * 
 * Canonical issuer agent - ACTIVE (will be implemented next)
 */
export const AGENTICDID_AGENT_CONFIG: RegisteredAgentConfig = {
  agentDid: AGENTICDID_ISSUER_AGENT_0_DID,
  agentId: 'agenticdid_agent',
  agentHumanName: 'AgenticDID Issuer Agent',
  role: 'ISSUER_AGENT',
  parentIssuerDid: 'did:agentic:trusted_issuer_0',
  description: 'Canonical issuer agent for AgenticDID Foundation. Handles KYC workflows and credential issuance.',
  capabilities: [
    'kyc_tier_1',
    'kyc_tier_2',
    'credential_issuance',
    'did_creation',
    'revocation',
  ],
  isSystemAgent: true,
  isActive: false,  // 🔜 Turn ON when implementing
  metadata: {
    icon: '🏛️',
    color: '#2ECC71',
    category: 'system',
  },
};

/**
 * BANK AGENT
 * 
 * Financial services agent - INACTIVE
 */
export const BANK_AGENT_CONFIG: RegisteredAgentConfig = {
  agentDid: 'did:agentic:bank_agent',
  agentId: 'bank_agent',
  agentHumanName: 'Bank Agent',
  role: 'TASK_AGENT',
  parentIssuerDid: BANK_ISSUER_DID,
  description: 'Banking services agent for account management, transfers, and financial operations.',
  capabilities: [
    'account_balance',
    'transfer_funds',
    'transaction_history',
    'bill_payment',
    'loan_application',
  ],
  requiredCredentials: ['KYC_TIER_3', 'FINANCIAL_ACCOUNT'],
  isSystemAgent: false,
  isActive: false,  // ❌ OFF until Bank issuer implemented
  metadata: {
    icon: '🏦',
    color: '#3498DB',
    category: 'financial',
  },
};

/**
 * AMAZON AGENT
 * 
 * E-commerce shopping agent - INACTIVE
 */
export const AMAZON_AGENT_CONFIG: RegisteredAgentConfig = {
  agentDid: 'did:agentic:amazon_agent',
  agentId: 'amazon_agent',
  agentHumanName: 'Amazon Agent',
  role: 'TASK_AGENT',
  parentIssuerDid: AMAZON_ISSUER_DID,
  description: 'Shopping agent for Amazon purchases, order tracking, and product recommendations.',
  capabilities: [
    'search_products',
    'place_order',
    'track_shipment',
    'manage_cart',
    'product_recommendations',
  ],
  requiredCredentials: ['KYC_TIER_1', 'SHIPPING_ADDRESS_VERIFIED'],
  isSystemAgent: false,
  isActive: false,  // ❌ OFF until Amazon issuer implemented
  metadata: {
    icon: '📦',
    color: '#FF9900',
    category: 'shopping',
  },
};

/**
 * AIRLINE AGENT
 * 
 * Travel booking agent - INACTIVE
 */
export const AIRLINE_AGENT_CONFIG: RegisteredAgentConfig = {
  agentDid: 'did:agentic:airline_agent',
  agentId: 'airline_agent',
  agentHumanName: 'Airline Agent',
  role: 'TASK_AGENT',
  parentIssuerDid: AIRLINE_ISSUER_DID,
  description: 'Travel agent for flight bookings, check-in, and frequent flyer management.',
  capabilities: [
    'search_flights',
    'book_ticket',
    'check_in',
    'manage_mileage',
    'upgrade_seat',
  ],
  requiredCredentials: ['KYC_TIER_2', 'IDENTITY_VERIFIED'],
  isSystemAgent: false,
  isActive: false,  // ❌ OFF until Airline issuer implemented
  metadata: {
    icon: '✈️',
    color: '#9B59B6',
    category: 'travel',
  },
};

/**
 * GOVERNMENT VOTING AGENT
 * 
 * Voting and election agent - INACTIVE
 */
export const VOTING_AGENT_CONFIG: RegisteredAgentConfig = {
  agentDid: 'did:agentic:voting_agent',
  agentId: 'voting_agent',
  agentHumanName: 'Government Voting Agent',
  role: 'TASK_AGENT',
  parentIssuerDid: ECUADORIAN_VOTING_ISSUER_DID,
  description: 'Government voting agent for voter registration, ballot casting, and election information.',
  capabilities: [
    'voter_registration',
    'cast_ballot',
    'election_info',
    'verify_eligibility',
    'polling_location',
  ],
  requiredCredentials: ['KYC_TIER_3', 'VOTER_ELIGIBILITY', 'CITIZENSHIP_VERIFIED'],
  isSystemAgent: false,
  isActive: false,  // ❌ OFF until Voting issuer implemented
  metadata: {
    icon: '🗳️',
    color: '#E74C3C',
    category: 'government',
  },
};

/**
 * DOCTOR'S OFFICE AGENT
 * 
 * Primary care medical agent - INACTIVE
 */
export const DOCTORS_OFFICE_AGENT_CONFIG: RegisteredAgentConfig = {
  agentDid: 'did:agentic:doctors_office_agent',
  agentId: 'doctors_office_agent',
  agentHumanName: "Doctor's Office Agent",
  role: 'TASK_AGENT',
  parentIssuerDid: DOCTORS_OFFICE_ISSUER_DID,
  description: "Primary care agent for doctor's appointments, prescriptions, and basic medical services.",
  capabilities: [
    'book_appointment',
    'view_appointment_history',
    'prescription_refill',
    'physical_exam_results',
    'referral_management',
  ],
  requiredCredentials: ['KYC_TIER_1', 'IDENTITY_VERIFIED'],
  isSystemAgent: false,
  isActive: false,  // ❌ OFF until Doctor's Office issuer implemented
  metadata: {
    icon: '👨‍⚕️',
    color: '#3498DB',
    category: 'healthcare',
  },
};

/**
 * STANFORD AGENT
 * 
 * Multi-domain academic agent - INACTIVE
 */
export const STANFORD_AGENT_CONFIG: RegisteredAgentConfig = {
  agentDid: 'did:agentic:stanford_agent',
  agentId: 'stanford_agent',
  agentHumanName: 'Stanford Agent',
  role: 'TASK_AGENT',
  parentIssuerDid: STANFORD_ISSUER_DID,
  description: 'Multi-domain agent for Stanford University. Handles student records, research credentials, and medical services from Stanford Medicine.',
  capabilities: [
    // Educational
    'view_transcript',
    'degree_verification',
    'enrollment_status',
    'course_registration',
    
    // Research
    'publication_access',
    'research_grants',
    'lab_access',
    
    // Medical (Stanford Medicine)
    'view_medical_records',
    'book_appointment',
    'prescription_refill',
    'lab_results',
  ],
  requiredCredentials: ['KYC_TIER_1', 'IDENTITY_VERIFIED'],
  isSystemAgent: false,
  isActive: false,  // ❌ OFF until Stanford issuer implemented
  metadata: {
    icon: '🎓',
    color: '#8C1515',  // Stanford Cardinal red
    category: 'academic',
  },
};

// Import Medical Records Agent
import { MEDICAL_RECORDS_AGENT_CONFIG } from './medical-records-agent.js';

/**
 * Blue Cross Agent Configuration
 */
export const BLUE_CROSS_AGENT_CONFIG: RegisteredAgentConfig = {
  agentDid: 'did:agentic:blue_cross_agent',
  agentId: 'blue_cross_agent',
  agentHumanName: 'Blue Cross Agent',
  role: 'TASK_AGENT',
  parentIssuerDid: BLUE_CROSS_ISSUER_DID,
  description: 'Health insurance agent for Blue Cross Blue Shield. Handles coverage verification, claims, and provider network information.',
  capabilities: [
    'check_coverage',
    'verify_benefits',
    'submit_claim',
    'track_claim_status',
    'find_in_network_provider',
    'get_cost_estimate',
    'view_coverage_details',
    'manage_prescription_coverage',
  ],
  requiredCredentials: ['KYC_TIER_1', 'INSURANCE_COVERAGE'],
  isSystemAgent: false,
  isActive: false,  // ❌ OFF until Blue Cross issuer implemented
  metadata: {
    icon: '🏥💙',
    color: '#003087',  // Blue Cross blue
    category: 'health_insurance',
  },
};

/**
 * All Registered Agents
 */
export const ALL_REGISTERED_AGENTS = [
  COMET_AGENT_CONFIG,             // ✅ ACTIVE (local agent)
  AGENTICDID_AGENT_CONFIG,        // 🔜 Next to implement
  BANK_AGENT_CONFIG,              // ❌ OFF
  AMAZON_AGENT_CONFIG,            // ❌ OFF
  AIRLINE_AGENT_CONFIG,           // ❌ OFF
  VOTING_AGENT_CONFIG,            // ❌ OFF
  DOCTORS_OFFICE_AGENT_CONFIG,    // ❌ OFF
  STANFORD_AGENT_CONFIG,          // ❌ OFF
  MEDICAL_RECORDS_AGENT_CONFIG,   // ❌ OFF (cross-provider coordination)
  BLUE_CROSS_AGENT_CONFIG,        // ❌ OFF (health insurance)
] as const;

export const ACTIVE_AGENTS = ALL_REGISTERED_AGENTS.filter(agent => agent.isActive);
export const INACTIVE_AGENTS = ALL_REGISTERED_AGENTS.filter(agent => !agent.isActive);

/**
 * Get agent by DID
 */
export function getAgentByDid(did: string): RegisteredAgentConfig | undefined {
  return ALL_REGISTERED_AGENTS.find(agent => agent.agentDid === did);
}

/**
 * Get agent by ID
 */
export function getAgentById(id: string): RegisteredAgentConfig | undefined {
  return ALL_REGISTERED_AGENTS.find(agent => agent.agentId === id);
}

/**
 * Get agents by role
 */
export function getAgentsByRole(role: AgentRole): RegisteredAgentConfig[] {
  return ALL_REGISTERED_AGENTS.filter(agent => agent.role === role);
}

/**
 * Get agents by issuer
 */
export function getAgentsByIssuer(issuerDid: string): RegisteredAgentConfig[] {
  return ALL_REGISTERED_AGENTS.filter(agent => agent.parentIssuerDid === issuerDid);
}
