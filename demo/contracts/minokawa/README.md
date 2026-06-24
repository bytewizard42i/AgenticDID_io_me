# Minokawa Contracts

Minimal Midnight smart contracts for AgenticDID credential state management.

## Overview

These contracts anchor credential state hashes and maintain revocation lists on the Midnight blockchain, enabling privacy-preserving verification of agent credentials.

## Contract Structure

### CredentialRegistry

**State:**
- `credentialHashes: Map<string, CredentialState>`
- `revocationList: Set<string>`

**Functions:**
- `registerCredential(cred_hash, role, scopes)` - Register new credential
- `revokeCredential(cred_hash)` - Revoke credential
- `getCredentialState(cred_hash)` - Query credential status
- `verifyReceipt(receipt)` - Verify Midnight receipt

## MVP Implementation

For the hackathon MVP, we use:
1. **Mock adapter** with predefined valid/revoked states
2. **Receipt stubs** that demonstrate the flow
3. **Clear upgrade path** to real Midnight contracts

## Real Implementation (Post-MVP)

To wire real Midnight contracts:

```typescript
// In midnight-adapter/src/adapter.ts
import { MidnightProvider } from '@midnight/sdk';

async function verifyReceipt(input) {
  const provider = new MidnightProvider(config.rpcUrl);
  const contract = await provider.getContract(REGISTRY_ADDRESS);
  
  const state = await contract.getCredentialState(input.cred_hash);
  const isValid = await contract.verifyReceipt(input.attestation);
  
  return { status: state.revoked ? 'revoked' : 'valid', policy: state.policy };
}
```

## Deployment

```bash
# Deploy to Midnight testnet
yarn deploy --network testnet

# Deploy to Midnight mainnet
yarn deploy --network mainnet
```

## State Schema

```typescript
type CredentialState = {
  cred_hash: string;
  role: string;
  scopes: string[];
  issued_at: number;
  revoked: boolean;
  revoked_at?: number;
};
```

## Events

- `CredentialRegistered(cred_hash, role, timestamp)`
- `CredentialRevoked(cred_hash, timestamp)`
- `ReceiptVerified(cred_hash, attestation, timestamp)`
