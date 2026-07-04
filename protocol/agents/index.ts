/**
 * Agents Registry Index
 * 
 * Export all registered agents for easy access.
 */

export {
  // Agent configs
  COMET_AGENT_CONFIG,
  AGENT_0_CONFIG,
  BANK_AGENT_CONFIG,
  AMAZON_AGENT_CONFIG,
  AIRLINE_AGENT_CONFIG,
  VOTING_AGENT_CONFIG,
  DOCTORS_OFFICE_AGENT_CONFIG,
  STANFORD_AGENT_CONFIG,
  
  // Collections
  ALL_REGISTERED_AGENTS,
  ACTIVE_AGENTS,
  INACTIVE_AGENTS,
  
  // Lookup functions
  getAgentByDid,
  getAgentById,
  getAgentsByRole,
  getAgentsByIssuer,
  
  // Types
  type RegisteredAgentConfig,
} from './registered-agents.js';
