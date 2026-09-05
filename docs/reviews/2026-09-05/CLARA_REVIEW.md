# AgenticDID review and repair punch list

Clara, September 5, 2026. Reviewed revision: `818708dc4185fc86f42f9dcfea37a8c4eef58218`.

## Shared-kernel authority gaps

The following findings concern `didz-kernel` in the parent repository, not a claim that these faults exist in every AgenticDID contract.

1. `packages/kernel-demoland/src/authority.ts:158-188` accepts negative reserve and settle amounts. A synthetic `-200n` settlement yielded spent budget `-200n`. Reject negative amounts before state mutation at the public action, reservation, settlement and delegation boundaries. Add failure-atomicity tests for zero, negative, huge and repeated values.
2. `packages/kernel-demoland/src/gate.ts:66-86` reserves budget before returning `ask-human`, but the decision omits the reservation identifier. `Kernel.settle` accepts only allowed decisions. A 60-unit synthetic approval request left 60 reserved after cancellation through the public kernel method failed. Define approval, denial, expiry and retry transitions with a releasable handle or defer reservation until approval.
3. `packages/kernel-core/src/kernel.ts:132-144` produces `sig(allowed)` even with a synthetic gate returning `REALDEAL_TEST`. No signing adapter is called. Provider evidence and receipt authentication must be separate fields and guarantees.

## Reuse opportunity

TaskFence already has nonnegative ledger schemas, persistent reservations, signed receipt verification, and reconstruction tests. Map its contracts into a kernel adapter instead of creating a third budget or receipt model. A passing TaskFence test does not establish that integration: add cross-package conformance and replay tests, and bind actor, resource, amount, counterparty, time, object evidence and final settlement to the same authenticated record.

The existing broken technical-reference link is restored by a new compatibility pointer in the shared documentation. No existing AgenticDID implementation was edited.
