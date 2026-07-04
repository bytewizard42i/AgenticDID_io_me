# 🔌 MCP Integration Guide - REAL-DEAL Build
**Purpose:** Connect AgenticDID to real Midnight blockchain via MCP protocol  
**Status:** Under construction for Midnight Summit Hackathon  
**Date:** November 17, 2025

---

## 🗺️ The Big Picture - How Everything Fits Together

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR AGENTICDID APP                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. FRONTEND (React)                                         │
│     └─> User clicks "Verify Agent"                          │
│                 ↓                                            │
│  2. BACKEND API (Express/Fastify)                           │
│     └─> Receives verification request                       │
│                 ↓                                            │
│  3. MCP CLIENT (What we're building here!)                  │
│     └─> Sends request to Midnight MCP Server                │
│                 ↓                                            │
└─────────────────┼────────────────────────────────────────────┘
                  │
                  ↓ (STDIO communication - like pipes in Linux)
┌─────────────────┼────────────────────────────────────────────┐
│  4. MIDNIGHT MCP SERVER (Already built!)                     │
│     Location: /I-am-midnight/midnight-mcp-johns_copy/       │
│                 ↓                                            │
│     - Manages Midnight wallet                                │
│     - Connects to Midnight testnet                           │
│     - Has agent-specific storage                             │
│                 ↓                                            │
└─────────────────┼────────────────────────────────────────────┘
                  │
                  ↓ (Blockchain RPC calls)
┌─────────────────▼────────────────────────────────────────────┐
│  5. MIDNIGHT BLOCKCHAIN (The real deal!)                     │
│     - Zero-knowledge proofs                                  │
│     - Compact smart contracts                                │
│     - On-chain verification                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 What MCP Does For Us

### Before MCP (Mock/Fake):
```typescript
// Old way - just returning fake data
async verifyAgent() {
  return { verified: true, fake: true }; // ❌ Not real!
}
```

### After MCP (Real Midnight):
```typescript
// New way - real blockchain verification
async verifyAgent() {
  const result = await mcpClient.callTool('verifyTransaction', {...});
  return { verified: result.onChain, real: true }; // ✅ Real!
}
```

---

## 📁 File Structure We're Creating

```
AgenticDID_REAL-DEAL/backend/midnight/
├── MCP_INTEGRATION_GUIDE.md        ← This file (your map!)
├── mcp-client.ts                   ← The MCP client (talks to MCP server)
├── mcp-adapter.ts                  ← Midnight adapter using MCP
├── mcp-types.ts                    ← TypeScript types
├── mcp-config.ts                   ← Configuration
└── mcp-examples.ts                 ← Example usage patterns
```

---

## 🚀 Step-by-Step Integration Plan

### STEP 1: Install MCP SDK ✅
```bash
cd /home/js/CascadeProjects/AgenticDID-MAIN/AgenticDID_REAL-DEAL/backend
npm install @modelcontextprotocol/sdk
```

### STEP 2: Create MCP Client
**File:** `mcp-client.ts`  
**Purpose:** Connects to Midnight MCP server and sends commands

**What it does:**
1. Spawns the Midnight MCP server as a subprocess
2. Communicates via STDIO (standard input/output)
3. Sends JSON-RPC requests
4. Returns verified blockchain responses

### STEP 3: Create MCP Adapter
**File:** `mcp-adapter.ts`  
**Purpose:** Replaces mock adapter with real Midnight integration

**What it does:**
1. Uses MCP Client to talk to blockchain
2. Verifies credentials on-chain
3. Checks wallet balances
4. Returns real verification results

### STEP 4: Update Your API
**File:** Your existing API endpoints  
**Purpose:** Swap mock adapter for MCP adapter

**What changes:**
```typescript
// OLD
import { MockAdapter } from './mock-adapter';
const adapter = new MockAdapter();

// NEW
import { MCPAdapter } from './mcp-adapter';
const adapter = new MCPAdapter();
```

### STEP 5: Test Everything
**File:** `mcp-examples.ts`  
**Purpose:** Test scripts to verify it works

---

## 🔑 Key Concepts Explained

### What is STDIO Transport?
**Simple explanation:** It's like talking to another program through pipes  
**Think of it like:** Two programs having a conversation via text messages

```
Your App: "Hey MCP server, verify this transaction"
         ↓ (sends via STDIO pipe)
MCP Server: "Got it! Checking Midnight blockchain..."
         ↓ (sends back via STDIO pipe)
MCP Server: "Verified! Transaction is valid ✅"
```

### What is an Agent ID?
**Simple explanation:** Each AI agent gets its own wallet and storage  
**Think of it like:** Each person having their own bank account

```
verifier-agent    → Wallet #1 (for verifying)
banker-agent      → Wallet #2 (for banking operations)
shopper-agent     → Wallet #3 (for shopping)
```

### What is a Tool Call?
**Simple explanation:** Asking the MCP server to do something  
**Think of it like:** Pressing buttons on a remote control

Available "buttons" (tools):
- `walletStatus` → "Is my wallet ready?"
- `walletBalance` → "How much money do I have?"
- `verifyTransaction` → "Is this transaction legit?"
- `sendFunds` → "Send money to someone"

---

## 🎓 How to Use MCP (Code Examples)

### Example 1: Connect to MCP Server
```typescript
// BREADCRUMB: This is how you establish connection to Midnight
import { MidnightMCPClient } from './mcp-client';

// Create client for a specific agent
const client = new MidnightMCPClient({
  agentId: 'verifier-agent',  // ← This agent's unique ID
  mcpServerPath: '/path/to/midnight-mcp/dist/stdio-server.js'
});

// Connect to Midnight blockchain
await client.connect();
console.log('Connected to Midnight! 🌙');
```

### Example 2: Verify a Credential
```typescript
// BREADCRUMB: This is how you verify something on Midnight blockchain
const result = await client.callTool('verifyTransaction', {
  txHash: 'abc123...'  // ← Transaction hash to verify
});

if (result.success) {
  console.log('✅ Verified on blockchain!');
  console.log('Data:', result.data);
} else {
  console.log('❌ Verification failed:', result.error);
}
```

### Example 3: Check Wallet Balance
```typescript
// BREADCRUMB: This is how you check an agent's Midnight wallet
const balance = await client.getWalletBalance();

if (balance.success) {
  console.log('Wallet balance:', balance.data.amount, 'tDUST');
} else {
  console.log('Error:', balance.error);
}
```

---

## 🔍 Debugging & Troubleshooting

### Problem: "MCP server won't connect"
**Check:**
1. Is the MCP server path correct?
2. Is Node.js installed? (MCP server needs it)
3. Are the dependencies installed in MCP server folder?

**Fix:**
```bash
cd /home/js/CascadeProjects/AgenticDID-MAIN/I-am-midnight/midnight-mcp-johns_copy
yarn install
yarn build
```

### Problem: "Agent wallet not found"
**Check:**
1. Did you set up the agent wallet?
2. Is the AGENT_ID correct?

**Fix:**
```bash
cd /home/js/CascadeProjects/AgenticDID-MAIN/I-am-midnight/midnight-mcp-johns_copy
yarn setup-agent -a your-agent-id
```

### Problem: "Tool call failed"
**Check:**
1. Is the tool name spelled correctly?
2. Are you passing the right arguments?
3. Is the MCP server still running?

**Debug:**
```typescript
// Turn on verbose logging
console.log('[MCP] Calling tool:', toolName, 'with args:', args);
```

---

## 📝 Next Steps

1. ✅ Read this guide (you're here!)
2. 🔜 Run: `npm install @modelcontextprotocol/sdk`
3. 🔜 Review the code files I'll create next
4. 🔜 Test with example scripts
5. 🔜 Integrate into your API
6. 🔜 Deploy and demo!

---

## 🤝 Need Help?

**If something breaks:**
1. Check the console logs (lots of helpful messages!)
2. Look for `[MCP]` prefixed log messages
3. Read the error messages carefully
4. Check this guide for similar issues

**File locations:**
- MCP Server: `/I-am-midnight/midnight-mcp-johns_copy/`
- Our integration: `/AgenticDID_REAL-DEAL/backend/midnight/`
- Examples: `mcp-examples.ts`

---

**Ready to build? Let's do this! 🚀**
