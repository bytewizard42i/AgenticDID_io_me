// =============================================================================
// demoLand/simulator.js — the demoLand backend adapter.
//
// This drives the REAL compiled scoped-grant contract (the same circuits that
// run on Midnight) in-process via @midnight-ntwrk/compact-runtime. Nothing
// about the contract logic is mocked — every assert in the demo is enforced
// by the actual compiled circuit code. What's simulated is only the CHAIN:
// there is no node, no proof server, no indexer, and no ZK proof generation.
// realDeal swaps this adapter for one backed by a live localnet.
// =============================================================================

import crypto from 'node:crypto';
import * as rt from '@midnight-ntwrk/compact-runtime';
import { Contract, pureCircuits } from '../contract/managed/index.js';

// Deterministic 32-byte value from a label — used for demo actor secret keys
// and demo grant ids/scope hashes. Deterministic = reproducible recordings.
function bytes32(label) {
  return new Uint8Array(crypto.createHash('sha256').update(label).digest());
}

export function makeSimulatorAdapter() {
  // --- The actors. Each has a secret key; the contract only ever sees
  //     commitments (derive_public_key hashes) of these.
  const secrets = {
    alice:   bytes32('demo:secret:alice'),   // the PRINCIPAL
    alist:   bytes32('demo:secret:alist'),   // her agent
    helper:  bytes32('demo:secret:helper'),  // the sub-agent
    mallory: bytes32('demo:secret:mallory'), // the attacker
  };

  // --- The witness: when a circuit asks for local_secret_key(), hand it the
  //     CURRENT actor's secret from private state. This mirrors how a real
  //     wallet supplies witnesses during proof generation.
  const witnesses = {
    local_secret_key: (witnessContext) => [
      witnessContext.privateState,
      witnessContext.privateState.secretKey,
    ],
  };

  // --- Deploy the contract in-process: build its initial ledger state and a
  //     circuit context we thread through every call (the "chain state").
  const contract = new Contract(witnesses);
  const coinPublicKey = '0'.repeat(64); // dummy zswap key; unused by these circuits
  const ctor = contract.initialState(
    rt.createConstructorContext({ secretKey: secrets.alice }, coinPublicKey)
  );
  let context = rt.createCircuitContext(
    rt.dummyContractAddress(),
    coinPublicKey,
    ctor.currentContractState.data,
    ctor.currentPrivateState
  );

  // Run one circuit, keep the updated chain state, surface contract rejections.
  function call(name, ...args) {
    const out = contract.circuits[name](context, ...args);
    context = out.context;
    return out.result;
  }

  return {
    as(actorName) {
      // Actor switch = swap whose secret key the witness will supply.
      context.currentPrivateState = { secretKey: secrets[actorName] };
    },
    deriveKey(actorName) {
      // Compute the key commitment through the contract's own pure circuit.
      return pureCircuits.derive_public_key(secrets[actorName]);
    },
    scopeHash: (label) => bytes32(`scope:${label}`),
    grantId:   (label) => bytes32(`grant:${label}`),

    issueGrant: (id, agentPublicKey, scope, maxAmount, expiry) =>
      call('issue_grant', id, agentPublicKey, scope, maxAmount, expiry),
    delegate: (parentId, childId, subAgentPublicKey, scope, maxAmount, expiry) =>
      call('delegate', parentId, childId, subAgentPublicKey, scope, maxAmount, expiry),
    assertAuthorized: (id, scope, amount) =>
      call('assert_authorized', id, scope, amount),
    revokeGrant: (id) => call('revoke_grant', id),
    advanceEpoch: () => call('advance_epoch'),
  };
}
