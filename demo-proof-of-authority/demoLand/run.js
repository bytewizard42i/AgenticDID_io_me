// =============================================================================
// demoLand/run.js — thin orchestrator (per the demoLand/realDeal convention):
// build the demoLand adapter, hand it to the shared scenario, nothing else.
// Run with:  npm run demoland
// =============================================================================

import { runScenario } from '../shared/scenario.js';
import { makeNarrator } from '../shared/narrator.js';
import { makeSimulatorAdapter } from './simulator.js';

const say = makeNarrator({ mode: 'demoLand (real compiled circuits, simulated chain)' });

try {
  await runScenario(makeSimulatorAdapter(), say);
  console.log('  demoLand run complete — every rejection above was enforced by');
  console.log('  the real compiled scoped_grant circuits, not by demo code.\n');
} catch (err) {
  console.error('\n  DEMO ABORTED:', err.message ?? err);
  process.exitCode = 1;
}
