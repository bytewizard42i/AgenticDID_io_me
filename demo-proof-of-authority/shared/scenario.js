// =============================================================================
// shared/scenario.js — THE 3-ACT STORY, WRITTEN ONCE
//
// Per the DIDzMonolith demoLand/realDeal convention, this file contains the
// entire demo storyline and NO backend logic. Both demoLand (in-process
// simulation) and realDeal (live Midnight localnet) run this exact script
// through an adapter, so the story can never drift between the two modes.
//
// The adapter interface every backend must provide:
//   as(actorName)                      -> switch which actor signs the next call
//   deriveKey(actorName)               -> the actor's public key commitment (Bytes<32>)
//   issueGrant(id, agentPublicKey, scope, maxAmount, expiry)
//   delegate(parentId, childId, subAgentPublicKey, scope, maxAmount, expiry)
//   assertAuthorized(id, scope, amount) -> throws if the proof fails
//   revokeGrant(id)
//   advanceEpoch()                     -> advance the epoch clock by 1
//   scopeHash(label)                   -> Bytes<32> hash of a scope label
//   grantId(label)                     -> deterministic Bytes<32> id for the demo
// =============================================================================

export async function runScenario(adapter, say) {
  const GROCERIES = adapter.scopeHash('purchase:groceries');
  const ROOT = adapter.grantId('grant:alice->alist');
  const CHILD = adapter.grantId('grant:alist->helper');

  say.title('AgenticDID — Proof of Authority');
  say.tagline('"Prove the mandate, not the man."');

  // ---------------------------------------------------------------- ACT 1 --
  say.act(1, 'The mandate');
  say.narrate('Alice (the PRINCIPAL) creates an agent, Alist, and issues it a');
  say.narrate('scoped grant: spend up to $50, groceries only, expires at epoch 24.');

  adapter.as('alice');
  await adapter.issueGrant(ROOT, adapter.deriveKey('alist'), GROCERIES, 50n, 24n);
  say.ok('Grant issued. On-chain: a grant id, a scope HASH, a limit, an expiry —');
  say.ok('and a key COMMITMENT for the holder. Alice\'s identity: nowhere.');

  say.narrate('Alist buys $30 of groceries. The merchant demands a proof of authority.');
  adapter.as('alist');
  await adapter.assertAuthorized(ROOT, GROCERIES, 30n);
  say.ok('Proof verified. The merchant learned exactly ONE bit: "authorized".');
  say.ok('Not who the principal is. Not the delegation chain. Nothing else.');

  say.narrate('Alist gets greedy and tries to spend $75 (over its $50 mandate)...');
  await say.expectFailure(
    () => adapter.assertAuthorized(ROOT, GROCERIES, 75n),
    'Amount exceeds grant limit'
  );

  say.narrate('Alist tries to buy electronics (out of scope)...');
  await say.expectFailure(
    () => adapter.assertAuthorized(ROOT, adapter.scopeHash('purchase:electronics'), 10n),
    'Out of scope'
  );

  // ---------------------------------------------------------------- ACT 2 --
  say.act(2, 'Attenuation');
  say.narrate('Alist spawns a helper sub-agent for a $10 side-errand.');
  say.narrate('Delegation MUST be narrower: the contract enforces limit and expiry caps.');

  adapter.as('alist');
  await adapter.delegate(ROOT, CHILD, adapter.deriveKey('helper'), GROCERIES, 10n, 24n);
  say.ok('Child grant issued: $10 cap, same scope, same expiry.');

  adapter.as('helper');
  await adapter.assertAuthorized(CHILD, GROCERIES, 8n);
  say.ok('Helper transacts $8. Chain of authority verified — still zero knowledge of Alice.');

  say.narrate('The helper tries to delegate itself a BIGGER grant ($100)...');
  await say.expectFailure(
    () => adapter.delegate(CHILD, adapter.grantId('grant:helper->evil'), adapter.deriveKey('helper'), GROCERIES, 100n, 24n),
    'Child limit exceeds parent'
  );

  say.narrate('A stranger tries to use Alist\'s grant without Alist\'s key...');
  adapter.as('mallory');
  await say.expectFailure(
    () => adapter.assertAuthorized(ROOT, GROCERIES, 5n),
    'Caller does not hold this grant'
  );

  // ---------------------------------------------------------------- ACT 3 --
  say.act(3, 'Cascade revocation');
  say.narrate('Alice changes her mind and revokes the ROOT grant. One action.');

  adapter.as('alice');
  await adapter.revokeGrant(ROOT);
  say.ok('Root grant revoked.');

  say.narrate('Alist tries to transact again...');
  adapter.as('alist');
  await say.expectFailure(
    () => adapter.assertAuthorized(ROOT, GROCERIES, 5n),
    'Grant not active'
  );

  say.narrate('And the helper — whose OWN grant was never individually revoked...');
  adapter.as('helper');
  await say.expectFailure(
    () => adapter.assertAuthorized(CHILD, GROCERIES, 5n),
    'Parent grant revoked'
  );
  say.ok('The entire delegation tree died with the root. Cascade revocation.');

  // --------------------------------------------------------------- CLOSER --
  say.closer([
    'OAuth would have put Alice\'s token in every one of those requests,',
    'made the agents indistinguishable from her, and revoked nothing cleanly.',
    '',
    'AgenticDID: delegation as scoped, attenuable, revocable capability —',
    'verified in zero knowledge on Midnight. The verifier learns one bit.',
  ]);
}
