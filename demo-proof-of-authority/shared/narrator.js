// =============================================================================
// shared/narrator.js — console narration helpers, shared by both modes.
// Small, dependency-free coloring so the recording looks clean.
// =============================================================================

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', red: '\x1b[31m', cyan: '\x1b[36m', yellow: '\x1b[33m', magenta: '\x1b[35m',
};

export function makeNarrator({ mode }) {
  return {
    title(text) {
      console.log('');
      console.log(`${C.bold}${C.magenta}  ${text}${C.reset}`);
      console.log(`${C.dim}  mode: ${mode}${C.reset}`);
    },
    tagline(text) {
      console.log(`${C.bold}  ${text}${C.reset}\n`);
    },
    act(n, name) {
      console.log(`\n${C.bold}${C.cyan}━━ ACT ${n} — ${name} ${'━'.repeat(Math.max(1, 46 - name.length))}${C.reset}\n`);
    },
    narrate(text) {
      console.log(`  ${text}`);
    },
    ok(text) {
      console.log(`  ${C.green}✔${C.reset} ${text}`);
    },
    // Runs an action that SHOULD fail; the demo's teeth. If the contract
    // let it through, the demo aborts loudly — we never fake a rejection.
    async expectFailure(action, expectedReason) {
      try {
        await action();
      } catch (err) {
        const msg = String(err.message ?? err);
        if (msg.includes(expectedReason)) {
          console.log(`  ${C.red}✘ REJECTED by the contract:${C.reset} "${expectedReason}" ${C.green}(as designed)${C.reset}\n`);
          return;
        }
        console.log(`  ${C.yellow}⚠ rejected, but for an unexpected reason:${C.reset} ${msg}\n`);
        return;
      }
      throw new Error(`DEMO INTEGRITY FAILURE: expected rejection "${expectedReason}" but the call succeeded`);
    },
    closer(lines) {
      console.log(`\n${C.bold}${C.magenta}━━ THE POINT ${'━'.repeat(46)}${C.reset}\n`);
      for (const line of lines) console.log(`  ${line}`);
      console.log('');
    },
  };
}
