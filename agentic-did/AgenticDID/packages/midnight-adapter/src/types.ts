/**
 * Midnight Adapter Types
 */

export type CredentialStatus = 'valid' | 'revoked' | 'expired' | 'unknown';

export type CredentialPolicy = {
  role: string;
  scopes: string[];
};

export type VerifyReceiptInput = {
  cred_hash: string;
  attestation: string;
};

export type VerifyReceiptResult = {
  status: CredentialStatus;
  policy?: CredentialPolicy;
  verified_at?: number;
  error?: string;
};

export type MidnightAdapterConfig = {
  proofServerUrl?: string;
  networkId?: string;
  enableMockMode?: boolean;
};
