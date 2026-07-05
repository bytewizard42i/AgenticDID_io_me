// =============================================================================
// realDeal/adapter.js — the LIVE backend adapter.
//
// Same 10-method interface as demoLand/simulator.js, but every call here:
//   1. runs the circuit locally to build a transcript,
//   2. sends it to the PROOF SERVER to generate a real ZK proof,
//   3. balances/signs/submits a real transaction to the local Midnight NODE,
//   4. waits for it to land via the INDEXER.
//
// Actor switching works exactly like a wallet swap: the local_secret_key
// witness reads whichever actor's secret is currently in the box. The funding
// wallet pays Dust fees for everyone; on-chain authority is decided solely by
// the contract's key commitments — which is the whole point of the demo.
// =============================================================================

import crypto from 'node:crypto';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';

import { Contract, pureCircuits } from '../contract/managed-zk/contract/index.js';
import { createWallet, createProviders, syncWallet, GENESIS_SEED, zkConfigPath } from './wallet.js';

function bytes32(label) {
  return new Uint8Array(crypto.createHash('sha256').update(label).digest());
}

export async function makeLocalnetAdapter(say) {
  const secrets = {
    alice:   bytes32('demo:secret:alice'),
    alist:   bytes32('demo:secret:alist'),
    helper:  bytes32('demo:secret:helper'),
    mallory: bytes32('demo:secret:mallory'),
  };

  // The actor box: witnesses read the CURRENT actor's secret from here.
  const actor = { secretKey: secrets.alice };

  const witnesses = {
    local_secret_key: (witnessContext) => [
      witnessContext.privateState,
      actor.secretKey,
    ],
  };

  say.narrate('Connecting to the localnet (node + indexer + proof server)...');
  const walletCtx = await createWallet(GENESIS_SEED);
  await syncWallet(walletCtx, 'funding wallet');
  const providers = await createProviders(walletCtx);

  const compiled = CompiledContract.make('scoped_grant', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  say.narrate('Deploying scoped_grant to the localnet (real ZK deployment)...');
  const deployed = await deployContract(providers, {
    compiledContract: compiled,
    privateStateId: 'agenticdid-poa',
    initialPrivateState: {},
  });
  const address = deployed.deployTxData.public.contractAddress;
  say.ok(`Deployed at ${address}`);

  async function call(name, ...args) {
    const result = await deployed.callTx[name](...args);
    const txId =
      result?.public?.txId ?? result?.public?.transactionHash ?? 'submitted';
    say.narrate(`    ↳ real proof generated + tx landed: ${String(txId).slice(0, 20)}…`);
    return result;
  }

  return {
    as(actorName) {
      actor.secretKey = secrets[actorName];
    },
    deriveKey(actorName) {
      return pureCircuits.derive_public_key(secrets[actorName]);
    },
    scopeHash: (label) => bytes32(`scope:${label}`),
    grantId:   (label) => bytes32(`grant:${label}:${Date.now()}`),

    issueGrant: (id, agentPublicKey, scope, maxAmount, expiry) =>
      call('issue_grant', id, agentPublicKey, scope, maxAmount, expiry),
    delegate: (parentId, childId, subAgentPublicKey, scope, maxAmount, expiry) =>
      call('delegate', parentId, childId, subAgentPublicKey, scope, maxAmount, expiry),
    assertAuthorized: (id, scope, amount) =>
      call('assert_authorized', id, scope, amount),
    revokeGrant: (id) => call('revoke_grant', id),
    advanceEpoch: () => call('advance_epoch'),

    shutdown: () => walletCtx.wallet.stop?.(),
  };
}
