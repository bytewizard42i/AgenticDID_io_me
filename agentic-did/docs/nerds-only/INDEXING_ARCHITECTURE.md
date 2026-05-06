# AgenticDID Indexing Architecture

**Registered Agents (RAs) + Trusted Issuers (TIs) Indexing**

---

## 🎯 Purpose

Fast, reliable lookups for:
1. **Trusted Issuers (TIs)** - Entities that issue credentials
2. **Registered Agents (RAs)** - All agents in the system

Without indexing, every verification would require slow on-chain queries.  
With indexing, we get **sub-millisecond lookups** from local/cached data.

---

## 📋 What Gets Indexed

### **Trusted Issuers (TIs)**

| Field | Indexed | Purpose |
|-------|---------|---------|
| `issuerDid` | ✅ Primary Key | Fast lookup by DID |
| `issuerId` | ✅ Index | Lookup by short ID |
| `category` | ✅ Index | Filter by issuer category |
| `verificationLevel` | ✅ Index | Filter by verification level |
| `claimedBrandName` | ✅ Index | Fraud detection (brand lookup) |
| `legalName` | ✅ Full-text | Search by legal name |
| `isRevoked` | ✅ Index | Filter active issuers |
| `isActive` | ✅ Index | Filter active issuers |
| `allowedCredentialTypes` | ✅ Array Index | Find issuers for credential type |

**Example Queries:**
- "Find all CORPORATION issuers with REGULATED_ENTITY level"
- "Check if 'Bank of America' is claimed by any issuer"
- "Get all issuers that can issue FINANCIAL_ACCOUNT credentials"
- "List all active (not revoked) issuers"

### **Registered Agents (RAs)**

| Field | Indexed | Purpose |
|-------|---------|---------|
| `agentDid` | ✅ Primary Key | Fast lookup by DID |
| `agentId` | ✅ Index | Lookup by short ID |
| `role` | ✅ Index | Filter by role (LOCAL_AGENT, TASK_AGENT, ISSUER_AGENT) |
| `parentIssuerDid` | ✅ Index | Find agents for specific issuer |
| `capabilities` | ✅ Array Index | Find agents with specific capabilities |
| `isActive` | ✅ Index | Filter active agents |
| `isSystemAgent` | ✅ Index | Filter system agents (agent_0..agent_100) |

**Example Queries:**
- "Find all ISSUER_AGENT agents"
- "Get agents for trusted_issuer_0"
- "Find agents with 'kyc' capability"
- "List all task agents (Banker, Crypto, etc.)"
- "Check if agent_0 exists and is active"

---

## 🏗️ Indexing Layers

### **Layer 1: On-Chain Registry (Source of Truth)**

**Contract**: `AgenticDIDRegistry.compact`

```typescript
// On-chain state (Midnight Network)
state AgenticDIDRegistry {
  // Trusted Issuers mapping
  issuers: Map<Did, IssuerRecord>
  
  // Registered Agents mapping
  agents: Map<Did, AgentRecord>
  
  // Indexes for fast queries
  issuersByCategory: Map<IssuerCategory, Set<Did>>
  issuersByBrand: Map<String, Did>
  agentsByRole: Map<AgentRole, Set<Did>>
  agentsByIssuer: Map<Did, Set<Did>>  // issuerDid → agent DIDs
}
```

**Purpose:**
- Single source of truth
- Immutable audit trail
- Cryptographically verifiable

**Limitations:**
- Slower queries (blockchain reads)
- More expensive (gas fees)
- Less flexible filtering

---

### **Layer 2: Off-Chain Indexer (Fast Queries)**

**Service**: Midnight Indexer + Custom AgenticDID Indexer

```typescript
// Off-chain database (PostgreSQL / MongoDB)
class AgenticDIDIndexer {
  // Syncs from Midnight Network
  async syncFromChain(): Promise<void> {
    // 1. Subscribe to AgenticDIDRegistry events
    // 2. Process IssuerRegistered / AgentRegistered events
    // 3. Update local database
    // 4. Build search indexes
  }
  
  // Fast queries
  async findIssuerByDid(did: string): Promise<IssuerRecord | null>
  async findIssuersByCategory(category: IssuerCategory): Promise<IssuerRecord[]>
  async findIssuerByBrand(brandName: string): Promise<IssuerRecord | null>
  async findAgentsByRole(role: AgentRole): Promise<AgentRecord[]>
  async searchIssuers(query: string): Promise<IssuerRecord[]>
}
```

**Purpose:**
- Millisecond query times
- Complex filtering and search
- No blockchain query costs

**Data flow:**
```
Midnight Network (AgenticDIDRegistry)
         ↓ (events)
   Indexer Service
         ↓ (sync)
   Local Database (Postgres/Mongo)
         ↓ (queries)
   Midnight Gateway API
         ↓ (HTTP)
   Task Agents / Comet
```

---

### **Layer 3: Local Cache (Sub-Millisecond)**

**In Midnight Gateway**:

```typescript
class RegistryCache {
  private issuerCache: Map<string, IssuerRecord> = new Map();
  private agentCache: Map<string, AgentRecord> = new Map();
  private brandIndex: Map<string, string> = new Map();  // brandName → issuerDid
  
  async getIssuer(did: string): Promise<IssuerRecord | null> {
    // Check cache first
    if (this.issuerCache.has(did)) {
      return this.issuerCache.get(did)!;
    }
    
    // Fallback to indexer
    const issuer = await indexer.findIssuerByDid(did);
    if (issuer) {
      this.issuerCache.set(did, issuer);
    }
    
    return issuer;
  }
  
  async checkBrandImpersonation(brandName: string, claimedIssuerDid: string): Promise<boolean> {
    // Fast brand lookup from cache
    const existingIssuerDid = this.brandIndex.get(brandName.toLowerCase());
    
    if (!existingIssuerDid) {
      return false;  // Brand not claimed
    }
    
    // If different issuer claims same brand → FRAUD
    return existingIssuerDid !== claimedIssuerDid;
  }
}
```

**Purpose:**
- Sub-millisecond lookups
- Reduce indexer load
- Essential for fraud detection

**Cache invalidation:**
- TTL: 60 seconds (configurable)
- Event-based: Clear on IssuerRevoked events
- Manual: Admin can flush cache

---

## 📊 Index Schema

### **Trusted Issuers Index**

```sql
-- PostgreSQL schema
CREATE TABLE trusted_issuers (
  issuer_did VARCHAR(255) PRIMARY KEY,
  issuer_id VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  verification_level VARCHAR(50) NOT NULL,
  legal_name TEXT NOT NULL,
  claimed_brand_name VARCHAR(255),
  jurisdiction VARCHAR(50),
  metadata_hash VARCHAR(255),
  registered_by VARCHAR(255),
  stake_amount BIGINT,
  is_revoked BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  revoked_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_category (category),
  INDEX idx_verification_level (verification_level),
  INDEX idx_brand_name (claimed_brand_name),
  INDEX idx_active (is_active, is_revoked),
  FULLTEXT INDEX ft_legal_name (legal_name)
);

-- Credential types mapping (many-to-many)
CREATE TABLE issuer_allowed_credentials (
  issuer_did VARCHAR(255) REFERENCES trusted_issuers(issuer_did),
  credential_type VARCHAR(100) NOT NULL,
  PRIMARY KEY (issuer_did, credential_type),
  INDEX idx_credential_type (credential_type)
);
```

### **Registered Agents Index**

```sql
CREATE TABLE registered_agents (
  agent_did VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,  -- LOCAL_AGENT, TASK_AGENT, ISSUER_AGENT
  parent_issuer_did VARCHAR(255) REFERENCES trusted_issuers(issuer_did),
  description TEXT,
  is_system_agent BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_role (role),
  INDEX idx_parent_issuer (parent_issuer_did),
  INDEX idx_system_agent (is_system_agent),
  INDEX idx_active (is_active)
);

-- Agent capabilities (many-to-many)
CREATE TABLE agent_capabilities (
  agent_did VARCHAR(255) REFERENCES registered_agents(agent_did),
  capability VARCHAR(100) NOT NULL,
  PRIMARY KEY (agent_did, capability),
  INDEX idx_capability (capability)
);
```

---

## 🔌 Indexer API Endpoints

### **Midnight Gateway Extensions**

```typescript
// GET /issuers - List all trusted issuers
app.get('/issuers', async (req, reply) => {
  const { category, verificationLevel, active } = req.query;
  
  const issuers = await indexer.findIssuers({
    category,
    verificationLevel,
    active: active !== 'false',
  });
  
  return { issuers };
});

// GET /issuers/:did - Get specific issuer
app.get('/issuers/:did', async (req, reply) => {
  const issuer = await indexer.findIssuerByDid(req.params.did);
  
  if (!issuer) {
    return reply.code(404).send({ error: 'Issuer not found' });
  }
  
  return issuer;
});

// GET /issuers/brand/:name - Check brand ownership
app.get('/issuers/brand/:name', async (req, reply) => {
  const issuer = await indexer.findIssuerByBrand(req.params.name);
  
  if (!issuer) {
    return reply.code(404).send({ error: 'Brand not claimed' });
  }
  
  return issuer;
});

// GET /agents - List all registered agents
app.get('/agents', async (req, reply) => {
  const { role, issuerDid, systemAgent } = req.query;
  
  const agents = await indexer.findAgents({
    role,
    parentIssuerDid: issuerDid,
    isSystemAgent: systemAgent === 'true',
  });
  
  return { agents };
});

// GET /agents/:did - Get specific agent
app.get('/agents/:did', async (req, reply) => {
  const agent = await indexer.findAgentByDid(req.params.did);
  
  if (!agent) {
    return reply.code(404).send({ error: 'Agent not found' });
  }
  
  return agent;
});

// POST /search - Advanced search
app.post('/search', async (req, reply) => {
  const { type, query, filters } = req.body;
  
  if (type === 'issuers') {
    return await indexer.searchIssuers(query, filters);
  } else if (type === 'agents') {
    return await indexer.searchAgents(query, filters);
  }
  
  return reply.code(400).send({ error: 'Invalid search type' });
});
```

---

## 🚀 Sync Strategy

### **Real-Time Sync**

```typescript
class MidnightEventSubscriber {
  async subscribe(): Promise<void> {
    // Subscribe to AgenticDIDRegistry events
    const contract = await contractLoader.loadContract('AgenticDIDRegistry');
    
    // Listen for new issuers
    contract.on('IssuerRegistered', async (event) => {
      await indexer.addIssuer(event.issuer);
      await cache.invalidateIssuer(event.issuer.issuerDid);
    });
    
    // Listen for issuer updates
    contract.on('IssuerUpdated', async (event) => {
      await indexer.updateIssuer(event.issuerDid, event.changes);
      await cache.invalidateIssuer(event.issuerDid);
    });
    
    // Listen for issuer revocation
    contract.on('IssuerRevoked', async (event) => {
      await indexer.revokeIssuer(event.issuerDid);
      await cache.invalidateIssuer(event.issuerDid);
    });
    
    // Listen for new agents
    contract.on('AgentRegistered', async (event) => {
      await indexer.addAgent(event.agent);
      await cache.invalidateAgent(event.agent.agentDid);
    });
  }
}
```

### **Batch Sync (Recovery)**

```typescript
async function syncFromGenesis(): Promise<void> {
  logger.info('Starting full sync from genesis...');
  
  // 1. Fetch all issuers from contract
  const issuers = await contract.getAllIssuers();
  
  // 2. Batch insert to database
  await indexer.batchInsertIssuers(issuers);
  
  // 3. Fetch all agents
  const agents = await contract.getAllAgents();
  
  // 4. Batch insert agents
  await indexer.batchInsertAgents(agents);
  
  // 5. Build indexes
  await indexer.rebuildIndexes();
  
  logger.info('✅ Full sync complete');
}
```

---

## 📈 Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| **Issuer lookup (cached)** | < 1ms | From local cache |
| **Issuer lookup (indexed)** | < 10ms | From database |
| **Issuer lookup (on-chain)** | < 500ms | Fallback only |
| **Brand check (cached)** | < 1ms | Critical for fraud detection |
| **Agent lookup (indexed)** | < 10ms | From database |
| **Complex search** | < 100ms | Full-text + filters |
| **Sync latency** | < 5s | Event → indexed |

---

## 🛡️ Fraud Detection Use Cases

### **Brand Impersonation**

```typescript
async function detectBrandImpersonation(
  claimedBrandName: string,
  issuerCategory: IssuerCategory
): Promise<FraudCheckResult> {
  // 1. Check if brand is in well-known registry
  const isWellKnownBrand = WELL_KNOWN_BRANDS.includes(claimedBrandName);
  
  if (!isWellKnownBrand) {
    return { fraud: false };  // Unknown brand, no check needed
  }
  
  // 2. Fast lookup: Is this brand already claimed?
  const existingIssuer = await indexer.findIssuerByBrand(claimedBrandName);
  
  if (!existingIssuer) {
    // Brand not claimed yet - but check category
    if (issuerCategory === 'SELF_SOVEREIGN') {
      return {
        fraud: true,
        reason: 'SELF_SOVEREIGN cannot claim well-known brand',
        severity: 'CRITICAL',
      };
    }
    return { fraud: false };
  }
  
  // 3. Brand already claimed - any duplicate claim is fraud
  return {
    fraud: true,
    reason: `Brand "${claimedBrandName}" already claimed by ${existingIssuer.issuerDid}`,
    severity: 'CRITICAL',
  };
}
```

### **Agent Authorization**

```typescript
async function verifyAgentAuthorization(
  agentDid: string,
  credentialType: CredentialType
): Promise<boolean> {
  // 1. Fast lookup: Get agent info
  const agent = await indexer.findAgentByDid(agentDid);
  
  if (!agent || !agent.isActive) {
    return false;  // Agent doesn't exist or inactive
  }
  
  // 2. Check agent role
  if (agent.role !== 'ISSUER_AGENT') {
    return false;  // Only issuer agents can issue credentials
  }
  
  // 3. Get parent issuer
  const issuer = await indexer.findIssuerByDid(agent.parentIssuerDid);
  
  if (!issuer || issuer.isRevoked) {
    return false;  // Issuer revoked
  }
  
  // 4. Check if issuer allowed to issue this credential type
  const allowed = await indexer.isCredentialAllowed(
    issuer.issuerDid,
    credentialType
  );
  
  return allowed;
}
```

---

## 🔧 Implementation Checklist

### **Phase 1: Basic Indexing** ✅
- [x] Define index schemas
- [x] Document indexing architecture
- [ ] Implement PostgreSQL migrations
- [ ] Build indexer service skeleton
- [ ] Add sync from Midnight events

### **Phase 2: API Integration**
- [ ] Add index endpoints to Midnight Gateway
- [ ] Integrate with verifier (fast issuer lookups)
- [ ] Integrate with fraud detector (brand checks)
- [ ] Add caching layer

### **Phase 3: Advanced Features**
- [ ] Full-text search for issuers/agents
- [ ] Complex filtering (multi-field queries)
- [ ] Analytics (issuer stats, agent metrics)
- [ ] Admin dashboard for index management

---

## 💡 Why This Matters

**Without Indexing:**
```
User → Comet → Banker → Verify credential
  → Midnight Gateway → On-chain query (500ms)
  → AgenticDIDRegistry.getIssuer() ⏱️
  → Return to Gateway
  → Fraud detection ⏱️
  → Another on-chain query (500ms)
  → Finally return result
Total: ~1-2 seconds per verification
```

**With Indexing:**
```
User → Comet → Banker → Verify credential
  → Midnight Gateway → Cache lookup (1ms) ⚡
  → Indexer (if cache miss, 10ms) ⚡
  → Fraud detection (brand index, 1ms) ⚡
  → Return result
Total: ~10-20ms per verification
```

**100x faster** → Essential for real-time agent interactions. 🚀

---

**Status**: 📋 Documented  
**Next**: Implement indexer service + database migrations
