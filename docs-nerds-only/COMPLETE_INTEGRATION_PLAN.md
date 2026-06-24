# 🎯 Complete Integration Plan - MCP + Smart Contracts + Official Midnight
**The Big Picture: How Everything Fits Together**

**Date:** November 17, 2025  
**For:** Midnight Summit Hackathon 2025  
**Goal:** Integrate MCP client with Compact smart contracts using official Midnight patterns

---

## 🗺️ The Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AGENTICDID REAL-DEAL SYSTEM                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. FRONTEND (React)                                                    │
│     └─> User: "Verify this agent"                                      │
│              ↓                                                          │
│                                                                          │
│  2. BACKEND API (Express)                                               │
│     └─> Receives verification request                                   │
│              ↓                                                          │
│                                                                          │
│  3. MCP CLIENT (Just built!)                                            │
│     └─> backend/midnight/mcp-client.ts                                 │
│              ↓                                                          │
│                                                                          │
│  4. MIDNIGHT MCP SERVER (Reference: I-am-midnight/)                     │
│     └─> Manages wallet, talks to blockchain                            │
│              ↓                                                          │
│                                                                          │
│  5. COMPACT SMART CONTRACT (Need to create/update!)                     │
│     └─> AgenticDIDRegistry.compact                                     │
│         - Store agent credentials                                       │
│         - Verify ZK proofs                                              │
│         - Check revocation status                                       │
│              ↓                                                          │
│                                                                          │
│  6. MIDNIGHT BLOCKCHAIN (Testnet)                                       │
│     └─> On-chain verification and storage                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Official Midnight Resources (Your Reference Guide)

### Primary Documentation
**Official Midnight Docs:** https://docs.midnight.network/

**Key Sections:**
1. **Compact Language Guide** - How to write smart contracts
2. **Midnight.js SDK** - How to interact with blockchain
3. **Proof System** - How ZK proofs work
4. **Indexer API** - How to query blockchain data

### Reference Repos in I-am-midnight/

```
I-am-midnight/
├── midnight-mcp-johns_copy/              🔥 MCP server (already using!)
├── ref_midnight-docs-johns-copy/         📖 Official documentation
├── ref_midnight-js-johns-copy/           💻 JavaScript SDK
├── ref_compact-johns-copy/               📝 Compact language spec
├── ref_example-counter-johns-copy/       📊 Example contract
├── ref_example-dex-johns-copy/           💱 DEX example
└── ref_midnight-template-repo-johns-copy/ 🎯 Project template
```

**BREADCRUMB:** Check these repos for:
- Contract examples → ref_example-*/
- Language syntax → ref_compact-johns-copy/
- SDK usage → ref_midnight-js-johns-copy/
- Best practices → ref_midnight-docs-johns-copy/

---

## 🔗 How MCP + Contracts Work Together

### The Flow (Complete Picture)

```
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 1: Agent Registration (One-time setup)                          │
└──────────────────────────────────────────────────────────────────────┘

Agent → MCP Client → Smart Contract.registerAgent()
                        ↓
                   Stores on blockchain:
                   - Agent PID (privacy-preserving ID)
                   - Role (Banker, Shopper, etc.)
                   - Scopes (permissions)
                   - Merkle commitment
                   - Expiration time

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 2: Agent Verification (Every time agent acts)                   │
└──────────────────────────────────────────────────────────────────────┘

Your API → MCP Client → Smart Contract.verifyAgent()
             ↓              ↓
         Wallet ops    ZK proof verification
             ↓              ↓
       Returns result ← On-chain check
             ↓
       Returns to API: {verified: true/false, role, scopes}

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 3: Credential Revocation (If needed)                            │
└──────────────────────────────────────────────────────────────────────┘

Issuer → MCP Client → Smart Contract.revokeAgent()
                        ↓
                   Updates revocation bitmap
                   Immutable audit trail
```

---

## 📝 Smart Contract Design (Matching MCP Integration)

### AgenticDIDRegistry.compact (The Contract We Need)

**Location:** `/AgenticDID_REAL-DEAL/contracts/AgenticDIDRegistry.compact`

**BREADCRUMB:** This contract MUST match what the MCP client expects!

```compact
/**
 * ═══════════════════════════════════════════════════════════════
 * AgenticDID Registry - Smart Contract for Midnight
 * ═══════════════════════════════════════════════════════════════
 * 
 * INTEGRATES WITH: backend/midnight/mcp-client.ts
 * 
 * PURPOSE:
 * - Store agent credentials on Midnight blockchain
 * - Verify agents using ZK proofs
 * - Manage revocation state
 * - Provide selective disclosure
 * 
 * REFERENCE DOCS:
 * - Compact syntax: /I-am-midnight/ref_compact-johns-copy/
 * - Example contracts: /I-am-midnight/ref_example-counter-johns-copy/
 * - Official docs: https://docs.midnight.network/develop/compact/
 */

pragma language_version >= 0.17.0;
import CompactStandardLibrary;

// ═══════════════════════════════════════════════════════════════
// STATE STORAGE (On-chain data)
// ═══════════════════════════════════════════════════════════════

// BREADCRUMB: Map of agent PIDs to their credentials
ledger agents: Map<Bytes<32>, AgentCredential>;

// BREADCRUMB: Revocation bitmap (efficient storage)
ledger revocations: Map<Bytes<32>, Boolean>;

// ═══════════════════════════════════════════════════════════════
// DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════

/**
 * Agent Credential
 * 
 * BREADCRUMB: Everything we know about an agent on-chain
 * PRIVACY: Only commitments stored, not raw data
 */
struct AgentCredential {
  // BREADCRUMB: Privacy-preserving identifier (hash)
  agentPID: Bytes<32>;
  
  // BREADCRUMB: What type of agent? (Banker, Shopper, etc.)
  role: Bytes<32>;
  
  // BREADCRUMB: What can they do? (encoded permissions)
  scopes: Bytes<256>;
  
  // BREADCRUMB: Who issued this credential?
  issuer: Bytes<32>;
  
  // BREADCRUMB: When was it issued?
  issuedAt: Uint<64>;
  
  // BREADCRUMB: When does it expire?
  expiresAt: Uint<64>;
  
  // BREADCRUMB: Merkle commitment for selective disclosure
  merkleCommitment: Bytes<32>;
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC CIRCUITS (Functions you can call from MCP client)
// ═══════════════════════════════════════════════════════════════

/**
 * Register a new agent
 * 
 * CALLED FROM: MCP Client → this function
 * PATTERN: Based on ref_example-counter-johns-copy/
 * 
 * BREADCRUMB: This is called once when agent is created
 */
export circuit registerAgent(
  caller: ContractAddress,
  agentPID: Bytes<32>,
  role: Bytes<32>,
  scopes: Bytes<256>,
  merkleCommitment: Bytes<32>,
  duration: Uint<64>,
  currentTime: Uint<64>
): [] {
  // BREADCRUMB: Check if agent already exists
  assert(!agents.member(disclose(agentPID)), "Agent already registered");
  
  // BREADCRUMB: Create the credential
  const credential = AgentCredential {
    agentPID: agentPID,
    role: role,
    scopes: scopes,
    issuer: caller,
    issuedAt: currentTime,
    expiresAt: currentTime + duration,
    merkleCommitment: merkleCommitment
  };
  
  // BREADCRUMB: Store on blockchain
  agents.insert(disclose(agentPID), disclose(credential));
  
  // BREADCRUMB: Initialize revocation status
  revocations.insert(disclose(agentPID), disclose(false));
}

/**
 * Verify an agent (THE KEY FUNCTION!)
 * 
 * CALLED FROM: MCP Client → this function
 * RETURNS: Whether agent is valid + their permissions
 * 
 * BREADCRUMB: This is called EVERY TIME an agent tries to do something
 */
export circuit verifyAgent(
  agentPID: Bytes<32>,
  currentTime: Uint<64>
): {valid: Boolean, role: Bytes<32>, scopes: Bytes<256>} {
  // BREADCRUMB: Check if agent exists
  if (!agents.member(disclose(agentPID))) {
    return {
      valid: false,
      role: Bytes<32>::zero(),
      scopes: Bytes<256>::zero()
    };
  }
  
  // BREADCRUMB: Get the credential
  const credential = agents.lookup(disclose(agentPID));
  
  // BREADCRUMB: Check if revoked
  const isRevoked = revocations.lookup(disclose(agentPID));
  if (isRevoked) {
    return {
      valid: false,
      role: credential.role,
      scopes: Bytes<256>::zero()
    };
  }
  
  // BREADCRUMB: Check if expired
  if (currentTime > credential.expiresAt) {
    return {
      valid: false,
      role: credential.role,
      scopes: Bytes<256>::zero()
    };
  }
  
  // BREADCRUMB: All checks passed!
  return {
    valid: true,
    role: credential.role,
    scopes: credential.scopes
  };
}

/**
 * Revoke an agent credential
 * 
 * CALLED FROM: MCP Client → this function (by issuer)
 * 
 * BREADCRUMB: This permanently disables an agent
 */
export circuit revokeAgent(
  caller: ContractAddress,
  agentPID: Bytes<32>
): [] {
  // BREADCRUMB: Check agent exists
  assert(agents.member(disclose(agentPID)), "Agent not found");
  
  // BREADCRUMB: Verify caller is the issuer
  const credential = agents.lookup(disclose(agentPID));
  assert(credential.issuer == caller, "Only issuer can revoke");
  
  // BREADCRUMB: Mark as revoked
  revocations.insert(disclose(agentPID), disclose(true));
}

/**
 * Check if agent is revoked (public read)
 * 
 * CALLED FROM: Anyone can check this
 * 
 * BREADCRUMB: Quick check without full verification
 */
export circuit isRevoked(
  agentPID: Bytes<32>
): Boolean {
  if (!revocations.member(disclose(agentPID))) {
    return false;
  }
  return revocations.lookup(disclose(agentPID));
}
```

---

## 🔌 Connecting MCP Client to Smart Contract

### Updated MCP Adapter (Wraps MCP Client + Contract Calls)

**Location:** `/AgenticDID_REAL-DEAL/backend/midnight/mcp-adapter.ts`

**BREADCRUMB:** This file connects MCP client to your smart contract

```typescript
/**
 * MCP Adapter - Connects MCP Client to Smart Contracts
 * 
 * INTEGRATES:
 * - mcp-client.ts (talks to MCP server)
 * - AgenticDIDRegistry.compact (smart contract)
 * - Your API (what you call from Express)
 * 
 * REFERENCE:
 * - MCP server: /I-am-midnight/midnight-mcp-johns_copy/
 * - Midnight.js SDK: /I-am-midnight/ref_midnight-js-johns-copy/
 */

import { MidnightMCPClient, createMCPClient } from './mcp-client';

export interface VerifyAgentRequest {
  agentPID: string;       // Privacy-preserving ID
  role: string;           // Expected role
  scopes: string[];       // Expected permissions
  zkProof?: string;       // ZK proof (optional)
}

export interface VerifyAgentResult {
  verified: boolean;      // Is agent valid?
  onChain: boolean;       // Is this from blockchain?
  role: string;           // What role do they have?
  scopes: string[];       // What can they do?
  error?: string;         // Error if failed
}

/**
 * Midnight Adapter using MCP
 * 
 * BREADCRUMB: This is what your API will use
 */
export class MidnightMCPAdapter {
  private mcpClient: MidnightMCPClient;
  private contractAddress: string; // AgenticDIDRegistry address on Midnight
  
  constructor(
    agentId: string,
    mcpServerPath: string,
    contractAddress: string
  ) {
    this.mcpClient = new MidnightMCPClient({
      agentId,
      mcpServerPath
    });
    this.contractAddress = contractAddress;
  }
  
  /**
   * Initialize - Call this once on startup
   * 
   * BREADCRUMB: Connects to Midnight blockchain
   */
  async initialize(): Promise<void> {
    await this.mcpClient.connect();
    console.log('[Adapter] ✅ Connected to Midnight via MCP');
  }
  
  /**
   * Verify Agent - THE KEY METHOD
   * 
   * BREADCRUMB: This is what your API calls to verify agents
   * 
   * FLOW:
   * 1. Your API → this method
   * 2. This → MCP Client → MCP Server
   * 3. MCP Server → Smart Contract.verifyAgent()
   * 4. Smart Contract → Returns result
   * 5. Back up the chain to your API
   */
  async verifyAgent(request: VerifyAgentRequest): Promise<VerifyAgentResult> {
    try {
      // STEP 1: Prepare the contract call
      // BREADCRUMB: Format the data for the smart contract
      const contractCallData = {
        method: 'verifyAgent',
        params: {
          agentPID: request.agentPID,
          currentTime: Date.now()
        }
      };
      
      // STEP 2: Call via MCP
      // BREADCRUMB: This goes through MCP server to blockchain
      const result = await this.mcpClient.callTool(
        'callContract',  // MCP tool for contract interaction
        {
          contractAddress: this.contractAddress,
          ...contractCallData
        }
      );
      
      // STEP 3: Parse the result
      if (result.success && result.data) {
        const contractResult = result.data;
        
        return {
          verified: contractResult.valid === true,
          onChain: true,
          role: this.decodeRole(contractResult.role),
          scopes: this.decodeScopes(contractResult.scopes),
        };
      } else {
        return {
          verified: false,
          onChain: false,
          role: '',
          scopes: [],
          error: result.error || 'Verification failed'
        };
      }
      
    } catch (error) {
      console.error('[Adapter] ❌ Verification error:', error);
      return {
        verified: false,
        onChain: false,
        role: '',
        scopes: [],
        error: String(error)
      };
    }
  }
  
  /**
   * Register Agent
   * 
   * BREADCRUMB: Call this to add a new agent to blockchain
   */
  async registerAgent(
    agentPID: string,
    role: string,
    scopes: string[],
    durationDays: number = 365
  ): Promise<{success: boolean; txHash?: string; error?: string}> {
    try {
      const result = await this.mcpClient.callTool('callContract', {
        contractAddress: this.contractAddress,
        method: 'registerAgent',
        params: {
          agentPID: this.encodePID(agentPID),
          role: this.encodeRole(role),
          scopes: this.encodeScopes(scopes),
          duration: durationDays * 24 * 60 * 60, // Convert to seconds
          currentTime: Date.now()
        }
      });
      
      if (result.success) {
        return {
          success: true,
          txHash: result.data?.txHash
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: String(error)
      };
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // HELPER METHODS (Encoding/Decoding)
  // ═══════════════════════════════════════════════════════════
  
  // BREADCRUMB: These convert between formats
  
  private encodePID(pid: string): string {
    // Convert PID to Bytes<32> format
    // TODO: Implement proper encoding
    return pid;
  }
  
  private encodeRole(role: string): string {
    // Convert role string to Bytes<32>
    // TODO: Implement proper encoding
    return role;
  }
  
  private encodeScopes(scopes: string[]): string {
    // Convert scopes array to Bytes<256>
    // TODO: Implement proper encoding
    return scopes.join(',');
  }
  
  private decodeRole(roleBytes: any): string {
    // Convert Bytes<32> back to role string
    // TODO: Implement proper decoding
    return String(roleBytes);
  }
  
  private decodeScopes(scopesBytes: any): string[] {
    // Convert Bytes<256> back to scopes array
    // TODO: Implement proper decoding
    return String(scopesBytes).split(',');
  }
  
  async disconnect(): Promise<void> {
    await this.mcpClient.disconnect();
  }
}
```

---

## 🎯 Next Steps (In Order!)

### Step 1: Study Official Midnight Examples
```bash
cd /home/js/CascadeProjects/AgenticDID-MAIN/I-am-midnight

# Look at counter example (simple contract)
cd ref_example-counter-johns-copy/

# Look at DEX example (complex contract)
cd ref_example-dex-johns-copy/

# Read Compact language docs
cd ref_compact-johns-copy/

# Check Midnight.js SDK
cd ref_midnight-js-johns-copy/
```

**BREADCRUMB:** Copy patterns from these examples!

### Step 2: Create/Update Smart Contract
```bash
cd /home/js/CascadeProjects/AgenticDID-MAIN/AgenticDID_REAL-DEAL/contracts

# Create AgenticDIDRegistry.compact
# (Use the code from above as template)
```

### Step 3: Compile Contract
```bash
# Use Midnight compiler
docker run --rm -v "$(pwd):/work" \
  midnightnetwork/compactc:latest \
  "compactc /work/AgenticDIDRegistry.compact /work/output/"
```

**REFERENCE:** https://docs.midnight.network/develop/compact/compile/

### Step 4: Deploy Contract
```bash
# Deploy to Midnight testnet
# (Use MCP server's deployment tools)
cd /I-am-midnight/midnight-mcp-johns_copy
# Follow deployment guide
```

### Step 5: Create MCP Adapter
```bash
cd /AgenticDID_REAL-DEAL/backend/midnight
# Create mcp-adapter.ts with the code above
```

### Step 6: Integrate into API
```typescript
// In your Express API
import { MidnightMCPAdapter } from './midnight/mcp-adapter';

const adapter = new MidnightMCPAdapter(
  'api-verifier',
  '/path/to/stdio-server.js',
  'CONTRACT_ADDRESS_HERE' // From deployment
);

await adapter.initialize();

app.post('/api/verify', async (req, res) => {
  const result = await adapter.verifyAgent(req.body);
  res.json(result);
});
```

---

## 📚 Reference Documentation Quick Links

### Official Midnight Docs
- **Main docs:** https://docs.midnight.network/
- **Compact language:** https://docs.midnight.network/develop/compact/
- **Midnight.js SDK:** https://docs.midnight.network/develop/midnight-js/
- **Tutorials:** https://docs.midnight.network/tutorials/

### Your Local References
- **MCP server:** `/I-am-midnight/midnight-mcp-johns_copy/`
- **Contract examples:** `/I-am-midnight/ref_example-*/`
- **SDK reference:** `/I-am-midnight/ref_midnight-js-johns-copy/`
- **Compact docs:** `/I-am-midnight/ref_compact-johns-copy/`

---

## ✅ Checklist for Complete Integration

- [ ] Study official Midnight examples
- [ ] Create AgenticDIDRegistry.compact contract
- [ ] Compile contract using Midnight compiler
- [ ] Deploy contract to Midnight testnet
- [ ] Get contract address
- [ ] Create mcp-adapter.ts
- [ ] Test contract + MCP together
- [ ] Integrate into API
- [ ] Test end-to-end flow
- [ ] Document contract address
- [ ] Update DEMO to use real contract

---

## 🎉 The Result

Once complete, you'll have:

✅ **MCP Client** - Talks to Midnight blockchain  
✅ **Smart Contract** - Stores credentials on-chain  
✅ **MCP Adapter** - Connects the two  
✅ **Your API** - Uses real blockchain verification  
✅ **Perfect for Hackathon** - Real Midnight integration!

**BREADCRUMB:** Follow this plan step-by-step, referencing the official docs and examples as you go!
