import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  local_secret_key(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  issue_grant(context: __compactRuntime.CircuitContext<PS>,
              grant_id_0: Uint8Array,
              agent_pk_0: Uint8Array,
              scope_0: Uint8Array,
              limit_0: bigint,
              expiry_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  delegate(context: __compactRuntime.CircuitContext<PS>,
           parent_id_0: Uint8Array,
           child_id_0: Uint8Array,
           sub_agent_pk_0: Uint8Array,
           scope_0: Uint8Array,
           limit_0: bigint,
           expiry_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  assert_authorized(context: __compactRuntime.CircuitContext<PS>,
                    grant_id_0: Uint8Array,
                    scope_0: Uint8Array,
                    amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revoke(context: __compactRuntime.CircuitContext<PS>, grant_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  tick(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  issue_grant(context: __compactRuntime.CircuitContext<PS>,
              grant_id_0: Uint8Array,
              agent_pk_0: Uint8Array,
              scope_0: Uint8Array,
              limit_0: bigint,
              expiry_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  delegate(context: __compactRuntime.CircuitContext<PS>,
           parent_id_0: Uint8Array,
           child_id_0: Uint8Array,
           sub_agent_pk_0: Uint8Array,
           scope_0: Uint8Array,
           limit_0: bigint,
           expiry_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  assert_authorized(context: __compactRuntime.CircuitContext<PS>,
                    grant_id_0: Uint8Array,
                    scope_0: Uint8Array,
                    amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revoke(context: __compactRuntime.CircuitContext<PS>, grant_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  tick(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  derive_public_key(sk_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  derive_public_key(context: __compactRuntime.CircuitContext<PS>,
                    sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issue_grant(context: __compactRuntime.CircuitContext<PS>,
              grant_id_0: Uint8Array,
              agent_pk_0: Uint8Array,
              scope_0: Uint8Array,
              limit_0: bigint,
              expiry_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  delegate(context: __compactRuntime.CircuitContext<PS>,
           parent_id_0: Uint8Array,
           child_id_0: Uint8Array,
           sub_agent_pk_0: Uint8Array,
           scope_0: Uint8Array,
           limit_0: bigint,
           expiry_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  assert_authorized(context: __compactRuntime.CircuitContext<PS>,
                    grant_id_0: Uint8Array,
                    scope_0: Uint8Array,
                    amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revoke(context: __compactRuntime.CircuitContext<PS>, grant_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  tick(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  active_grants: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  grant_holder: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  grant_issuer: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  grant_parent: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  grant_root: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  grant_scope: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  grant_limit: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  grant_expiry: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly epoch: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
