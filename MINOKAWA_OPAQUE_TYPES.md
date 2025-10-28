# Minokawa Opaque Data Types

**Official Documentation**  
**Language**: Minokawa (Compact) 0.18.0  
**Compiler**: 0.26.0  
**Updated**: October 28, 2025

---

## What Are Opaque Data Types?

### Transparent vs Opaque

**Transparent Data Types**:
- Inner structure is visible and accessible
- Operations on the data can be understood by inspecting structure
- **Drawback**: Lesser type safety - easier to make type errors

**Opaque Data Types**:
- Present an **interface** without sharing the actual concrete data structure
- Can only be manipulated by calling subroutines with access to the hidden structure
- Follow **information hiding** principle

### Benefits of Opaque Types

✅ **More Resilient Code**
- Design decisions segregated from implementation
- Implementations can be improved/changed without breaking dependents

✅ **Robust Against Change**
- Defensively code parts most likely to change
- Inner details not depended upon by external code

---

## Midnight Opaque Types

Opaque types in Minokawa are a **type system feature** that allow **"foreign" JavaScript data** to be:
- ✅ Stored in contract state
- ✅ Passed around between functions
- ✅ Retrieved by DApps
- ❌ **NOT inspected** by Compact code

### Supported Opaque Types

| Type | Description | JavaScript Type | On-Chain Representation |
|------|-------------|-----------------|-------------------------|
| `Opaque<'string'>` | String data | `string` | UTF-8 encoding |
| `Opaque<'Uint8Array'>` | Byte array data | `Uint8Array` | Array of bytes |

---

## Critical Understanding

### Opaque in Compact, Transparent in JavaScript

> ⚠️ **IMPORTANT**: These types are opaque **only within Compact**. They are **transparent** in a DApp's JavaScript code.

**In Compact (Minokawa)**:
- Cannot inspect contents
- Cannot manipulate data
- Can only store and pass around

**In JavaScript/TypeScript**:
- Full access to data
- Can read, modify, transform
- Normal JavaScript operations

**On-Chain**:
- Representation is **NOT hidden**
- `Uint8Array` → stored as array of bytes
- `string` → stored as UTF-8 encoding

---

## Declaration and Usage

### Ledger Storage
```compact
// Store opaque data in contract state
ledger userMessage: Opaque<'string'>;
ledger binaryData: Opaque<'Uint8Array'>;
```

### Circuit Parameters and Returns
```compact
// Accept opaque data from DApp
export circuit storeMessage(msg: Opaque<'string'>): [] {
  userMessage = msg;  // Can store it
  // Cannot inspect or manipulate msg in Compact!
}

// Return opaque data to DApp
export circuit getMessage(): Opaque<'string'> {
  return userMessage;  // Can return it
}
```

### Default Values
```compact
const emptyString = default<Opaque<'string'>>;      // ""
const emptyArray = default<Opaque<'Uint8Array'>>;   // new Uint8Array(0)
```

---

## Example: Bulletin Board Pattern

From the Midnight developer tutorial:

### Compact Contract
```compact
import CompactStandardLibrary;

// Store messages as opaque strings
ledger messages: Map<Bytes<32>, Opaque<'string'>>;

// Post a message (Compact can't read it)
export circuit post(
  messageId: Bytes<32>,
  content: Opaque<'string'>
): [] {
  // Compact code cannot inspect 'content'
  // But it CAN store it
  messages.insert(disclose(messageId), content);
}

// Retrieve a message (return to JavaScript)
export circuit takeDown(messageId: Bytes<32>): Opaque<'string'> {
  assert(messages.member(disclose(messageId)), "Message not found");
  
  const content = messages.lookup(disclose(messageId));
  
  // Remove from ledger
  messages.remove(disclose(messageId));
  
  // Return to JavaScript (which CAN read it)
  return content;
}
```

### TypeScript DApp
```typescript
// JavaScript can inspect and manipulate the opaque data!
async function postMessage(messageId: Uint8Array, text: string) {
  // Pass string to Compact (becomes opaque in circuit)
  await contract.post(messageId, text);
}

async function retrieveMessage(messageId: Uint8Array): Promise<string> {
  // Receive opaque string from Compact
  const content = await contract.takeDown(messageId);
  
  // In JavaScript, we can read and use it normally!
  console.log("Retrieved:", content);
  return content;
}
```

---

## Common Patterns

### 1. Store User-Provided Data
```compact
ledger userData: Map<Bytes<32>, Opaque<'string'>>;

export circuit storeUserData(
  userId: Bytes<32>,
  data: Opaque<'string'>
): [] {
  userData.insert(disclose(userId), data);
}
```

**Use Case**: Store JSON, formatted text, or arbitrary user content that Compact doesn't need to understand.

---

### 2. Pass-Through Data
```compact
witness getUserInput(): Opaque<'string'>;

export circuit processWithPassThrough(): Opaque<'string'> {
  const input = getUserInput();
  
  // Compact can't inspect it, just passes it through
  return input;
}
```

**Use Case**: Compact validates or coordinates, JavaScript handles data.

---

### 3. Binary Metadata
```compact
struct Record {
  id: Bytes<32>;
  metadata: Opaque<'Uint8Array'>;
  timestamp: Uint<64>;
}

ledger records: List<Record>;

export circuit addRecord(
  id: Bytes<32>,
  meta: Opaque<'Uint8Array'>,
  time: Uint<64>
): [] {
  const record = Record { id: id, metadata: meta, timestamp: time };
  records.pushFront(record);
}
```

**Use Case**: Store encoded data, serialized protobuf, or other binary formats.

---

## Type Safety with Opaque Types

### Compile-Time Type Checking
```compact
ledger stringData: Opaque<'string'>;
ledger byteData: Opaque<'Uint8Array'>;

export circuit wrongAssignment(s: Opaque<'string'>): [] {
  // ❌ COMPILE ERROR: Type mismatch!
  // byteData = s;
  
  // ✅ CORRECT: Types match
  stringData = s;
}
```

### Prevents Accidental Misuse
```compact
export circuit cannotInspect(data: Opaque<'string'>): [] {
  // ❌ COMPILE ERROR: Cannot access string methods in Compact
  // const len = data.length;
  
  // ❌ COMPILE ERROR: Cannot manipulate opaque data
  // const upper = data.toUpperCase();
  
  // ✅ CORRECT: Can only store or pass through
  stringData = data;
}
```

---

## When to Use Opaque Types

### ✅ Good Use Cases

1. **User-Generated Content**
   - Messages, comments, posts
   - JSON data structures
   - Formatted text

2. **Application-Specific Data**
   - Serialized protocol buffers
   - Encoded metadata
   - Binary blobs

3. **Pass-Through Scenarios**
   - Compact validates signatures/proofs
   - JavaScript handles business logic

4. **Privacy-Preserving Storage**
   - Store encrypted data on-chain
   - Compact doesn't need to decrypt
   - DApp decrypts in JavaScript

### ❌ Avoid When

1. **Compact Needs to Validate Content**
   - Use proper Compact types instead
   - Allows in-circuit validation

2. **Data Structure Matters for Logic**
   - Use structs, tuples, or other Compact types
   - Enables type-safe operations

3. **Need to Perform Calculations**
   - Use `Uint`, `Field`, etc.
   - Allows arithmetic in circuits

---

## TypeScript Integration

### Type Representations

| Minokawa Type | TypeScript Type |
|---------------|-----------------|
| `Opaque<'string'>` | `string` |
| `Opaque<'Uint8Array'>` | `Uint8Array` |

### Runtime Behavior

**From TypeScript to Compact**:
```typescript
// JavaScript → Compact
const message: string = "Hello, Midnight!";
await contract.storeMessage(messageId, message);
// Becomes Opaque<'string'> in Compact
```

**From Compact to TypeScript**:
```typescript
// Compact → JavaScript
const message: string = await contract.getMessage(messageId);
// Was Opaque<'string'> in Compact, now normal string
console.log(message.toUpperCase()); // ✅ Works in JavaScript!
```

---

## Comparison with Other Types

| Feature | Opaque<'string'> | Bytes<n> | String Literal |
|---------|------------------|----------|----------------|
| **Compact Inspection** | ❌ No | ✅ Yes | ✅ Yes |
| **Variable Length** | ✅ Yes | ❌ No | ❌ No |
| **JavaScript Type** | `string` | `Uint8Array` | `Uint8Array` |
| **Use Case** | User content | Fixed-size data | Compile-time constants |

| Feature | Opaque<'Uint8Array'> | Bytes<n> | Vector<n, Uint<8>> |
|---------|----------------------|----------|--------------------|
| **Compact Inspection** | ❌ No | ✅ Yes | ✅ Yes |
| **Variable Length** | ✅ Yes | ❌ No | ❌ No |
| **JavaScript Type** | `Uint8Array` | `Uint8Array` | `bigint[]` |
| **Circuit Operations** | ❌ No | ✅ Yes | ✅ Yes |

---

## Security Considerations

### ⚠️ Data Is Visible On-Chain

```compact
ledger secretMessage: Opaque<'string'>;  // NOT encrypted!

export circuit storeSecret(msg: Opaque<'string'>): [] {
  secretMessage = msg;
  // ⚠️ Anyone can read this from the blockchain!
}
```

**Solution**: Encrypt in JavaScript before passing to Compact
```typescript
const encrypted = encrypt(plaintext, key);
await contract.storeSecret(messageId, encrypted);
// Now encrypted data is on-chain
```

### ✅ Type Safety Preserved

Even though Compact can't inspect opaque data, **type checking still works**:
- Can't mix `Opaque<'string'>` with `Opaque<'Uint8Array'>`
- Can't assign to wrong type variables
- Compiler enforces correct usage

---

## Advanced Patterns

### Mixed Storage
```compact
struct UserProfile {
  userId: Bytes<32>;
  publicName: Bytes<32>;      // Compact can hash/compare
  privateData: Opaque<'string'>;  // JavaScript-only data
  timestamp: Uint<64>;        // Compact can compare
}

ledger profiles: Map<Bytes<32>, UserProfile>;
```

### Conditional Pass-Through
```compact
export circuit conditionalStore(
  condition: Boolean,
  data: Opaque<'string'>
): [] {
  if (condition) {
    // Can store conditionally
    messages.insert(disclose(someId), data);
  }
  // Compact logic works, even though data is opaque
}
```

---

## Best Practices

### 1. Document Opaque Data Format
```compact
// Store JSON-encoded user preferences
// Format: {"theme": "dark", "language": "en"}
ledger userPreferences: Map<Bytes<32>, Opaque<'string'>>;
```

### 2. Validate in JavaScript
```typescript
// Validate before sending to Compact
function storePreferences(userId: Uint8Array, prefs: UserPrefs) {
  // Validate structure
  if (!prefs.theme || !prefs.language) {
    throw new Error("Invalid preferences");
  }
  
  // Serialize to opaque string
  const encoded = JSON.stringify(prefs);
  
  // Send to Compact
  return contract.storeUserPreferences(userId, encoded);
}
```

### 3. Handle Errors Gracefully
```typescript
// Handle potential decode errors
async function getPreferences(userId: Uint8Array): Promise<UserPrefs> {
  const encoded = await contract.getUserPreferences(userId);
  
  try {
    return JSON.parse(encoded);
  } catch (e) {
    console.error("Failed to parse preferences:", e);
    return defaultPreferences;
  }
}
```

---

## Limitations

### Cannot Do in Compact

❌ Inspect contents  
❌ Perform string operations  
❌ Access array elements  
❌ Calculate length  
❌ Compare contents (except `==` for equality)  
❌ Concatenate strings  
❌ Slice or substring  

### Can Do in Compact

✅ Store in ledger  
✅ Pass to/from circuits  
✅ Return from circuits  
✅ Store in structs  
✅ Put in collections (Map, List, etc.)  
✅ Compare for equality (`==`)  
✅ Use as witness return types  

---

## Quick Reference

### Declaration
```compact
ledger opaqueString: Opaque<'string'>;
ledger opaqueBytes: Opaque<'Uint8Array'>;
```

### Storage
```compact
export circuit store(data: Opaque<'string'>): [] {
  opaqueString = data;
}
```

### Retrieval
```compact
export circuit retrieve(): Opaque<'string'> {
  return opaqueString;
}
```

### In Collections
```compact
ledger messages: Map<Bytes<32>, Opaque<'string'>>;
ledger dataList: List<Opaque<'Uint8Array'>>;
```

### TypeScript Interface
```typescript
// Circuit signatures
async store(data: string): Promise<void>;
async retrieve(): Promise<string>;
```

---

## Related Documentation

- **Type System**: See MINOKAWA_LANGUAGE_REFERENCE.md
- **Ledger ADTs**: See MINOKAWA_LEDGER_DATA_TYPES.md
- **TypeScript Integration**: See language reference TypeScript Target section

---

**Status**: ✅ Complete Opaque Types Reference  
**Source**: Official Midnight Documentation  
**Version**: Minokawa 0.18.0  
**Last Updated**: October 28, 2025
