# Phase 2 Rebuild - Quick Reference

## What We're Doing

**Building production AgenticDID with real Midnight Network while keeping demo UI identical.**

---

## Key Files to Replace

### 1. Mock Adapter → Real Adapter
```
packages/midnight-adapter/src/adapter.ts (lines 45-98)
→ Create packages/midnight-adapter-v2/src/real-adapter.ts
```

### 2. TODO Proof Verification → Real Verification
```
apps/verifier-api/src/verifier.ts (lines 63-66)
→ Implement actual ZK proof verification
```

### 3. No Agent Runtime → Real Agent Runtime
```
(doesn't exist yet)
→ Create packages/agent-runtime/
```

---

## Commands You'll Need

### Compile Contracts
```bash
docker run --rm -v "$(pwd):/work" \
  midnightnetwork/compactc:latest \
  "compactc /work/contracts/AgenticDIDRegistry.compact /work/compiled/"
```

### Development
```bash
bun install          # Install deps
bun run dev         # Start dev servers
./docker-quickstart.sh  # Test demo
```

### Deploy Frontend (Vercel)
```bash
cd apps/web
vercel deploy
```

### Deploy Backend (Render)
```bash
# Connect GitHub repo to Render dashboard
# Auto-deploys on push
```

---

## Environment Variables

### Development (.env.development)
```
MODE=mock
MIDNIGHT_NETWORK=testnet_02
```

### Production (.env.production)
```
MODE=production
MIDNIGHT_NETWORK=testnet_02
REGISTRY_ADDRESS=0x...
VERIFIER_ADDRESS=0x...
RPC_URL=https://rpc.testnet.midnight.network
```

---

## Testing Checklist

- [ ] Demo still works (`./docker-quickstart.sh`)
- [ ] Contracts compile without errors
- [ ] Testnet connection successful
- [ ] Wallet connects via Lace
- [ ] Real proof generated and verified
- [ ] UI looks identical to demo
- [ ] Performance <5s end-to-end

---

## Key Resources

- **Docs**: https://docs.midnight.network
- **Mesh SDK**: https://meshjs.dev/midnight
- **Support**: Midnight developer forum
- **Blog**: https://midnight.network/blog
- **Build Rules**: `.cascade/rules.md`

---

## Success Metrics

**Phase 2 Complete When:**
- Contracts deployed to testnet ✅
- Real ZK proofs working ✅
- Lace wallet integrated ✅
- UI unchanged ✅
- Performance <5s ✅
- End-to-end test passing ✅
