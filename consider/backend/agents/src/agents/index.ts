/**
 * Agent Definitions Registry
 * 
 * All agent implementations for the AgenticDID Agents Runtime.
 * Each agent has a unique ID, name, description, system prompt, and capabilities.
 * 
 * AGENT CATEGORIES:
 * - LOCAL_AGENT: User's personal assistant (Comet)
 * - ISSUER_AGENT: Credential issuance (agenticdid_agent)
 * - TASK_AGENT: Specialized services (Bank, Amazon, Hospital, etc.)
 * 
 * Total: 12 agents
 */

import type { AgentDefinition } from '../executor.js';

// Import all agent definitions (RA- prefix = Registered Agent)
import { cometAgent } from './ra-comet-local-user-agent.js';
import { agenticDIDAgent } from './ra-agenticdid-agent.js';
import { bankAgent } from './ra-bank-agent.js';
import { amazonAgent } from './ra-amazon-agent.js';
import { airlineAgent } from './ra-airline-agent.js';
import { votingAgent } from './ra-voting-agent.js';
import { doctorsOfficeAgent } from './ra-doctors-office-agent.js';
import { hospitalAgent } from './ra-stanford-hospital-agent.js';
import { ivfCenterAgent } from './ra-stanford-ivf-center-agent.js';
import { stanfordAgent } from './ra-stanford-college-agent.js';
import { blueCrossAgent } from './ra-blue-cross-agent.js';
import { medicalRecordsAgent } from './ra-blue-cross-medical-records-agent.js';

/**
 * All agent definitions as a Record for easy lookup
 * 
 * Used by AgentExecutor to select and execute agents.
 */
export const AGENTS: Record<string, AgentDefinition> = {
  // LOCAL AGENT
  comet: cometAgent,
  
  // ISSUER AGENT
  agenticdid_agent: agenticDIDAgent,
  
  // TASK AGENTS - Financial
  bank_agent: bankAgent,
  
  // TASK AGENTS - E-Commerce
  amazon_agent: amazonAgent,
  
  // TASK AGENTS - Travel
  airline_agent: airlineAgent,
  
  // TASK AGENTS - Government
  voting_agent: votingAgent,
  
  // TASK AGENTS - Healthcare (Primary Care)
  doctors_office_agent: doctorsOfficeAgent,
  
  // TASK AGENTS - Healthcare (Hospital)
  hospital_agent: hospitalAgent,
  
  // TASK AGENTS - Healthcare (Fertility)
  ivf_center_agent: ivfCenterAgent,
  
  // TASK AGENTS - Academic + Medical Multi-Domain
  stanford_agent: stanfordAgent,
  
  // TASK AGENTS - Health Insurance (Financial + Medical Multi-Domain)
  blue_cross_agent: blueCrossAgent,
  
  // TASK AGENTS - Cross-Provider Coordinator
  medical_records_agent: medicalRecordsAgent,
};

/**
 * Array of all agents for iteration
 */
export const ALL_AGENTS = Object.values(AGENTS);

/**
 * Get agent by ID
 */
export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENTS[id];
}

/**
 * List all agent IDs
 */
export function listAgentIds(): string[] {
  return Object.keys(AGENTS);
}

/**
 * Export individual agents for direct import
 */
export {
  cometAgent,
  agenticDIDAgent,
  bankAgent,
  amazonAgent,
  airlineAgent,
  votingAgent,
  doctorsOfficeAgent,
  hospitalAgent,
  ivfCenterAgent,
  stanfordAgent,
  blueCrossAgent,
  medicalRecordsAgent,
};
