# Verifier API (Backend)

**Privacy-Preserving Agent Credential Verification**

---

## Overview

This is the backend API server that verifies agent credentials and issues capability tokens. It acts as the "Midnight Gatekeeper" - ensuring only authorized agents can perform actions.

**Technology Stack:**
- **Fastify** - Web framework (2x faster than Express)
- **Bun** - JavaScript runtime (faster than Node.js)
- **TypeScript** - Type safety
- **JWT** - Capability token format

---

## What This API Does

### Core Responsibilities

1. **Challenge Generation**
   - Issues cryptographic challenges to prevent replay attacks
   - Includes random nonce + expiration timestamp
   - Ensures freshness of authentication

2. **Credential Verification**
   - Validates Verifiable Presentations (VPs) from agents
   - Checks credential status via Midnight adapter
   - Verifies role matches policy
   - Confirms proof authenticity

3. **Token Issuance**
   - Issues short-lived capability tokens (JWT)
   - Tokens grant specific permissions (scopes)
   - Tokens expire in 2 minutes (configurable)

4. **Health Monitoring**
   - Provides health check endpoint
   - Returns API status

---

## API Endpoints

### POST /challenge

Generate a verification challenge.

**Request:**
```json
{
  "aud": "https://example.com"
}
```

**Response:**
```json
{
  "nonce": "a3f2b8c1...",
  "aud": "https://example.com",
  "exp": 1699564800
}
```

**Purpose:** Frontend requests this before agent creates VP.

---

### POST /verify

Verify a Verifiable Presentation and issue capability token.

**Request:**
```json
{
  "vp": {
    "pid": "agent_id",
    "proof": "signature...",
    "sd_proof": "zk_proof...",
    "disclosed": {
      "role": "Banker",
      "scopes": ["bank:transfer", "bank:balance"]
    },
    "receipt": {
      "cred_hash": "credential_hash",
      "attestation": "signature"
    }
  },
  "challenge": {
    "nonce": "a3f2b8c1...",
    "aud": "https://example.com",
    "exp": 1699564800
  }
}
```

**Success Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "pid": "agent_id",
  "role": "Banker",
  "scopes": ["bank:transfer", "bank:balance"]
}
```

**Error Response:**
```json
{
  "error": "Credential revoked"
}
```

---

### GET /health

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1699564800
}
```

---

## File Structure

```
apps/verifier-api/
├── src/
│   ├── index.ts           # Main entry point (server setup)
│   ├── config.ts          # Configuration (env vars)
│   ├── routes.ts          # API route handlers
│   ├── verifier.ts        # VP verification logic
│   ├── challenge.ts       # Challenge generation
│   └── token.ts           # JWT capability token creation
│
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

---

## Running the API

### Development Mode

```bash
# From repository root
bun run dev

# Or directly
cd apps/verifier-api
bun run dev
```

**Access:** http://localhost:8787

### Production Mode

```bash
cd apps/verifier-api
bun run build
bun run start
```

---

## Configuration

### Environment Variables

```bash
# .env file
PORT=8787                           # API server port
JWT_SECRET=your_secret_here         # JWT signing secret (CHANGE IN PRODUCTION!)
TOKEN_TTL_SECONDS=120               # Token expiration (2 minutes)
MIDNIGHT_ADAPTER_URL=http://localhost:8788  # Midnight adapter (unused in demo)
NODE_ENV=development                # Environment
ISSUER=https://agenticdid.io        # JWT issuer claim
```

**SECURITY WARNING:**
- Change `JWT_SECRET` in production
- Use strong random secret: `openssl rand -base64 32`
- Never commit secrets to git

---

## Demo vs Production

### Demo Mode (Current)

**What's Mock:**
- Midnight adapter uses string matching (no blockchain)
- No real ZK proof verification
- Credential lookup is simulated
- Instant responses (<1ms)

**What's Real:**
- Full API endpoint contract
- Challenge-response protocol
- JWT token generation
- Error handling
- All HTTP flows

### Production Mode (Phase 2)

**Will Replace:**
- Mock Midnight adapter → Real Midnight SDK
- String matching → On-chain contract queries
- Simulated proofs → Real ZK verification
- <1ms response → ~500ms (proof verification)

**Will Keep:**
- Exact same API endpoints
- Same request/response format
- Same JWT structure
- Same error messages

---

## Verification Flow

```
1. Frontend requests challenge
   POST /challenge → { nonce, aud, exp }

2. Frontend builds VP with agent
   - Agent signs challenge
   - Creates proof bundle

3. Frontend submits VP for verification
   POST /verify with { vp, challenge }
   
   Server performs:
   a. Structure validation
   b. Credential lookup (Midnight adapter)
   c. Revocation check
   d. Role verification
   e. Proof validation

4. Server issues capability token
   Returns JWT with scopes

5. Frontend uses token for authorized actions
```

---

## Security Model

### Challenge-Response

**Prevents Replay Attacks:**
- Each challenge used only once
- Nonce is random and unpredictable
- Short expiration window (2 minutes)

### Role Verification

**Prevents Privilege Escalation:**
- Disclosed role must match credential policy
- Agent can't lie about permissions
- Registry is source of truth

### Capability Tokens

**Limited Authorization:**
- Short-lived (2 minutes default)
- Specific scopes only
- Cannot be forged (HMAC signed)
- Bound to agent (DPoP in production)

---

## Error Handling

### Common Errors

**400 Bad Request:**
- Invalid VP structure
- Missing required fields
- Malformed JSON

**401 Unauthorized:**
- Credential revoked
- Credential expired
- Role mismatch
- Invalid proof

**500 Internal Server Error:**
- Midnight adapter failure
- Unexpected server error

### Error Response Format

```json
{
  "error": "Human-readable error message"
}
```

---

## Performance

**Benchmarks (Demo Mode):**
- Challenge generation: <1ms
- VP verification: <1ms (mock adapter)
- Token issuance: <1ms
- Total request time: ~5ms

**Expected (Production Mode):**
- Challenge generation: <1ms
- VP verification: ~500ms (ZK proof)
- Token issuance: <1ms
- Total request time: ~510ms

---

## Testing

```bash
# Run tests
bun test

# Manual testing with curl
curl -X POST http://localhost:8787/challenge \
  -H "Content-Type: application/json" \
  -d '{"aud":"https://example.com"}'

curl -X GET http://localhost:8787/health
```

---

## Deployment

### Render (Recommended)

1. Connect GitHub repository
2. Select `apps/verifier-api` as root directory
3. Set environment variables
4. Deploy!

Auto-deploys on git push.

### Docker

```bash
# Build
docker build -t verifier-api .

# Run
docker run -p 8787:8787 -e JWT_SECRET=your_secret verifier-api
```

### Manual

```bash
# Install dependencies
bun install

# Build
bun run build

# Run
NODE_ENV=production bun run start
```

---

## Logging

**Development:**
- Verbose logging (info level)
- Pretty-printed to console
- Colored output

**Production:**
- Warn level only
- JSON format for log aggregation
- Includes timestamps and request IDs

**Example Log:**
```json
{
  "level": 30,
  "time": 1699564800000,
  "msg": "🔍 Role comparison:",
  "policyRole": "Banker",
  "disclosedRole": "Banker",
  "credHash": "abc123..."
}
```

---

## Monitoring

### Health Checks

Kubernetes/Docker health check:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8787
  initialDelaySeconds: 10
  periodSeconds: 5
```

### Metrics to Track

- Request count
- Response times
- Error rates
- Token issuance count
- Verification success/failure ratio

---

## Troubleshooting

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Find process using port 8787
lsof -i :8787

# Kill it
kill -9 <PID>

# Or use different port
PORT=8788 bun run dev
```

### Midnight Adapter Errors

**Problem:** "Real Midnight verification not yet implemented"

**Solution:**
- This is expected in demo mode
- Mock mode is hardcoded to `true`
- Production will enable real mode

### JWT Secret Issues

**Problem:** Tokens don't verify

**Solution:**
- Check `JWT_SECRET` matches between issuance and verification
- Ensure secret is same across deployments
- Don't change secret with active tokens

---

## Contributing

When modifying the API:

1. **Preserve endpoint contracts** - Don't break frontend
2. **Maintain error formats** - Consistent error responses
3. **Update this README** - Document changes
4. **Test thoroughly** - All scenarios
5. **Check logs** - Ensure proper logging

---

## Resources

- **Fastify Docs:** https://www.fastify.io
- **Bun Docs:** https://bun.sh
- **JWT.io:** https://jwt.io
- **Midnight Docs:** https://docs.midnight.network

---

## License

MIT - See LICENSE file in repository root
