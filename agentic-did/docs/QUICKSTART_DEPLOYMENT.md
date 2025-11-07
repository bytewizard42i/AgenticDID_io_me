# 🚀 AgenticDID - Quick Deployment Guide

**Time to deploy**: 30 minutes  
**Difficulty**: Easy  
**Status**: Ready! ✅

---

## One-Page Deployment

### Prerequisites (5 min)

```bash
# 1. Install Lace Wallet
# Visit: https://www.lace.io/

# 2. Get tDUST tokens
# Open Lace → Testnet → Faucet (need ~100 tDUST)

# 3. Configure environment
cat > .env.midnight << 'EOF'
MIDNIGHT_NETWORK=testnet
MIDNIGHT_INDEXER_URL=https://indexer.testnet.midnight.network
MIDNIGHT_NODE_URL=https://rpc.testnet.midnight.network
MIDNIGHT_WALLET_ADDRESS=your_wallet_address_here
MIDNIGHT_PRIVATE_KEY=your_private_key_here
INITIAL_SPOOF_RATIO=80
EOF
```

⚠️ **Security**: Add `.env.midnight` to `.gitignore`!

---

### Compile Contracts (2-5 min)

```bash
cd /home/js/utils_AgenticDID_io_me/AgenticDID_io_me

# Compile all contracts
./scripts/compile-contracts.sh

# Verify compilation
ls -la contracts/compiled/
```

**Expected output**:
- ✅ `AgenticDIDRegistry/contract.json`
- ✅ `CredentialVerifier/contract.json`
- ✅ `ProofStorage/contract.json`

---

### Test Contracts (3-5 min)

```bash
# Run all tests
./scripts/test-contracts.sh

# Expected: All tests pass ✅
```

---

### Deploy to Testnet (15-30 min)

```bash
# Deploy everything
./scripts/deploy-testnet.sh

# Watch deployment progress:
# 1. AgenticDIDRegistry deploying...
# 2. CredentialVerifier deploying...
# 3. ProofStorage deploying...
# ✅ All deployed!
```

**Deployment Summary** saved to:
```
deployments/testnet/deployment-summary.json
```

---

### Verify Deployment (2 min)

```bash
# Check deployment
cat deployments/testnet/deployment-summary.json

# View on explorer
# https://explorer.testnet.midnight.network/contract/<ADDRESS>
```

---

### Update Configuration (2 min)

```bash
# Update frontend config with deployed addresses
nano apps/web/src/config/contracts.ts

# Paste contract addresses from deployment-summary.json
```

---

## Troubleshooting

### "Docker not running"
```bash
# Start Docker
sudo systemctl start docker
# or open Docker Desktop
```

### "Insufficient tDUST"
```bash
# Get more from faucet
# Lace wallet → Testnet → Faucet
```

### "Compilation failed"
```bash
# Check fixes were applied
cat COMPILATION_FIXES.md

# Verify latest code
git status
```

---

## Next Steps After Deployment

### 1. Test Basic Operations

```typescript
// Register a test agent
await agenticDIDRegistry.registerAgent({
  did: '0x123...',
  publicKey: '0xabc...',
  role: 'test',
  scopes: ['read'],
  expiresAt: Date.now() + 86400000,
});

// Verify agent
const isValid = await credentialVerifier.verifyCredential({
  agentDID: '0x123...',
  proofHash: '0xdef...',
});
```

### 2. Check Statistics

```typescript
const stats = await credentialVerifier.getStats();
console.log('Verifications:', stats.totalVerifications);
console.log('Spoof ratio:', stats.spoofRatio + '%');
```

### 3. Monitor Costs

```bash
# Check wallet balance
# Lace wallet → Balance

# View transaction history
# Lace wallet → Activity
```

---

## Full Documentation

For detailed information, see:

- **DEPLOYMENT_GUIDE.md** - Complete deployment walkthrough
- **COMPILATION_FIXES.md** - Fixes applied to contracts
- **KERNEL_OPTIMIZATIONS.md** - Future optimization opportunities
- **SESSION_SUMMARY_2025-10-28.md** - Today's work summary

---

## Emergency Support

### Contract Issues
```bash
# Re-compile
./scripts/compile-contracts.sh

# Check logs
docker logs <container_id>
```

### Deployment Issues
```bash
# Clear previous deployment
rm -rf deployments/testnet/

# Re-deploy
./scripts/deploy-testnet.sh
```

### Wallet Issues
```bash
# Verify configuration
cat .env.midnight

# Test connection
# Open Lace wallet and check network
```

---

## Success Checklist

After deployment, you should have:

- ✅ 3 contracts deployed to testnet
- ✅ Contract addresses in deployment-summary.json
- ✅ Frontend config updated
- ✅ Test transactions successful
- ✅ Wallet balance decreased (tDUST spent)

---

## Commands Cheat Sheet

```bash
# Compile
./scripts/compile-contracts.sh

# Test
./scripts/test-contracts.sh

# Deploy
./scripts/deploy-testnet.sh

# Check deployment
cat deployments/testnet/deployment-summary.json

# View logs
tail -f logs/deployment.log
```

---

**That's it!** Your AgenticDID contracts are now live on Midnight testnet. 🎉

For questions, check the full documentation or reach out on Discord.

---

*Created: October 28, 2025*  
*Last Updated: October 28, 2025*  
*Status: Production Ready ✅*
