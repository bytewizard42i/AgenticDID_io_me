# Midnight Gateway Service

**ZK Proof Verification Service for AgenticDID Protocol**

Port: `3003` (configurable)

---

## 🎯 Purpose

The Midnight Gateway is the bridge between AgenticDID task agents and Midnight Network. It provides:

1. **ZK Proof Verification** - Verify credentials using Midnight's ZK technology
2. **Fraud Detection** - Detect brand impersonation and category mismatches
3. **Issuer Validation** - Verify issuer categories and verification levels
4. **Credential Status** - Check revocation and expiration
5. **HTTP API** - REST endpoints for task agents to verify credentials

---

## 🏗️ Architecture

```
Task Agents (Banker, Crypto, etc.)
         ↓
    HTTP Request
         ↓
┌─────────────────────────┐
│  Midnight Gateway       │
│  (Port 3003)            │
│                         │
│  ┌───────────────────┐ │
│  │ Fastify Server    │ │
│  └────────┬──────────┘ │
│           ↓             │
│  ┌───────────────────┐ │
│  │ ZK Verifier       │ │
│  │ - Fraud Detector  │ │
│  │ - Contract Loader │ │
│  └────────┬──────────┘ │
│           ↓             │
│  ┌───────────────────┐ │
│  │ Midnight Providers│ │
│  │ - Proof Provider  │ │
│  │ - Public Data     │ │
│  └────────┬──────────┘ │
└───────────┼────────────┘
            ↓
    Midnight Network
    - Proof Server (6300)
    - Contracts (AgenticDIDRegistry)
```

---

## 📦 Installation

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

---

## 🚀 Usage

### Development Mode

```bash
# Start with hot reload
bun run dev

# Start in production mode
bun run start

# Build TypeScript
bun run build
```

### Docker

```bash
# Build image
docker build -t midnight-gateway .

# Run container
docker run -p 3003:3003 --env-file .env midnight-gateway
```

---

## 🔌 API Endpoints

### **GET /** 
Service information

**Response:**
```json
{
  "service": "AgenticDID Midnight Gateway",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

---

### **GET /health**
Health check

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "providers": {
    "proof": true,
    "publicData": true,
    "zkConfig": true
  }
}
```

---

### **POST /verify**
Verify a credential presentation

**Request Body:**
```json
{
  "credentialType": "FINANCIAL_ACCOUNT",
  "issuerDid": "did:agentic:issuer:boa:main",
  "proof": "base64-encoded-zk-proof",
  "challenge": "optional-challenge-nonce"
}
```

**Success Response (200):**
```json
{
  "valid": true,
  "issuerDid": "did:agentic:issuer:boa:main",
  "issuerCategory": "CORPORATION",
  "verificationLevel": "REGULATED_ENTITY",
  "credentialType": "FINANCIAL_ACCOUNT",
  "riskScore": "LOW"
}
```

**Failure Response (403):**
```json
{
  "valid": false,
  "issuerDid": "did:agentic:issuer:fake:boa",
  "issuerCategory": "SELF_SOVEREIGN",
  "error": "BRAND_IMPERSONATION",
  "errorCode": "FRAUD_DETECTED",
  "riskScore": "CRITICAL",
  "riskFlags": [
    "Self-sovereign issuer claiming to be 'Bank of America'",
    "Real Bank of America should be CORPORATION with high verification"
  ]
}
```

---

### **GET /issuer/:did**
Get issuer information

**Response:**
```json
{
  "issuerDid": "did:agentic:issuer:boa:main",
  "category": "CORPORATION",
  "verificationLevel": "REGULATED_ENTITY",
  "legalName": "Bank of America, N.A.",
  "claimedBrandName": "Bank of America",
  "isRevoked": false,
  "isActive": true
}
```

---

### **GET /stats**
Service statistics

**Response:**
```json
{
  "uptime": 3600,
  "config": {
    "mode": "UNDEPLOYED",
    "networkId": "undeployed"
  },
  "contracts": {
    "loaded": 3,
    "types": ["AgenticDIDRegistry", "CredentialVerifier", "ProofStorage"]
  },
  "verifier": {
    "cacheStats": {
      "size": 42,
      "enabled": true,
      "ttl": 60
    }
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3003` |
| `HOST` | Server host | `0.0.0.0` |
| `DEPLOYMENT_MODE` | Network mode | `UNDEPLOYED` |
| `PROOF_SERVER_URL` | Proof server | `http://localhost:6300` |
| `CONTRACTS_PATH` | Compiled contracts | `../../protocol/compiled` |
| `VERIFIER_STRICT_MODE` | Strict verification | `true` |
| `VERIFIER_CACHE_TTL_SECONDS` | Cache duration | `60` |

See `.env.example` for all options.

---

## 🛡️ Security Features

### Fraud Detection

**Brand Impersonation Detection:**
- Blocks SELF_SOVEREIGN issuers claiming well-known brands
- Example: Self-sovereign claiming "Bank of America" → BLOCKED

**Category Validation:**
- Enforces issuer categories for credential types
- Example: SELF_SOVEREIGN issuing VOTER_ELIGIBILITY → BLOCKED

**Verification Level Checks:**
- Ensures minimum verification levels
- Example: UNVERIFIED issuer for FINANCIAL_ACCOUNT → BLOCKED

### Credential Status

- ✅ Checks credential revocation status
- ✅ Validates expiration dates
- ✅ Verifies issuer is active
- ✅ Confirms credential matches issuer category

---

## 📊 Monitoring

### Logs

Structured JSON logs via Pino:
```bash
# View logs
bun run start | bunyan

# Filter by level
bun run start | bunyan -l warn
```

### Metrics

**Built-in metrics:**
- Verification count
- Success/failure rates
- Average verification time
- Cache hit rate

**Access via `/stats` endpoint**

---

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3003/health

# Verify credential
curl -X POST http://localhost:3003/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credentialType": "FINANCIAL_ACCOUNT",
    "issuerDid": "did:agentic:issuer:boa:main",
    "proof": "..."
  }'
```

### Integration Tests

```bash
# Run tests
bun test

# Run with coverage
bun test --coverage
```

---

## 🔧 Development

### Project Structure

```
backend/midnight/
├── src/
│   ├── index.ts              # Main server
│   ├── config.ts             # Configuration
│   ├── types.ts              # Type definitions
│   ├── providers.ts          # Midnight providers
│   ├── contract-loader.ts    # Contract management
│   ├── verifier.ts           # ZK verification
│   ├── fraud-detection.ts    # Fraud detection
│   └── utils/
│       ├── retry.ts          # Retry logic
│       └── logging-wrapper.ts # Provider logging
├── .env.example              # Config template
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Endpoints

1. Add route in `index.ts` → `registerRoutes()`
2. Add types in `types.ts`
3. Add tests
4. Update this README

---

## 🐛 Troubleshooting

### Proof Server Connection Failed

```
Error: Cannot connect to proof server at http://localhost:6300
```

**Solution**: Start local proof server
```bash
docker run -p 6300:6300 midnightnetwork/proof-server:4.0.0
```

### Contract Loading Failed

```
Error: Failed to load contract AgenticDIDRegistry
```

**Solution**: Ensure contracts are compiled
```bash
cd ../../protocol
compact compile contracts/AgenticDIDRegistry.compact
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3003
```

**Solution**: Change port in `.env`
```bash
PORT=3004
```

---

## 📚 Related Documentation

- **[ONE_PERFECT_CHECK.md](../../docs-nerds-only/ONE_PERFECT_CHECK.md)** - TD Bank philosophy
- **[AGENTS_AND_ISSUERS.md](../../docs-nerds-only/AGENTS_AND_ISSUERS.md)** - Protocol spec
- **[CASSIE_GUIDE.md](../../docs-nerds-only/CASSIE_GUIDE.md)** - Development guide
- **[LESSONS_LEARNED.md](../../docs-nerds-only/LESSONS_LEARNED.md)** - Mesh.js patterns

---

## 🚀 Production Deployment

### Requirements

- Bun >= 1.2 or Node >= 18
- Access to Midnight Network (devnet/testnet/mainnet)
- Compiled smart contracts
- Environment variables configured

### Docker Compose

```yaml
version: '3.8'
services:
  midnight-gateway:
    build: .
    ports:
      - "3003:3003"
    env_file:
      - .env
    depends_on:
      - proof-server
    restart: unless-stopped
```

---

**Built with 🌟 for AgenticDID Protocol**  
*One perfect check, then replicate.* 🎯
