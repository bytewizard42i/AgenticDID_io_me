/**
 * AgenticDID Indexer Service
 * 
 * Fast lookups for Registered Agents (RAs) and Trusted Issuers (TIs).
 * 
 * Three-tier architecture:
 * 1. On-chain (AgenticDIDRegistry) - Source of truth
 * 2. Off-chain database (this service) - Fast queries
 * 3. In-memory cache - Sub-millisecond lookups
 * 
 * Performance targets:
 * - Cached lookups: < 1ms
 * - Database lookups: < 10ms
 * - On-chain fallback: < 500ms
 */

import type { Logger } from 'pino';
import type {
  IssuerRecord,
  AgentRecord,
  AgentRole,
  IssuerQueryFilters,
  AgentQueryFilters,
  IssuerCategory,
  VerificationLevel,
  CredentialType,
} from './types.js';
import type { ContractLoader } from './contract-loader.js';

/**
 * Indexer Configuration
 */
export interface IndexerConfig {
  // Cache settings
  cacheTTL: number;           // Seconds to keep items in cache
  maxCacheSize: number;       // Max items in cache
  
  // Sync settings
  syncInterval: number;       // Seconds between sync checks
  batchSize: number;          // Items to sync in one batch
  
  // Database (future: PostgreSQL/MongoDB connection)
  databaseUrl?: string;
}

/**
 * Default indexer configuration
 */
const DEFAULT_INDEXER_CONFIG: IndexerConfig = {
  cacheTTL: 60,               // 1 minute cache
  maxCacheSize: 10000,        // 10k items max
  syncInterval: 10,           // Sync every 10 seconds
  batchSize: 100,             // 100 items per batch
};

/**
 * Cache Entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * AgenticDID Indexer
 * 
 * Provides fast lookups for issuers and agents.
 */
export class AgenticDIDIndexer {
  private logger: Logger;
  private config: IndexerConfig;
  private contractLoader: ContractLoader;
  
  // In-memory caches (Layer 3)
  private issuerCache: Map<string, CacheEntry<IssuerRecord>> = new Map();
  private agentCache: Map<string, CacheEntry<AgentRecord>> = new Map();
  
  // Brand index for fraud detection
  private brandIndex: Map<string, string> = new Map();  // brandName → issuerDid
  
  // In-memory stores (simulating database until we add real DB)
  private issuers: Map<string, IssuerRecord> = new Map();  // issuerDid → IssuerRecord
  private agents: Map<string, AgentRecord> = new Map();    // agentDid → AgentRecord
  
  // Sync state
  private lastSyncTime?: Date;
  private isSyncing: boolean = false;

  constructor(
    contractLoader: ContractLoader,
    logger: Logger,
    config: Partial<IndexerConfig> = {}
  ) {
    this.contractLoader = contractLoader;
    this.logger = logger.child({ component: 'AgenticDIDIndexer' });
    this.config = { ...DEFAULT_INDEXER_CONFIG, ...config };
    
    this.logger.info('AgenticDID Indexer initialized', {
      cacheTTL: this.config.cacheTTL,
      maxCacheSize: this.config.maxCacheSize,
    });
  }

  /**
   * Initialize indexer
   * 
   * Loads initial data from on-chain registry.
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing indexer...');
    
    try {
      // Initial sync from on-chain
      await this.syncFromChain();
      
      this.logger.info('✅ Indexer initialized', {
        issuers: this.issuers.size,
        agents: this.agents.size,
      });
    } catch (error) {
      this.logger.error({ error }, 'Failed to initialize indexer');
      throw error;
    }
  }

  /**
   * Sync from on-chain registry
   * 
   * Fetches latest data from AgenticDIDRegistry contract.
   */
  async syncFromChain(): Promise<void> {
    if (this.isSyncing) {
      this.logger.debug('Sync already in progress, skipping');
      return;
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      this.logger.debug('Starting sync from on-chain registry...');

      // TODO: Implement actual contract calls
      // For now, we'll use the canonical bootstrap data
      await this.loadBootstrapData();

      this.lastSyncTime = new Date();
      const duration = Date.now() - startTime;

      this.logger.info('✅ Sync complete', {
        duration: `${duration}ms`,
        issuers: this.issuers.size,
        agents: this.agents.size,
      });

    } catch (error) {
      this.logger.error({ error }, 'Sync failed');
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Load bootstrap data
   * 
   * Loads canonical bootstrap data (trusted_issuer_0, agent_0, canonical_agent_101).
   * In production, this would fetch from on-chain registry.
   */
  private async loadBootstrapData(): Promise<void> {
    // Import canonical IDs and configs
    const { TRUSTED_ISSUER_0_DID, AGENTICDID_ISSUER_AGENT_0_DID, CANONICAL_AGENT_101_DID } = 
      await import('../../shared/src/canonical-ids.js');

    // Load trusted_issuer_0
    const trustedIssuer0: IssuerRecord = {
      issuerDid: TRUSTED_ISSUER_0_DID,
      category: 'CORPORATION' as IssuerCategory,
      verificationLevel: 'REGULATED_ENTITY' as VerificationLevel,
      legalName: 'AgenticDID Foundation',
      claimedBrandName: 'AgenticDID',
      jurisdiction: 'US-DE',
      metadataHash: 'ipfs://placeholder',
      registeredBy: 'did:agentic:protocol:admin',
      stakeAmount: 100_000n,
      isRevoked: false,
      isActive: true,
      createdAt: new Date('2025-11-14T12:00:00Z'),
    };

    this.addIssuer(trustedIssuer0);

    // Load agent_0
    const agent0: AgentRecord = {
      agentDid: AGENTICDID_ISSUER_AGENT_0_DID,
      agentId: 'agent_0',
      role: 'ISSUER_AGENT' as AgentRole,
      parentIssuerDid: TRUSTED_ISSUER_0_DID,
      description: 'AgenticDID Issuer Agent - Canonical issuer agent for trusted_issuer_0',
      capabilities: ['kyc', 'credential_issuance', 'revocation'],
      isSystemAgent: true,
      isActive: true,
      createdAt: new Date('2025-11-14T12:00:00Z'),
    };

    this.addAgent(agent0);

    // Load canonical_agent_101 (Comet)
    const comet: AgentRecord = {
      agentDid: CANONICAL_AGENT_101_DID,
      agentId: 'canonical_agent_101',
      role: 'LOCAL_AGENT' as AgentRole,
      description: 'Comet - Canonical local agent for users',
      capabilities: ['credential_management', 'proof_generation', 'task_delegation'],
      isSystemAgent: false,
      isActive: true,
      createdAt: new Date('2025-11-14T12:00:00Z'),
    };

    this.addAgent(comet);

    this.logger.debug('Bootstrap data loaded', {
      issuers: ['trusted_issuer_0'],
      agents: ['agent_0', 'canonical_agent_101'],
    });
  }

  /**
   * Add issuer to index
   */
  addIssuer(issuer: IssuerRecord): void {
    this.issuers.set(issuer.issuerDid, issuer);
    
    // Update brand index
    if (issuer.claimedBrandName) {
      this.brandIndex.set(issuer.claimedBrandName.toLowerCase(), issuer.issuerDid);
    }
    
    this.logger.debug('Issuer added to index', {
      issuerDid: issuer.issuerDid,
      brandName: issuer.claimedBrandName,
    });
  }

  /**
   * Add agent to index
   */
  addAgent(agent: AgentRecord): void {
    this.agents.set(agent.agentDid, agent);
    
    this.logger.debug('Agent added to index', {
      agentDid: agent.agentDid,
      role: agent.role,
    });
  }

  /**
   * Find issuer by DID
   * 
   * @param did - Issuer DID
   * @returns Issuer record or null
   */
  async findIssuerByDid(did: string): Promise<IssuerRecord | null> {
    // Check cache first
    const cached = this.getCachedIssuer(did);
    if (cached) {
      return cached;
    }

    // Check in-memory store
    const issuer = this.issuers.get(did);
    if (issuer) {
      this.cacheIssuer(did, issuer);
      return issuer;
    }

    // TODO: Check database
    // TODO: Fallback to on-chain query

    return null;
  }

  /**
   * Find issuer by brand name
   * 
   * Critical for fraud detection.
   * 
   * @param brandName - Brand name to search
   * @returns Issuer record or null
   */
  async findIssuerByBrand(brandName: string): Promise<IssuerRecord | null> {
    const issuerDid = this.brandIndex.get(brandName.toLowerCase());
    
    if (!issuerDid) {
      return null;
    }

    return this.findIssuerByDid(issuerDid);
  }

  /**
   * Find issuers matching filters
   * 
   * @param filters - Query filters
   * @returns Array of matching issuers
   */
  async findIssuers(filters: IssuerQueryFilters = {}): Promise<IssuerRecord[]> {
    let results = Array.from(this.issuers.values());

    // Apply filters
    if (filters.category) {
      results = results.filter(i => i.category === filters.category);
    }

    if (filters.verificationLevel) {
      results = results.filter(i => i.verificationLevel === filters.verificationLevel);
    }

    if (filters.isActive !== undefined) {
      results = results.filter(i => i.isActive === filters.isActive);
    }

    if (filters.isRevoked !== undefined) {
      results = results.filter(i => i.isRevoked === filters.isRevoked);
    }

    // TODO: Implement allowsCredentialType filter
    // Would require checking issuer's allowed credential types

    return results;
  }

  /**
   * Find agent by DID
   * 
   * @param did - Agent DID
   * @returns Agent record or null
   */
  async findAgentByDid(did: string): Promise<AgentRecord | null> {
    // Check cache first
    const cached = this.getCachedAgent(did);
    if (cached) {
      return cached;
    }

    // Check in-memory store
    const agent = this.agents.get(did);
    if (agent) {
      this.cacheAgent(did, agent);
      return agent;
    }

    // TODO: Check database
    // TODO: Fallback to on-chain query

    return null;
  }

  /**
   * Find agents matching filters
   * 
   * @param filters - Query filters
   * @returns Array of matching agents
   */
  async findAgents(filters: AgentQueryFilters = {}): Promise<AgentRecord[]> {
    let results = Array.from(this.agents.values());

    // Apply filters
    if (filters.role) {
      results = results.filter(a => a.role === filters.role);
    }

    if (filters.parentIssuerDid) {
      results = results.filter(a => a.parentIssuerDid === filters.parentIssuerDid);
    }

    if (filters.isSystemAgent !== undefined) {
      results = results.filter(a => a.isSystemAgent === filters.isSystemAgent);
    }

    if (filters.isActive !== undefined) {
      results = results.filter(a => a.isActive === filters.isActive);
    }

    if (filters.capability) {
      results = results.filter(a => 
        a.capabilities?.includes(filters.capability!)
      );
    }

    return results;
  }

  /**
   * Get all issuers
   * 
   * @returns All issuers in index
   */
  async getAllIssuers(): Promise<IssuerRecord[]> {
    return Array.from(this.issuers.values());
  }

  /**
   * Get all agents
   * 
   * @returns All agents in index
   */
  async getAllAgents(): Promise<AgentRecord[]> {
    return Array.from(this.agents.values());
  }

  /**
   * Cache issuer
   */
  private cacheIssuer(did: string, issuer: IssuerRecord): void {
    // Implement LRU cache eviction if needed
    if (this.issuerCache.size >= this.config.maxCacheSize) {
      const firstKey = this.issuerCache.keys().next().value;
      this.issuerCache.delete(firstKey);
    }

    this.issuerCache.set(did, {
      data: issuer,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached issuer
   */
  private getCachedIssuer(did: string): IssuerRecord | null {
    const entry = this.issuerCache.get(did);
    
    if (!entry) {
      return null;
    }

    // Check TTL
    const age = Date.now() - entry.timestamp;
    const ttl = this.config.cacheTTL * 1000;

    if (age > ttl) {
      this.issuerCache.delete(did);
      return null;
    }

    return entry.data;
  }

  /**
   * Cache agent
   */
  private cacheAgent(did: string, agent: AgentRecord): void {
    // Implement LRU cache eviction if needed
    if (this.agentCache.size >= this.config.maxCacheSize) {
      const firstKey = this.agentCache.keys().next().value;
      this.agentCache.delete(firstKey);
    }

    this.agentCache.set(did, {
      data: agent,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached agent
   */
  private getCachedAgent(did: string): AgentRecord | null {
    const entry = this.agentCache.get(did);
    
    if (!entry) {
      return null;
    }

    // Check TTL
    const age = Date.now() - entry.timestamp;
    const ttl = this.config.cacheTTL * 1000;

    if (age > ttl) {
      this.agentCache.delete(did);
      return null;
    }

    return entry.data;
  }

  /**
   * Invalidate issuer cache
   */
  invalidateIssuer(did: string): void {
    this.issuerCache.delete(did);
    this.logger.debug('Issuer cache invalidated', { issuerDid: did });
  }

  /**
   * Invalidate agent cache
   */
  invalidateAgent(did: string): void {
    this.agentCache.delete(did);
    this.logger.debug('Agent cache invalidated', { agentDid: did });
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.issuerCache.clear();
    this.agentCache.clear();
    this.logger.info('All caches cleared');
  }

  /**
   * Get indexer statistics
   * 
   * @returns Stats about indexed data and cache
   */
  getStats() {
    return {
      issuers: {
        total: this.issuers.size,
        cached: this.issuerCache.size,
        brands: this.brandIndex.size,
      },
      agents: {
        total: this.agents.size,
        cached: this.agentCache.size,
      },
      sync: {
        lastSync: this.lastSyncTime,
        isSyncing: this.isSyncing,
      },
      cache: {
        ttl: this.config.cacheTTL,
        maxSize: this.config.maxCacheSize,
      },
    };
  }
}

/**
 * Create and initialize indexer
 * 
 * @param contractLoader - Contract loader instance
 * @param logger - Logger instance
 * @param config - Indexer configuration
 * @returns Initialized indexer
 */
export async function createIndexer(
  contractLoader: ContractLoader,
  logger: Logger,
  config?: Partial<IndexerConfig>
): Promise<AgenticDIDIndexer> {
  const indexer = new AgenticDIDIndexer(contractLoader, logger, config);
  await indexer.initialize();
  return indexer;
}
