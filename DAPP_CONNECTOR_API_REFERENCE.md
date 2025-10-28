# DApp Connector API Reference

**@midnight-ntwrk/dapp-connector-api v3.0.0**  
**Midnight DApp Connector Interface**  
**Updated**: October 28, 2025

> 🔌 **Connect your DApp to Midnight wallets**

---

## Overview

The Midnight DApp connector API provides a comprehensive interface for DApp connector operations, defining:
- Wallet state structure and exposure
- Methods for interacting with wallets
- Types and variables used within the API

**Purpose**: Enable DApps to interact with user wallets through a standardized browser interface.

---

## Installation

```bash
# Using Yarn
yarn add @midnight-ntwrk/dapp-connector-api

# Using NPM
npm install @midnight-ntwrk/dapp-connector-api
```

---

## Global API Access

The DApp connector API is exposed through the global window object:

```typescript
window.midnight.{walletName}
```

**Example**:
```typescript
window.midnight.midnightLace
```

---

## API Properties

### name

The name of the wallet that implements the API.

```typescript
readonly name: string;
```

**Usage**:
```typescript
const walletName = window.midnight.{walletName}.name;
console.log('Wallet name:', walletName);
```

---

### apiVersion

Provides a semver string version of the DApp connector API.

```typescript
readonly apiVersion: string;
```

**Usage**:
```typescript
const apiVersion = window.midnight.{walletName}.apiVersion;
console.log('API version:', apiVersion);
```

---

## API Methods

### enable()

Requests authorization from the user to access the wallet API.

```typescript
enable(): Promise<DAppConnectorWalletAPI>
```

**Returns**: Promise that resolves to `DAppConnectorWalletAPI` if authorized, or rejects with an error.

**Usage**:
```typescript
try {
  const api = await window.midnight.{walletName}.enable();
  // api is available here
} catch (error) {
  console.error('Authorization failed:', error);
}
```

**User Flow**:
1. DApp calls `enable()`
2. Wallet displays authorization prompt to user
3. User approves/rejects
4. Promise resolves/rejects accordingly

---

### isEnabled()

Checks whether the DApp is currently authorized to access the API.

```typescript
isEnabled(): Promise<boolean>
```

**Returns**: Promise that resolves to `true` if authorized, `false` otherwise.

**Usage**:
```typescript
try {
  const isAuthorized = await window.midnight.{walletName}.isEnabled();
  if (isAuthorized) {
    console.log('DApp is authorized');
  }
} catch (error) {
  console.error('Error checking authorization:', error);
}
```

---

### serviceUriConfig()

Returns the node, indexer, and proving server URIs configured in the wallet.

```typescript
serviceUriConfig(): Promise<ServiceUriConfig>
```

**Returns**: Promise that resolves to `ServiceUriConfig` containing:
- **Node URL**: The node the wallet is pointing to
- **Indexer URL**: The indexer URL the wallet is pointing to
- **Proving Server URL**: The proving server URL the wallet is pointing to

**Usage**:
```typescript
try {
  const config = await window.midnight.{walletName}.serviceUriConfig();
  console.log('Node URL:', config.nodeUrl);
  console.log('Indexer URL:', config.indexerUrl);
  console.log('Proving Server URL:', config.provingServerUrl);
} catch (error) {
  console.error('Error getting service config:', error);
}
```

⚠️ **Note**: The DApp must be authorized before calling this method, otherwise it will throw an error.

---

## DAppConnectorWalletAPI

After successful authorization via `enable()`, you receive an instance of `DAppConnectorWalletAPI` with the following methods:

### balanceAndProveTransaction()

Balances and proves a transaction in a single operation.

```typescript
balanceAndProveTransaction(
  transaction: Transaction, 
  newCoins?: CoinInfo[]
): Promise<BalancedAndProvenTransaction>
```

**Parameters**:
- `transaction` (required): The transaction to balance and prove
- `newCoins` (optional): Array of new coins to create

**Returns**: Promise that resolves to a balanced and proven transaction.

**Usage**:
```typescript
try {
  const transaction = /* create your transaction */;
  
  const balancedAndProvenTx = await api.balanceAndProveTransaction(transaction);
  
  console.log('Transaction balanced and proven:', balancedAndProvenTx);
} catch (error) {
  console.error('Error balancing/proving transaction:', error);
}
```

---

### submitTransaction()

Submits a balanced and proven transaction to the network.

```typescript
submitTransaction(transaction: Transaction): Promise<SubmittedTransaction>
```

**Parameters**:
- `transaction` (required): The balanced and proven transaction to submit

**Returns**: Promise that resolves to the submitted transaction details.

**Usage**:
```typescript
try {
  const submittedTx = await api.submitTransaction(balancedAndProvenTx);
  
  console.log('Transaction submitted:', submittedTx);
  console.log('Transaction hash:', submittedTx.hash);
} catch (error) {
  console.error('Error submitting transaction:', error);
}
```

---

### state()

Returns the current wallet state.

```typescript
state(): Promise<DAppConnectorWalletState>
```

**Returns**: Promise that resolves to `DAppConnectorWalletState` object containing wallet information.

**Usage**:
```typescript
try {
  const walletState = await api.state();
  
  console.log('Wallet state:', walletState);
  console.log('Address:', walletState.address);
  console.log('Balance:', walletState.balance);
} catch (error) {
  console.error('Error getting wallet state:', error);
}
```

---

### ⚠️ Deprecated Methods

#### balanceTransaction()

**Status**: Deprecated - will be removed in version 2.0.0  
**Replacement**: Use `balanceAndProveTransaction()` instead

```typescript
balanceTransaction(transaction: Transaction): Promise<BalancedTransaction>
```

---

#### proveTransaction()

**Status**: Deprecated - will be removed in version 2.0.0  
**Replacement**: Use `balanceAndProveTransaction()` instead

```typescript
proveTransaction(transaction: Transaction): Promise<ProvenTransaction>
```

---

## Complete Examples

### Example 1: Authorize and Submit Transaction

```typescript
// Complete flow from authorization to submission
async function submitMyTransaction() {
  try {
    // Step 1: Authorize the DApp
    const api = await window.midnight.{walletName}.enable();
    console.log('DApp authorized');
    
    // Step 2: Create your transaction
    // (See transaction creation guide for details)
    const transaction = createMyTransaction();
    
    // Step 3: Balance and prove the transaction
    const balancedAndProvenTx = await api.balanceAndProveTransaction(transaction);
    console.log('Transaction balanced and proven');
    
    // Step 4: Submit the transaction
    const submittedTx = await api.submitTransaction(balancedAndProvenTx);
    console.log('Transaction submitted:', submittedTx.hash);
    
    return submittedTx;
  } catch (error) {
    console.error('Transaction flow failed:', error);
    throw error;
  }
}
```

---

### Example 2: Check Authorization Before Action

```typescript
async function performWalletAction() {
  try {
    // Check if already authorized
    const isAuthorized = await window.midnight.{walletName}.isEnabled();
    
    let api;
    if (isAuthorized) {
      console.log('Already authorized, using existing session');
      // If authorized, we can directly access the API
      // (Implementation may vary by wallet)
    } else {
      console.log('Not authorized, requesting permission');
      api = await window.midnight.{walletName}.enable();
    }
    
    // Get wallet state
    const state = await api.state();
    console.log('Wallet address:', state.address);
    
    return state;
  } catch (error) {
    console.error('Error performing wallet action:', error);
    throw error;
  }
}
```

---

### Example 3: Get Service Configuration

```typescript
async function setupDApp() {
  try {
    // Authorize first
    const api = await window.midnight.{walletName}.enable();
    
    // Get the wallet's service configuration
    const config = await window.midnight.{walletName}.serviceUriConfig();
    
    // Configure your DApp to use the same endpoints
    const nodeUrl = config.nodeUrl;
    const indexerUrl = config.indexerUrl;
    const provingServerUrl = config.provingServerUrl;
    
    console.log('Configuring DApp with wallet endpoints:');
    console.log('  Node:', nodeUrl);
    console.log('  Indexer:', indexerUrl);
    console.log('  Proving Server:', provingServerUrl);
    
    // Initialize your DApp services with these URLs
    initializeDAppServices(nodeUrl, indexerUrl, provingServerUrl);
    
  } catch (error) {
    console.error('Error setting up DApp:', error);
    throw error;
  }
}
```

---

### Example 4: Complete Transaction with New Coins

```typescript
async function createAndSubmitTransactionWithCoins() {
  try {
    const api = await window.midnight.{walletName}.enable();
    
    // Create transaction
    const transaction = createMyTransaction();
    
    // Define new coins to create
    const newCoins: CoinInfo[] = [
      {
        nonce: generateNonce(),
        type: tokenType,
        value: 1000n
      }
    ];
    
    // Balance, prove, and submit
    const balancedAndProvenTx = await api.balanceAndProveTransaction(
      transaction,
      newCoins
    );
    
    const submittedTx = await api.submitTransaction(balancedAndProvenTx);
    
    console.log('Transaction with new coins submitted:', submittedTx);
    return submittedTx;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

## Complete API Reference

### Classes

#### APIError

Whenever there's a function called that returns a promise, an error with this shape can be thrown.

```typescript
class APIError extends CustomError {
  constructor(code: ErrorCode, reason: string);
  
  code: ErrorCode;      // The code of the error that's thrown
  reason: string;       // The reason the error is thrown
}
```

**Properties**:
- `code`: The error code (see ErrorCodes below)
- `reason`: Human-readable error description

---

### Interfaces

#### DAppConnectorAPI

DApp Connector API Definition. When errors occur in functions returning a promise, they should be thrown as `APIError`.

```typescript
interface DAppConnectorAPI {
  // Properties
  name: string;                    // The name of the wallet
  apiVersion: string;              // Semver string (check compatibility)
  
  // Methods
  enable: () => Promise<DAppConnectorWalletAPI>;
  isEnabled: () => Promise<boolean>;
  serviceUriConfig: () => Promise<ServiceUriConfig>;
}
```

**Properties**:
- `name`: The name of the wallet
- `apiVersion`: Semver string. DApps are encouraged to check compatibility whenever this changes

**Methods**:
- `enable()`: Request access to the wallet, returns the wallet API on approval
- `isEnabled()`: Check if the wallet has authorized the dapp
- `serviceUriConfig()`: Request the services (indexer, node, and proof server) URIs

---

#### DAppConnectorWalletAPI

Shape of the Wallet API in the DApp Connector.

```typescript
interface DAppConnectorWalletAPI {
  // Current Methods
  balanceAndProveTransaction: (
    tx: Transaction, 
    newCoins: CoinInfo[]
  ) => Promise<Transaction>;
  
  state: () => Promise<DAppConnectorWalletState>;
  
  submitTransaction: (tx: Transaction) => Promise<string>;
  
  // Deprecated Methods
  /** @deprecated Use balanceAndProveTransaction instead */
  balanceTransaction: (
    tx: Transaction, 
    newCoins: CoinInfo[]
  ) => Promise<BalanceTransactionToProve | NothingToProve>;
  
  /** @deprecated Use balanceAndProveTransaction instead */
  proveTransaction: (recipe: ProvingRecipe) => Promise<Transaction>;
}
```

**balanceAndProveTransaction()**:
- Balances the given transaction and proves it
- Parameters:
  - `tx`: Transaction to balance
  - `newCoins`: New coins created by transaction, which wallet will watch for
- Returns: Proved transaction or error

**state()**:
- Returns a promise with the exposed wallet state
- Returns: `Promise<DAppConnectorWalletState>`

**submitTransaction()**:
- Submits given transaction to the node
- Parameters:
  - `tx`: Transaction to submit
- Returns: First transaction identifier from identifiers list or error

**balanceTransaction()** (⚠️ Deprecated):
- Deprecated since version 1.1.0, will be removed in 2.0.0
- Use `balanceAndProveTransaction()` instead
- Balances the provided transaction
- The `newCoins` parameter should be used when a new coin is created (e.g., DApp mints a coin)
- Returns: `BalanceTransactionToProve` or `NothingToProve` recipe

**proveTransaction()** (⚠️ Deprecated):
- Deprecated since version 1.1.0, will be removed in 2.0.0
- Use `balanceAndProveTransaction()` instead
- Calls proving server with proving recipe
- Note: Proof generation is expensive and time-consuming

---

#### DAppConnectorWalletState

The shape of the wallet state that must be exposed.

```typescript
interface DAppConnectorWalletState {
  // Current (bech32m encoded)
  address: string;                    // Bech32m encoded address
  coinPublicKey: string;              // Bech32m encoded coin public key
  encryptionPublicKey: string;        // Bech32m encoded encryption public key
  
  // Legacy (deprecated, hex encoded)
  /** @deprecated Use address instead */
  addressLegacy: string;              // Hex: coinPublicKey + encryptionPublicKey
  /** @deprecated Use coinPublicKey instead */
  coinPublicKeyLegacy: string;        // Hex encoded coin public key
  /** @deprecated Use encryptionPublicKey instead */
  encryptionPublicKeyLegacy: string;  // Hex encoded encryption public key
}
```

**Properties**:
- `address`: The bech32m encoded address (current)
- `coinPublicKey`: The bech32m encoded coin public key (current)
- `encryptionPublicKey`: The bech32m encoded encryption public key (current)
- `addressLegacy`: ⚠️ Deprecated - concatenation of coinPublicKey and encryptionPublicKey (hex)
- `coinPublicKeyLegacy`: ⚠️ Deprecated - hex encoded coin public key
- `encryptionPublicKeyLegacy`: ⚠️ Deprecated - hex encoded encryption public key

---

#### ServiceUriConfig

The services configuration.

```typescript
interface ServiceUriConfig {
  substrateNodeUri: string;     // Substrate node URI
  indexerUri: string;           // Indexer HTTP URI
  indexerWsUri: string;         // Indexer WebSocket URI
  proverServerUri: string;      // Prover server URI
}
```

**Properties**:
- `substrateNodeUri`: The substrate node URI
- `indexerUri`: The indexer HTTP URI
- `indexerWsUri`: The indexer WebSocket URI
- `proverServerUri`: The proving server URI

---

### Type Aliases

#### ErrorCode

```typescript
type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
```

ErrorCode type definition extracted from ErrorCodes variable.

---

### Variables

#### ErrorCodes

The following error codes can be thrown by the dapp connector.

```typescript
const ErrorCodes = {
  InternalError: 'InternalError',      // Connector couldn't process request
  InvalidRequest: 'InvalidRequest',    // Malformed request (e.g., bad transaction)
  Rejected: 'Rejected'                 // User rejected the request
} as const;
```

**Error Codes**:
- `InternalError`: The dapp connector wasn't able to process the request
- `InvalidRequest`: Can be thrown in various circumstances, e.g. malformed transaction
- `Rejected`: The user rejected the request

---

## Types (Detailed)

### ServiceUriConfig

```typescript
interface ServiceUriConfig {
  substrateNodeUri: string;     // Substrate node URI
  indexerUri: string;           // Indexer HTTP URI
  indexerWsUri: string;         // Indexer WebSocket URI
  proverServerUri: string;      // Prover server URI
}
```

---

### DAppConnectorWalletState

```typescript
interface DAppConnectorWalletState {
  address: string;                    // Bech32m encoded address
  coinPublicKey: string;              // Bech32m encoded coin public key
  encryptionPublicKey: string;        // Bech32m encoded encryption public key
  addressLegacy: string;              // Deprecated: hex encoded
  coinPublicKeyLegacy: string;        // Deprecated: hex encoded
  encryptionPublicKeyLegacy: string;  // Deprecated: hex encoded
}
```

---

### Transaction

Transaction object structure.

```typescript
interface Transaction {
  // Transaction fields
  // See @midnight-ntwrk/compact-runtime for full definition
}
```

---

### CoinInfo

Coin information for creating new coins.

```typescript
interface CoinInfo {
  nonce: Nonce;       // Coin's randomness
  type: TokenType;    // Token type
  value: bigint;      // Coin value (64-bit)
}
```

---

## Error Handling

### Common Errors

**1. User Rejected Authorization**
```typescript
try {
  const api = await window.midnight.{walletName}.enable();
} catch (error) {
  if (error.code === 'USER_REJECTED') {
    console.log('User rejected authorization request');
  }
}
```

**2. DApp Not Authorized**
```typescript
try {
  const config = await window.midnight.{walletName}.serviceUriConfig();
} catch (error) {
  if (error.code === 'NOT_AUTHORIZED') {
    console.log('DApp must be authorized first');
    // Request authorization
    await window.midnight.{walletName}.enable();
  }
}
```

**3. Transaction Failed**
```typescript
try {
  const tx = await api.submitTransaction(balancedAndProvenTx);
} catch (error) {
  console.error('Transaction failed:', error.message);
  // Handle transaction failure
}
```

---

## Best Practices

### 1. Check Authorization Status

```typescript
// Always check before performing operations
const isAuthorized = await window.midnight.{walletName}.isEnabled();
if (!isAuthorized) {
  await window.midnight.{walletName}.enable();
}
```

### 2. Handle User Rejection Gracefully

```typescript
try {
  const api = await window.midnight.{walletName}.enable();
} catch (error) {
  // Show user-friendly message
  showMessage('Wallet access is required to continue');
}
```

### 3. Use Wallet's Service Configuration

```typescript
// Always use the wallet's configured endpoints
const config = await window.midnight.{walletName}.serviceUriConfig();
// Configure your DApp accordingly
```

### 4. Validate Transactions Before Submission

```typescript
// Ensure transaction is balanced and proven
if (transaction.isBalanced && transaction.isProven) {
  await api.submitTransaction(transaction);
}
```

---

## Migration Guide

### From Deprecated Methods

**Old Pattern** (Deprecated):
```typescript
const balanced = await api.balanceTransaction(tx);
const proven = await api.proveTransaction(balanced);
await api.submitTransaction(proven);
```

**New Pattern** (Recommended):
```typescript
const balancedAndProven = await api.balanceAndProveTransaction(tx);
await api.submitTransaction(balancedAndProven);
```

---

## Browser Compatibility

- ✅ Chrome/Chromium (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Edge (v90+)

---

## Security Considerations

### 1. Authorization Scope

- Authorization is per-origin (domain)
- User must explicitly approve each DApp
- Authorization can be revoked by user at any time

### 2. Transaction Signing

- All transactions require user approval
- Users see transaction details before signing
- Private keys never leave the wallet

### 3. Data Privacy

- DApp cannot access wallet's private keys
- Transaction details are shown to user
- State queries are permission-gated

---

## Related Documentation

- **[i_am_Midnight_LLM_ref.md](i_am_Midnight_LLM_ref.md)** - Compact runtime API
- **[HOW_MIDNIGHT_WORKS.md](HOW_MIDNIGHT_WORKS.md)** - Platform overview
- **[MIDNIGHT_TRANSACTION_STRUCTURE.md](MIDNIGHT_TRANSACTION_STRUCTURE.md)** - Transaction details

---

## Version Information

- **Package**: @midnight-ntwrk/dapp-connector-api
- **Version**: 3.0.0
- **Last Updated**: October 28, 2025
- **API Version**: Semver compatible

---

**Status**: ✅ Complete DApp Connector API Reference  
**Purpose**: Enable seamless wallet integration for Midnight DApps  
**Last Updated**: October 28, 2025
