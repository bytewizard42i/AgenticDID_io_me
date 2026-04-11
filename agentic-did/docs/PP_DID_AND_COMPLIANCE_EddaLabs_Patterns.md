# PP DID and Compliance — Edda Labs / Brick Towers RWA Patterns for AgenticDID

**Source**: Edda Labs deep dive video by Erick (Part 2: ZK Identity for RWA)
**Video**: https://www.youtube.com/watch?v=l6hMb942sOA
**Repo analyzed**: https://github.com/BrickTowers/midnight-rwa
**Date**: April 11, 2026
**Focus**: Privacy-Preserving DID and Compliance patterns applicable to AgenticDID's agent identity, delegation, and credential system.

---

## Executive Summary

Brick Towers' `midnight-rwa` is a production ZK-KYC system on Midnight for Real World Asset tokenization. Erick at Edda Labs walked through it line by line. For AgenticDID, the relevance is direct: their `SignedCredential<T>` generic pattern, Schnorr crypto module, and HistoricMerkleTree authorization system are the exact building blocks we need for our **agent credential issuance, delegation chain verification, and privacy-preserving agent registry**.

---

## 1. Agent Credentials ↔ `SignedCredential<T>`

### Brick Towers' Generic Pattern

```compact
// From crypto.compact — works with ANY type T
export struct SignedCredential<T> {
  credential: T;           // the data being attested
  signature: Signature;    // Schnorr: { r: CurvePoint, s: Field }
  pk: CurvePoint;         // signer's public key (IDP / Issuer)
}

export pure circuit verify<T>(cred: SignedCredential<T>, challenge: Field): Boolean {
  const lhs = ecMulGenerator(cred.signature.s);               // G * s
  const rhs = ecAdd(cred.signature.r, ecMul(cred.pk, challenge)); // R + pk*c
  return lhs == rhs;
}
```

### AgenticDID Application — Agent Credential Types

Our agents need multiple credential types. Each becomes a struct `T` that plugs into `SignedCredential<T>`:

```compact
// Agent identity credential — "who is this agent?"
export struct AgentIdentityCredential {
  agentDID: Bytes<32>;           // did:midnight:agent:...
  ownerDID: Bytes<32>;           // did:midnight:user:... (the principal)
  agentType: Field;              // e.g., "verifier", "issuer", "delegator"
  creationTimestamp: Uint<64>;
  expiryTimestamp: Uint<64>;
  scopeHash: Bytes<32>;          // hash of permitted operations
}

// Agent delegation credential — "what can this agent do?"
export struct AgentDelegationCredential {
  delegatorDID: Bytes<32>;       // who delegated authority
  delegateeDID: Bytes<32>;       // the agent receiving authority
  permissionMask: Field;         // bitfield of permitted actions
  contextHash: Bytes<32>;        // hash of delegation context
  chainDepth: Uint<32>;          // delegation chain depth
  expiryTimestamp: Uint<64>;
}

// Agent attestation — "what does this agent claim?"
export struct AgentAttestation {
  subjectDID: Bytes<32>;         // who the attestation is about
  claimType: Field;              // type of claim
  claimHash: Bytes<32>;          // hash of the actual claim data
  issuerDID: Bytes<32>;
  issuanceTimestamp: Uint<64>;
  expiryTimestamp: Uint<64>;
}
```

**Usage**: `SignedCredential<AgentIdentityCredential>`, `SignedCredential<AgentDelegationCredential>`, etc. All use the same `verify<T>()` circuit. One crypto module for all credential types.

### The `ecMulGenerator` Workaround

Brick Towers discovered that `ecMulGenerator` is broken in CompactRuntime (JavaScript). Their workaround:

```compact
// Export pure circuits for TypeScript-side signing
export { computeChallengeForCredential };
export { generateDeterministicK };
// export { sign };  // ← COMMENTED OUT due to CompactRuntime bug
```

**AgenticDID impact**: Agent credential signing MUST happen in TypeScript, using the exported pure circuits as helpers. The `sign<T>` circuit compiles and verifies correctly inside ZK — the bug is only in the JS runtime. Plan for this in Phase 2.

---

## 2. Agent Registry ↔ HistoricMerkleTree

### Brick Towers' Authorization Model

```compact
export ledger authorizations: HistoricMerkleTree<32, ZswapCoinPublicKey>;

// Onboard adds user to tree
export circuit onboard(...): [] {
  // ... validation checks ...
  authorizations.insert(ownPublicKey());
}

// Authorization check — before every token send
export circuit isAuthorizedSend(recipient: Either<ZswapCoinPublicKey, ContractAddress>): [] {
  if (disclose(recipient.is_left)) {
    const authPath = findAuthorizationPath(recipient.left);  // witness lookup
    assert(authorizations.checkRoot(
      merkleTreePathRoot<32, ZswapCoinPublicKey>(disclose(authPath))
    ), "not authorized");
  }
}
```

### AgenticDID Application — Agent Registry

Our current agent registry concept uses Map-based storage. HistoricMerkleTree is superior for agent authorization:

```compact
// Agent registry — who is a registered agent?
export ledger agentRegistry: HistoricMerkleTree<32, Bytes<32>>;

// Delegation tree — who has delegated authority?
export ledger delegationTree: HistoricMerkleTree<32, Bytes<32>>;

// Register an agent (issuer-only)
export circuit registerAgent(
  agentCred: SignedCredential<AgentIdentityCredential>
): [] {
  // Verify the credential was signed by a trusted issuer
  assertCredentialValid(agentCred);

  // Add agent DID hash to registry
  agentRegistry.insert(disclose(persistentHash<Bytes<32>>(agentCred.credential.agentDID)));
}

// Check if an agent is registered (called before any agent action)
circuit assertAgentRegistered(agentDID: Bytes<32>): [] {
  const didHash = persistentHash<Bytes<32>>(agentDID);
  const path = findAgentPath(didHash);  // witness
  assert(agentRegistry.checkRoot(
    merkleTreePathRoot<32, Bytes<32>>(disclose(path))
  ), "Agent not registered");
}
```

### Why HistoricMerkleTree for Agents

1. **Race condition immunity** — If Agent A registers while Agent B's proof is in-flight, Agent B's proof still works against the historical root.
2. **Privacy** — Nobody can enumerate all registered agents. You can only prove your own membership.
3. **Delegation chain verification** — Each delegation adds to the tree. The full chain is provable without revealing intermediate delegators.
4. **Scale** — Depth 32 = ~4 billion agents. More than enough.

---

## 3. Sealed Ledger for Agent System Configuration

### Brick Towers' Sealed Pattern

```compact
export sealed ledger identityProviderPublicKey: CurvePoint;
export sealed ledger ALLOWED_COUNTRY_CODE1: Field;
// Set once in constructor, never changeable, never readable externally
```

### AgenticDID Application

```compact
// System-level trust anchors — immutable after deployment
export sealed ledger systemIssuerPublicKey: CurvePoint;    // root agent issuer
export sealed ledger maxDelegationDepth: Uint<32>;          // prevent infinite chains
export sealed ledger agentSchemaVersion: Uint<32>;          // credential schema version
export sealed ledger networkIdentifier: Bytes<32>;          // which AgenticDID network
export sealed ledger minAssuranceLevel: Uint<32>;           // minimum credential assurance
```

**Why sealed matters for AgenticDID**:
- `systemIssuerPublicKey` — the root authority for agent credential issuance. If this changes, the entire trust chain is broken. It MUST be sealed.
- `maxDelegationDepth` — prevents circular or infinitely deep delegation chains. Should be fixed at deployment.
- `agentSchemaVersion` — prevents schema mismatch between agents using different credential versions.

---

## 4. Compound Proof for Agent Onboarding

### Brick Towers' Pattern

```compact
export circuit onboard(quiz, inputCoin, identity): [] {
  assert(quizCommit(quiz) == quizHash, "quiz failed");  // knowledge check
  assertIdentity(identity);                               // identity check
  assertCoinValue(inputCoin);                              // wealth check
  authorizations.insert(ownPublicKey());                   // grant access
}
```

Three checks, one proof, one transaction.

### AgenticDID Agent Onboard Circuit

```compact
// Register a new agent with compound verification
export circuit onboardAgent(
  ownerIdentity: SignedCredential<AgentIdentityCredential>,
  agentConfig: AgentDelegationCredential,
  stakeCoin: CoinInfo
): [] {
  // 1. Verify the owner's identity credential
  assertCredentialValid(ownerIdentity);

  // 2. Verify owner is a registered holder
  assertHolderRegistered(ownerIdentity.credential.ownerDID);

  // 3. Verify delegation config is valid
  assert(disclose(agentConfig.chainDepth) <= maxDelegationDepth, "Delegation too deep");
  assert(disclose(agentConfig.expiryTimestamp) > 0, "Agent must have expiry");

  // 4. Stake requirement (temporary deposit — proves skin in the game)
  assertMinimumStake(stakeCoin);

  // 5. All checks passed — register agent
  agentRegistry.insert(
    disclose(persistentHash<Bytes<32>>(agentConfig.delegateeDID))
  );
  delegationTree.insert(
    disclose(persistentHash<AgentDelegationCredential>(agentConfig))
  );
}
```

### The Temporary Deposit Pattern for Agent Staking

From Brick Towers:
```compact
circuit assertCoinValue(inputCoin: CoinInfo): [] {
  const coin = disclose(inputCoin);
  assert(coin.color == tbtcCoinColor, "wrong token type");
  assert(coin.value >= 100, "insufficient balance");
  receive(coin);  // take custody
  sendImmediate(coin, left<ZswapCoinPublicKey, ContractAddress>(ownPublicKey()), coin.value);
  // immediately return — proves they HAVE the funds
}
```

**AgenticDID adaptation**: An agent creator proves they hold a minimum stake (skin in the game) without permanently locking funds. This discourages spam agent creation while keeping capital efficient.

---

## 5. Witness Architecture for Agent System

### Brick Towers' Minimal Private State

```typescript
export type RwaPrivateState = {
  readonly secretKey: Uint8Array;  // That's it. Nothing else.
};
```

Everything else is derived from the secret key or queried from the ledger at runtime.

### AgenticDID Private State

```typescript
export type AgenticDIDPrivateState = {
  readonly ownerSecretKey: Uint8Array;    // owner's secret key
  readonly agentSecretKey?: Uint8Array;   // agent's separate key (if acting as agent)
};

export const witnesses = {
  localOwnerKey(context): [AgenticDIDPrivateState, Uint8Array] {
    return [context.privateState, context.privateState.ownerSecretKey];
  },

  localAgentKey(context): [AgenticDIDPrivateState, Uint8Array] {
    if (!context.privateState.agentSecretKey) {
      throw new Error('No agent key configured — are you acting as owner?');
    }
    return [context.privateState, context.privateState.agentSecretKey];
  },

  findAgentPath(context, agentDIDHash): [AgenticDIDPrivateState, MerkleTreePath<Uint8Array>] {
    const path = context.ledger.agentRegistry.findPathForLeaf(agentDIDHash);
    if (!path) throw new Error('Agent not registered');
    return [context.privateState, path];
  },

  findDelegationPath(context, delegationHash): [AgenticDIDPrivateState, MerkleTreePath<Uint8Array>] {
    const path = context.ledger.delegationTree.findPathForLeaf(delegationHash);
    if (!path) throw new Error('Delegation not found');
    return [context.privateState, path];
  },

  reduceChallenge(context, challenge): [AgenticDIDPrivateState, bigint] {
    const FIELD_MODULUS = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;
    return [context.privateState, challenge % FIELD_MODULUS];
  },
};
```

**Key difference from Brick Towers**: AgenticDID has two key contexts — the owner and the agent may be different entities. The private state carries both, with the agent key being optional (only present when operating as an agent).

---

## 6. Privacy Boundary for Agent Operations

### Disclosure Analysis

| Agent Operation | What's Disclosed | What Stays Private |
|----------------|------------------|-------------------|
| Register agent | Agent DID hash (for tree insert) | Owner identity, delegation details |
| Verify agent | Merkle proof path | Agent capabilities, scope |
| Delegate authority | Delegation hash (for tree insert) | Delegator identity, permission details |
| Check delegation | Merkle proof path | Delegation chain, depth |
| Agent attestation | Claim type (for routing) | Claim data, subject identity |
| Stake verification | Coin color + minimum check | Exact balance, wallet contents |

### The Pattern

Following Brick Towers: **disclose the minimum needed for the circuit logic**. Merkle proof paths must be disclosed for root computation. Hashes must be disclosed for tree insertion. Everything else stays in the circuit.

---

## 7. Testing — Agent Simulator

### Following Brick Towers' Pattern

```typescript
class AgenticDIDSimulator {
  contract: Contract<AgenticDIDPrivateState>;
  circuitContext: CircuitContext<AgenticDIDPrivateState>;

  // Switch to a different user/agent context
  as(privateState: AgenticDIDPrivateState): AgenticDIDSimulator {
    this.circuitContext = { ...this.circuitContext, currentPrivateState: privateState };
    return this;
  }

  // Test: register an agent
  registerAgent(cred: SignedCredential<AgentIdentityCredential>) {
    this.circuitContext = this.contract.impureCircuits.registerAgent(
      this.circuitContext, cred
    ).context;
    return this.getLedger();
  }

  // Test: onboard with compound proof
  onboardAgent(ownerCred, agentConfig, stakeCoin) {
    this.circuitContext = this.contract.impureCircuits.onboardAgent(
      this.circuitContext, ownerCred, agentConfig, stakeCoin
    ).context;
    return this.getLedger();
  }

  // Test: verify agent is registered
  assertAgentRegistered(agentDID: Uint8Array) {
    this.circuitContext = this.contract.circuits.assertAgentRegistered(
      this.circuitContext, agentDID
    ).context;
  }
}
```

**Test scenarios**:
- Happy path: owner creates agent → agent registers → agent acts
- Unregistered agent rejection
- Delegation depth exceeded
- Expired credential rejection
- Tampered credential signature failure
- Insufficient stake rejection
- Wrong network identifier rejection

---

## 8. Phase 2 Integration Plan Updates

Based on this analysis, the Phase 2 implementation roadmap should incorporate:

### Week 1 (Contract Foundation)
- Port `crypto.compact` as shared module
- Define `AgentIdentityCredential`, `AgentDelegationCredential`, `AgentAttestation` structs
- Implement `SignedCredential<T>` verification circuits
- Add sealed ledger fields for system configuration

### Week 2 (Registry + Authorization)
- Replace Map-based agent registry with `HistoricMerkleTree<32, Bytes<32>>`
- Implement `registerAgent`, `assertAgentRegistered` circuits
- Build witness functions for Merkle path lookups
- Create `AgenticDIDSimulator` for local testing

### Week 3 (Delegation + Compound Proofs)
- Implement delegation tree using HistoricMerkleTree
- Build compound `onboardAgent` circuit
- Implement temporary deposit pattern for agent staking
- Add delegation depth checking with sealed max depth

### Week 4 (Credential Service)
- Build `AgenticDIDCredentialService` (TypeScript) following Brick Towers' pattern
- Implement deterministic k generation for signing
- Export pure circuits for TypeScript-side signing (ecMulGenerator workaround)
- Integration testing with simulator

---

## 9. Resources

- **Edda Labs**: https://eddalabs.io | GitHub: https://github.com/eddalabs
- **Brick Towers midnight-rwa**: https://github.com/BrickTowers/midnight-rwa
- **Erick's video**: https://www.youtube.com/watch?v=l6hMb942sOA
- **Midnight explicit disclosure**: https://docs.midnight.network/compact/reference/explicit-disclosure
- **Related DIDz doc**: `../../DIDz-io/docs/EDDALABS_RWA_PATTERNS_FOR_DIDZ.md`
- **Related KYCz doc**: `../../KYCz/docs/EDDALABS_RWA_PATTERNS_FOR_KYCZ.md`

---

*Analysis by Cassie for AgenticDID Phase 2, April 11, 2026*
*Source: Edda Labs video series by Erick — https://eddalabs.io*
