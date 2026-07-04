/**
 * Medical Records Agent - Registered Agent
 * 
 * Specialized agent for accessing and managing medical records across providers.
 * Coordinates with hospitals, clinics, and healthcare systems to aggregate patient data.
 * 
 * This agent demonstrates cross-issuer coordination:
 * - Aggregates records from multiple healthcare providers
 * - Maintains patient consent and privacy
 * - Provides unified view of medical history
 * - Coordinates referrals and information sharing
 * 
 * Status: INACTIVE (placeholder until implementation)
 */

import type { RegisteredAgentConfig } from './registered-agents.js';
import { HOSPITAL_ISSUER_DID } from '../issuers/index.js';

/**
 * Medical Records Agent DID
 */
export const MEDICAL_RECORDS_AGENT_DID = 'did:agentic:medical_records_agent';

/**
 * Medical Records Agent Configuration
 * 
 * UNIQUE VALUE PROPOSITION:
 * 
 * Unlike individual provider agents (Hospital Agent, Doctor's Office Agent),
 * the Medical Records Agent acts as a COORDINATOR across providers.
 * 
 * Individual Provider Agents:
 * - Hospital Agent: Manages records FROM that hospital
 * - Doctor's Office Agent: Manages records FROM that doctor
 * - IVF Center Agent: Manages records FROM that fertility clinic
 * 
 * Medical Records Agent:
 * - Aggregates records FROM ALL providers
 * - Provides unified medical history view
 * - Coordinates referrals between providers
 * - Manages consent and information sharing
 * - Helps patients manage their complete health data
 * 
 * EXAMPLE USE CASE:
 * John has medical records at:
 * - Stanford Hospital (surgery in 2022)
 * - Local Doctor's Office (annual checkups)
 * - IVF Center (fertility treatments)
 * 
 * Without Medical Records Agent:
 * - John must contact each provider separately
 * - No unified view of medical history
 * - Hard to share info when seeing new doctor
 * 
 * With Medical Records Agent:
 * - John asks: "Show me all my medical records"
 * - Agent aggregates from all sources
 * - Presents unified timeline
 * - Can share complete history with new provider
 * - Manages consent for information sharing
 */
export const MEDICAL_RECORDS_AGENT_CONFIG: RegisteredAgentConfig = {
  agentDid: MEDICAL_RECORDS_AGENT_DID,
  agentId: 'medical_records_agent',
  agentHumanName: 'Medical Records Agent',
  role: 'TASK_AGENT',
  
  // Note: Could be tied to a Medical Records Network issuer,
  // or operate as a cross-issuer coordination agent
  parentIssuerDid: HOSPITAL_ISSUER_DID, // Placeholder - could be independent
  
  description: 'Specialized agent for accessing, managing, and coordinating medical records across healthcare providers. Aggregates patient data while maintaining privacy and consent.',
  
  capabilities: [
    // Record Access
    'view_medical_records',
    'aggregate_records_across_providers',
    'search_medical_history',
    'export_records',
    
    // Coordination
    'request_records_from_provider',
    'share_records_with_provider',
    'manage_information_sharing_consent',
    'coordinate_referrals',
    
    // Privacy & Security
    'grant_provider_access',
    'revoke_provider_access',
    'audit_record_access',
    'manage_data_retention',
    
    // Organization
    'categorize_records',
    'timeline_view',
    'search_by_condition',
    'search_by_provider',
    'search_by_date_range',
    
    // Notifications
    'notify_new_records',
    'notify_referral_status',
    'notify_access_requests',
  ],
  
  // Required credentials to use this agent
  requiredCredentials: [
    'KYC_TIER_1',           // Basic identity verification
    'IDENTITY_VERIFIED',    // Confirmed identity
    'PATIENT_CONSENT',      // Explicit consent for record access
  ],
  
  isSystemAgent: false,
  isActive: false,  // ❌ OFF until medical records infrastructure implemented
  
  metadata: {
    icon: '📋',
    color: '#16A085',  // Teal - healthcare + data
    category: 'healthcare_coordination',
  },
};

/**
 * USER JOURNEY EXAMPLES:
 * 
 * Example 1: Viewing Complete Medical History
 * 
 * User: "Show me all my medical records"
 * Medical Records Agent:
 *   1. Query all healthcare providers (Hospital, Doctor, IVF Center)
 *   2. Verify patient consent for each provider
 *   3. Aggregate records into unified timeline
 *   4. Present categorized view:
 *      - Surgeries (Hospital)
 *      - Annual Checkups (Doctor's Office)
 *      - Fertility Treatments (IVF Center)
 *      - Prescriptions (all sources)
 *      - Lab Results (all sources)
 * 
 * 
 * Example 2: Sharing with New Doctor
 * 
 * User: "I'm seeing a new doctor, share my relevant medical history"
 * Medical Records Agent:
 *   1. Ask: "Which conditions/treatments are relevant?"
 *   2. Filter records based on relevance
 *   3. Request consent: "Share these records with Dr. Smith?"
 *   4. Generate shareable credential package
 *   5. Provide access token to new doctor
 *   6. Log access for audit trail
 * 
 * 
 * Example 3: Managing Consent
 * 
 * User: "Who has access to my medical records?"
 * Medical Records Agent:
 *   1. List all providers with current access
 *   2. Show what data each can see
 *   3. Show access history (who viewed when)
 *   4. Allow revocation: "Remove Dr. Jones' access"
 *   5. Update permissions across all systems
 * 
 * 
 * Example 4: Coordinating Referral
 * 
 * Doctor refers patient to specialist:
 *   1. Doctor requests: "Send records to Cardiologist"
 *   2. Medical Records Agent prompts patient for consent
 *   3. Patient: "Share heart-related records only"
 *   4. Agent filters relevant records
 *   5. Creates time-limited access credential
 *   6. Notifies specialist that records are available
 *   7. Tracks when specialist accesses records
 */

/**
 * PRIVACY & CONSENT MODEL:
 * 
 * The Medical Records Agent implements sophisticated consent management:
 * 
 * Consent Levels:
 * 1. Full Access: Provider can see all records
 * 2. Category Access: Provider sees specific types (e.g., only cardiology)
 * 3. Temporal Access: Time-limited access (e.g., 30 days for referral)
 * 4. Emergency Access: Break-glass access with audit trail
 * 
 * Audit Trail:
 * - Who accessed what records
 * - When they accessed them
 * - What they did (viewed, exported, shared)
 * - Patient-controlled visibility
 * 
 * Revocation:
 * - Patient can revoke access at any time
 * - Immediate effect across all systems
 * - Provider notified of revocation
 * - Audit trail preserved
 */

/**
 * TECHNICAL ARCHITECTURE:
 * 
 * The Medical Records Agent acts as a:
 * 
 * 1. Aggregator:
 *    - Queries multiple healthcare providers
 *    - Normalizes data formats
 *    - Presents unified view
 * 
 * 2. Consent Manager:
 *    - Tracks patient preferences
 *    - Enforces access controls
 *    - Maintains audit logs
 * 
 * 3. Coordinator:
 *    - Facilitates provider-to-provider sharing
 *    - Manages referral workflows
 *    - Tracks information flow
 * 
 * 4. Privacy Guardian:
 *    - Enforces HIPAA compliance
 *    - Implements zero-knowledge proofs where possible
 *    - Ensures patient control
 * 
 * Integration Points:
 * - Hospital Agent → provides hospital records
 * - Doctor's Office Agent → provides clinic records
 * - IVF Center Agent → provides fertility records
 * - Medical Records Agent → aggregates and coordinates
 */

/**
 * DIFFERENCE FROM OTHER MEDICAL AGENTS:
 * 
 * Hospital Agent (Provider-Specific):
 * - Role: Manage records FROM this hospital
 * - Scope: Single institution
 * - Focus: Provider workflows
 * 
 * Doctor's Office Agent (Provider-Specific):
 * - Role: Manage records FROM this practice
 * - Scope: Single provider
 * - Focus: Appointment scheduling, prescriptions
 * 
 * Medical Records Agent (Cross-Provider):
 * - Role: Aggregate records FROM ALL providers
 * - Scope: Patient's complete medical history
 * - Focus: Patient control and cross-provider coordination
 * 
 * Think of it as:
 * - Hospital Agent = Your bank's app
 * - Medical Records Agent = Mint.com (aggregates all accounts)
 */
