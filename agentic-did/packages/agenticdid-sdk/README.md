# AgenticDID SDK

**Core TypeScript SDK for Privacy-Preserving AI Agent Identity**

---

## Overview

This package provides the core types, utilities, and functions for creating and managing AI agent credentials in the AgenticDID protocol.

**What It Does:**
- Defines all TypeScript types for the protocol
- Provides agent credential creation
- Implements cryptographic operations
- Generates Verifiable Presentations (VPs)
- Handles proof generation

---

## Installation

```bash
# From monorepo root
bun install

# The SDK is used internally by other packages
```

---

## Core Concepts

### Agent Credentials

An agent credential is a complete identity package:
- **PID (Privacy-Preserving ID)**: Public identifier
- **Role**: Agent's function (Banker, Traveler, Admin)
- **Scopes**: Specific permissions
- **Key Pair**: Private key (signs) + Public key (verifies)
- **Credential Hash**: Registry identifier
- **Timestamps**: Issued and expires dates

### Verifiable Presentations (VP)

A VP is a proof bundle that demonstrates:
- "I am agent X" (identity)
- "I possess valid credential" (possession)
- "My credential grants me role Y" (authorization)
- "I'm responding to your challenge" (freshness)

### Challenge-Response

Prevents replay attacks:
1. Verifier issues random challenge
2. Agent signs challenge with private key
3. Verifier validates signature
4. Challenge used only once

---

## File Structure

```
packages/agenticdid-sdk/
├── src/
│   ├── index.ts           # Public exports
│   ├── types.ts           # TypeScript type definitions
│   ├── agent.ts           # Agent credential management
│   ├── crypto.ts          # Cryptographic utilities
│   └── proof.ts           # VP generation and verification
│
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

---

## Usage

### Creating an Agent

```typescript
import { createAgent } from '@agenticdid/sdk';

// Create a Banker agent
const bankerAgent = await createAgent('Banker', [
  'bank:transfer',
  'bank:balance',
  'bank:history'
]);

console.log('Agent PID:', bankerAgent.pid);
console.log('Agent Role:', bankerAgent.role);
// Agent has privateKey (NEVER share!)
// Agent has publicKey (can share for verification)
```

### Checking Expiration

```typescript
import { isCredentialExpired } from '@agenticdid/sdk';

if (isCredentialExpired(bankerAgent)) {
  console.log('Credential expired - please renew');
} else {
  console.log('Credential valid');
}
```

### Building a Verifiable Presentation

```typescript
import { buildVP } from '@agenticdid/sdk';

// 1. Get challenge from verifier
const challenge = {
  nonce: 'random_hex_string',
  aud: 'https://api.example.com',
  exp: Date.now() + 120000  // 2 minutes
};

// 2. Build VP
const vp = await buildVP(bankerAgent, challenge);

// 3. Submit to verifier
const response = await fetch('/verify', {
  method: 'POST',
  body: JSON.stringify({ vp, challenge })
});
```

---

## Type Definitions

### Challenge

```typescript
type Challenge = {
  nonce: string;    // Random string
  aud: string;      // Audience URL
  exp: number;      // Expiration timestamp
};
```

### Disclosed

```typescript
type Disclosed = {
  role: 'Banker' | 'Traveler' | 'Admin';
  scopes: string[];
};
```

### VP (Verifiable Presentation)

```typescript
type VP = {
  pid: string;                  // Agent identifier
  proof: string;                // Signature
  sd_proof: string;             // Selective disclosure proof
  disclosed: Disclosed;         // Revealed attributes
  receipt: MidnightReceipt;     // Credential receipt
};
```

### AgentCredential

```typescript
type AgentCredential = {
  pid: string;
  role: Disclosed['role'];
  scopes: string[];
  privateKey: CryptoKey;        // PRIVATE
  publicKey: CryptoKey;
  cred_hash: string;
  issued_at: number;
  expires_at: number;
};
```

See `src/types.ts` for complete type definitions with detailed documentation.

---

## Cryptographic Operations

### Key Generation

```typescript
import { generateKeyPair } from '@agenticdid/sdk/crypto';

const { privateKey, publicKey } = await generateKeyPair();
// Uses ECDSA P-256 curve
// Private key for signing
// Public key for verification
```

### Hashing

```typescript
import { hashCredential } from '@agenticdid/sdk/crypto';

const hash = hashCredential(JSON.stringify(credential));
// SHA-256 hash
// Used for registry identification
```

### PID Generation

```typescript
import { generateRandomPID } from '@agenticdid/sdk/crypto';

const pid = generateRandomPID();
// Random hex string
// Privacy-preserving identifier
```

---

## Security Best Practices

### Private Key Protection

**DO:**
- ✅ Store encrypted at rest
- ✅ Keep in secure memory only
- ✅ Never log or transmit
- ✅ Use secure random generation

**DON'T:**
- ❌ Store in plaintext
- ❌ Send over network
- ❌ Log to console/files
- ❌ Share across agents

### Credential Management

**DO:**
- ✅ Check expiration before use
- ✅ Rotate credentials periodically
- ✅ Revoke if compromised
- ✅ Back up securely

**DON'T:**
- ❌ Use expired credentials
- ❌ Share credentials between agents
- ❌ Hardcode credentials
- ❌ Leave credentials unencrypted

---

## Demo vs Production

### Demo Mode (Current)

**What's Simplified:**
- Credentials in-memory only
- No on-chain registration
- Mock cryptographic verification
- Instant operations

**What's Real:**
- Type definitions
- Data structures
- Cryptographic key generation
- Signing operations

### Production Mode (Phase 2)

**Will Add:**
- On-chain credential registration
- Real ZK proof generation
- Midnight Network integration
- Credential revocation checking
- Delegation management

**Will Keep:**
- All type definitions
- Same API surface
- Cryptographic operations
- Agent creation flow

---

## API Reference

### Functions

#### `createAgent(role, scopes): Promise<AgentCredential>`

Creates a new agent credential with cryptographic keys.

**Parameters:**
- `role`: Agent role ('Banker' | 'Traveler' | 'Admin')
- `scopes`: Array of permission strings

**Returns:** Complete AgentCredential object

**Example:**
```typescript
const agent = await createAgent('Banker', ['bank:transfer']);
```

---

#### `isCredentialExpired(credential): boolean`

Checks if credential has passed expiration date.

**Parameters:**
- `credential`: AgentCredential to check

**Returns:** true if expired, false if valid

**Example:**
```typescript
if (isCredentialExpired(agent)) {
  // Handle expiration
}
```

---

#### `buildVP(agent, challenge): Promise<VP>`

Builds a Verifiable Presentation for verification.

**Parameters:**
- `agent`: AgentCredential with keys
- `challenge`: Challenge from verifier

**Returns:** Complete VP ready for submission

**Example:**
```typescript
const vp = await buildVP(agent, challenge);
await submitForVerification(vp);
```

---

## Testing

```bash
# Run tests
bun test

# Type checking
bun run tsc --noEmit
```

---

## Contributing

When modifying the SDK:

1. **Preserve type definitions** - Don't break consumers
2. **Update documentation** - Keep types.ts comments current
3. **Add tests** - Cover new functionality
4. **Maintain security** - No shortcuts with private keys

---

## Resources

- **Web Crypto API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- **Verifiable Credentials:** https://www.w3.org/TR/vc-data-model/
- **Selective Disclosure:** https://identity.foundation/selective-disclosure-jwt/

---

## License

MIT - See LICENSE file in repository root
