// =============================================================================
// realDeal/wallet.js — wallet + provider plumbing for the live localnet.
//
// Ported from the proven Passport foundations harness
// (midnight-Passport-johns_copy/demo/mn-passport-foundations/src/node/wallet.ts)
// and trimmed to what this demo needs. The funding wallet is the genesis-seeded
// dev wallet on the local devnet; it pays Dust fees for every actor's calls.
// =============================================================================

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';
import { Buffer } from 'node:buffer';

import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import {
  createKeystore,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';

// InMemoryTransactionHistoryStorage was removed from
// @midnight-ntwrk/wallet-sdk-unshielded-wallet@3; supply a no-op stub.
const NoopTxHistoryStorage = {
  upsert: async () => undefined,
  get: async () => null,
  delete: async () => undefined,
  list: async () => [],
  clear: async () => undefined,
};

// Workaround for ledger-v8 bug: MerkleTree::collapse panics on non-empty
// trees when producing shielded outputs. Inherited from the Passport harness;
// drop when verified fixed upstream.
const _origTryApply = ledger.ZswapChainState.prototype.tryApply;
ledger.ZswapChainState.prototype.tryApply = function (...args) {
  try {
    return _origTryApply.apply(this, args);
  } catch {
    return [this, new Map()];
  }
};

// Enable WebSocket for GraphQL subscriptions (wallet sync).
globalThis.WebSocket = WebSocket;

export const CONFIG = {
  networkId: 'undeployed',
  indexer: 'http://localhost:8088/api/v4/graphql',
  indexerWS: 'ws://localhost:8088/api/v4/graphql/ws',
  node: 'http://localhost:9944',
  proofServer: 'http://127.0.0.1:6300',
};
setNetworkId(CONFIG.networkId);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The FULL compile output (with prover/verifier keys): npm run compile-contract-zk
export const zkConfigPath = path.resolve(__dirname, '..', 'contract', 'managed-zk');

// Genesis-seeded dev wallet on the localnet — public, funded, test-only.
export const GENESIS_SEED =
  process.env.WALLET_SEED ?? '0'.repeat(63) + '1';

export function deriveKeys(seed) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');

  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');

  hdWallet.hdWallet.clear();
  return result.keys;
}

export async function createWallet(seed) {
  const keys = deriveKeys(seed);
  const networkId = getNetworkId();

  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

  const configuration = {
    networkId,
    indexerClientConnection: {
      indexerHttpUrl: CONFIG.indexer,
      indexerWsUrl: CONFIG.indexerWS,
    },
    provingServerUrl: new URL(CONFIG.proofServer),
    relayURL: new URL(CONFIG.node.replace(/^http/, 'ws')),
    costParameters: { feeBlocksMargin: 100 },
    txHistoryStorage: NoopTxHistoryStorage,
  };

  const wallet = await WalletFacade.init({
    configuration,
    shielded: (config) => ShieldedWallet(config).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (config) =>
      UnshieldedWallet(config).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (config) =>
      DustWallet(config).startWithSecretKey(
        dustSecretKey,
        ledger.LedgerParameters.initialParameters().dust,
      ),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

export async function syncWallet(walletCtx, label) {
  process.stdout.write(`  syncing ${label} to the localnet`);
  await Rx.firstValueFrom(
    walletCtx.wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.tap(() => process.stdout.write(' .')),
      Rx.filter((state) => state.isSynced === true),
    ),
  );
  console.log(' synced.');
}

export async function createProviders(walletCtx) {
  const state = await Rx.firstValueFrom(
    walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );

  const signFn = (payload) => walletCtx.unshieldedKeystore.signData(payload);

  const walletProvider = {
    getCoinPublicKey: () => state.shielded.coinPublicKey.toHexString(),
    getEncryptionPublicKey: () => state.shielded.encryptionPublicKey.toHexString(),
    async balanceTx(tx, ttl) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: walletCtx.shieldedSecretKeys,
          dustSecretKey: walletCtx.dustSecretKey,
        },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );

      const signed = await walletCtx.wallet.signRecipe(recipe, signFn);
      return walletCtx.wallet.finalizeRecipe(signed);
    },
    submitTx: (tx) => walletCtx.wallet.submitTransaction(tx),
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  return {
    privateStateProvider: levelPrivateStateProvider({
      midnightDbName: 'midnight-level-db',
      privateStateStoreName: 'agenticdid-poa-demo',
      privateStoragePasswordProvider: () => 'AgenticDID!poa-demo',
      accountId: state.shielded.encryptionPublicKey.toHexString().slice(0, 16),
    }),
    publicDataProvider: indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(CONFIG.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}
