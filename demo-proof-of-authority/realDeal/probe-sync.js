// Diagnostic probe: can the funding wallet sync against the localnet at all?
// Prints full error details (util.inspect) instead of "[object Object]".
import util from 'node:util';
import * as Rx from 'rxjs';
import { createWallet, GENESIS_SEED } from './wallet.js';

const walletCtx = await createWallet(GENESIS_SEED);
console.log('wallet created, watching state for 30s...');

const sub = walletCtx.wallet.state().subscribe({
  next: (s) => console.log('state:', util.inspect({ isSynced: s.isSynced, error: s.error }, { depth: 4 })),
  error: (e) => console.log('stream error:', util.inspect(e, { depth: 6 })),
});

process.on('unhandledRejection', (e) => console.log('unhandled:', util.inspect(e, { depth: 6 })));

setTimeout(() => { sub.unsubscribe(); process.exit(0); }, 30_000);
