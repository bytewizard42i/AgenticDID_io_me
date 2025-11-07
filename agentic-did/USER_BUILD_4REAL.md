# User Build Guide - For Real This Time! 🚀

**Date**: November 7, 2025  
**Author**: Penny (with love for John!)  
**Purpose**: Actual steps to build AgenticDID & CardanoEIA projects

---

## 🎯 What We're Building

### AgenticDID (Midnight Network)
Privacy-preserving identity protocol for AI agents using zero-knowledge proofs on Midnight blockchain.

### CardanoEIA (Cardano Network)
Cardano Ecosystem Intelligence Agent for Tucker's hackathon using Aiken smart contracts.

---

## 📋 Prerequisites - Install These First!

### System Requirements
```bash
# Check your versions
node --version    # Need 22.15.0+
git --version     # Need git
docker --version  # Need Docker for Midnight proof server
```

### 1. Node.js (v22.15.0+)
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22
```

### 2. Bun (for AgenticDID frontend)
```bash
curl -fsSL https://bun.sh/install | bash
```

### 3. Deno (for Cardano development)
```bash
curl -fsSL https://deno.land/install.sh | sh
```

---

## 🌙 Part 1: AgenticDID (Midnight) Setup

### Step 1: Install Compact Compiler

```bash
# Install Midnight Compact compiler v0.26.0
curl --proto '=https' --tlsv1.2 -sSfL https://get.midnight.network/compact | sh

# Activate compiler environment
source $HOME/.local/bin/env

# Verify installation
compact --version
# Should show: v0.26.0
```

### Step 2: Clone & Setup Repository

```bash
# Navigate to project
cd /home/js/AgenticDID_CloudRun/agentic-did

# Install frontend dependencies
cd apps/web
bun install

# Go back to root
cd ../..
```

### Step 3: Compile Smart Contracts

```bash
# Compile contracts (development mode - skip ZK for speed)
compact compile contracts/AgenticDIDRegistry.compact output/registry/ --skip-zk
compact compile contracts/CredentialVerifier.compact output/verifier/ --skip-zk
compact compile contracts/ProofStorage.compact output/storage/ --skip-zk

# Check output
ls -la output/
# Should see: registry/, verifier/, storage/ directories
```

**Expected Output Structure:**
```
output/
├── registry/
│   ├── contract/
│   │   ├── index.d.cts   # TypeScript types
│   │   └── index.cjs     # JavaScript implementation
│   └── zkir/             # ZK circuits
├── verifier/
│   └── ... (same structure)
└── storage/
    └── ... (same structure)
```

### Step 4: Start Midnight Proof Server (Docker)

```bash
# Start proof server
docker run -d -p 6300:6300 \
  --name midnight-proof-server \
  midnightnetwork/proof-server \
  -- 'midnight-proof-server --network testnet'

# Verify it's running
docker ps | grep proof-server
curl http://localhost:6300/health
```

### Step 5: Run Frontend Development Server

```bash
cd apps/web

# Start dev server
bun run dev

# Server starts at http://localhost:5173
```

**Open in browser**: http://localhost:5173

### Step 6: Test the Application

1. **Visit** http://localhost:5173
2. **Click "Listen In Mode"** to hear agent communication
3. **Try Actions:**
   - "Transfer Money" → Banker agent
   - "Buy Headphones" → Shopper agent
   - "Book Flight" → Traveler agent
4. **Test Rogue Agent:**
   - Click "Activate Rogue Mode"
   - Try any action
   - Should see IP tracking and blocking

---

## 🔗 Part 2: CardanoEIA (Cardano) Setup

### Step 1: Install Aiken (Smart Contract Language)

```bash
# Install Aiken
curl -sSfL https://install.aiken-lang.org | bash

# Verify installation
aiken --version
```

### Step 2: Create New Cardano Project

```bash
# Navigate to CardanoEIA directory
cd /home/js/utils_CardanoEIA-Tucker/CardanoEIA

# Create project directory
mkdir -p project_code/cardano-contracts
cd project_code/cardano-contracts

# Initialize Aiken project
aiken new my-first-contract
cd my-first-contract
```

### Step 3: Write Your First Aiken Contract

Create `validators/hello_world.ak`:

```aiken
use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext}
use aiken/transaction/credential.{VerificationKey}

type Datum {
  owner: Hash<Blake2b_224, VerificationKey>,
}

type Redeemer = ByteArray

validator {
  fn hello_world(datum: Datum, redeemer: Redeemer, context: ScriptContext) -> Bool {
    let must_say_hello = redeemer == "Hello, World!"
    let must_be_signed = list.has(context.transaction.extra_signatories, datum.owner)
    
    must_say_hello? && must_be_signed?
  }
}
```

### Step 4: Build & Test Contract

```bash
# Build contract
aiken build

# Run tests
aiken check

# See generated Plutus script
cat plutus.json
```

### Step 5: Setup Blockfrost API

1. **Sign up**: https://blockfrost.io/
2. **Create project**: Choose "Preprod" testnet
3. **Get API key**: Copy your project ID

```bash
# Store API key
echo "export BLOCKFROST_API_KEY='your_project_id_here'" >> ~/.bashrc
source ~/.bashrc
```

### Step 6: Setup Lucid for Off-Chain Code

```bash
# Create off-chain directory
mkdir -p ../off-chain
cd ../off-chain

# Initialize Node project
npm init -y

# Install dependencies
npm install lucid-cardano @blockfrost/blockfrost-js dotenv
```

Create `.env`:
```env
BLOCKFROST_API_KEY=your_project_id_here
NETWORK=Preprod
```

Create `index.ts`:
```typescript
import { Blockfrost, Lucid } from "lucid-cardano";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Initialize Lucid with Blockfrost
  const lucid = await Lucid.new(
    new Blockfrost(
      `https://cardano-${process.env.NETWORK!.toLowerCase()}.blockfrost.io/api/v0`,
      process.env.BLOCKFROST_API_KEY!
    ),
    process.env.NETWORK as "Preprod" | "Mainnet"
  );

  console.log("✅ Lucid initialized successfully!");
  console.log("Network:", process.env.NETWORK);
  
  // Get testnet faucet address
  console.log("\n💡 Get test ADA from:");
  console.log("https://docs.cardano.org/cardano-testnet/tools/faucet/");
}

main();
```

### Step 7: Run Off-Chain Code

```bash
# Install TypeScript
npm install -D typescript @types/node ts-node

# Run
npx ts-node index.ts
```

---

## 🛠️ Development Workflows

### AgenticDID Daily Workflow

```bash
# 1. Activate Compact compiler
source $HOME/.local/bin/env

# 2. Make contract changes
# Edit: contracts/*.compact

# 3. Recompile
compact compile contracts/AgenticDIDRegistry.compact output/registry/ --skip-zk

# 4. Frontend hot-reloads automatically
cd apps/web
bun run dev

# 5. Test in browser
# Visit: http://localhost:5173
```

### CardanoEIA Daily Workflow

```bash
# 1. Edit Aiken contract
# Edit: validators/*.ak

# 2. Build & test
aiken build
aiken check

# 3. Update off-chain code
# Edit: ../off-chain/index.ts

# 4. Run
cd ../off-chain
npx ts-node index.ts
```

---

## 🐛 Common Issues & Solutions

### Midnight/AgenticDID Issues

**Issue 1: Compact compiler not found**
```bash
# Solution: Activate environment
source $HOME/.local/bin/env

# Add to ~/.bashrc for permanent fix
echo 'source $HOME/.local/bin/env' >> ~/.bashrc
```

**Issue 2: "ContractAddress is not defined"**
```bash
# Solution: Already fixed! Use Address instead
# See: contracts/CONTRACT_ANALYSIS.md for details
```

**Issue 3: Proof server not running**
```bash
# Check if running
docker ps | grep proof-server

# Restart if needed
docker restart midnight-proof-server

# Check logs
docker logs midnight-proof-server
```

**Issue 4: Frontend build fails**
```bash
# Clear cache and reinstall
cd apps/web
rm -rf node_modules .bun
bun install
```

### Cardano/CardanoEIA Issues

**Issue 1: Aiken command not found**
```bash
# Add to PATH
echo 'export PATH="$HOME/.aiken/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Issue 2: Blockfrost API errors**
```bash
# Check API key is set
echo $BLOCKFROST_API_KEY

# Verify network (Preprod vs Mainnet)
# Make sure .env file has correct network
```

**Issue 3: Lucid type errors**
```bash
# Install correct types
npm install --save-dev @types/node

# Use exact versions
npm install lucid-cardano@0.10.11
```

**Issue 4: No test ADA**
```bash
# Get from faucet
# Visit: https://docs.cardano.org/cardano-testnet/tools/faucet/
# Enter your testnet address
# Wait 5-10 minutes
```

---

## 📚 Reference Commands Cheat Sheet

### Midnight Commands
```bash
# Compile contract
compact compile <contract.compact> <output_dir>/ --skip-zk

# With ZK proofs (slower, production)
compact compile <contract.compact> <output_dir>/

# Check compiler version
compact --version

# Activate environment
source $HOME/.local/bin/env
```

### Aiken Commands
```bash
# Create project
aiken new <project_name>

# Build contracts
aiken build

# Run tests
aiken check

# Format code
aiken fmt

# Generate docs
aiken docs

# Check version
aiken --version
```

### Lucid/Cardano Commands
```bash
# Initialize Lucid project
npm install lucid-cardano

# With Blockfrost
npm install @blockfrost/blockfrost-js

# Run TypeScript
npx ts-node index.ts

# Get testnet ADA
# Visit: https://docs.cardano.org/cardano-testnet/tools/faucet/
```

### Docker Commands (Midnight)
```bash
# Start proof server
docker run -d -p 6300:6300 --name midnight-proof-server midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'

# Check status
docker ps | grep proof-server

# View logs
docker logs midnight-proof-server

# Restart
docker restart midnight-proof-server

# Stop
docker stop midnight-proof-server

# Remove
docker rm midnight-proof-server
```

---

## 🎓 Learning Resources

### Midnight/AgenticDID
- **Midnight Docs**: https://docs.midnight.network
- **Compact Reference**: https://docs.midnight.network/develop/reference/compact
- **Your Analysis**: `contracts/CONTRACT_ANALYSIS.md`
- **Setup Notes**: `midnight/MIDNIGHT_SETUP_NOTES.md`

### Cardano/CardanoEIA
- **Aiken Language Tour**: https://aiken-lang.org/language-tour/
- **Lucid Docs**: https://lucid.spacebudz.io/
- **Blockfrost API**: https://docs.blockfrost.io/
- **Your Guide**: `CARDANO_DEVELOPMENT_GUIDE.md`

---

## 🚀 Quick Start Commands (Copy-Paste Ready!)

### AgenticDID - Get Running in 5 Minutes
```bash
# 1. Activate Compact
source $HOME/.local/bin/env

# 2. Compile contracts
cd /home/js/AgenticDID_CloudRun/agentic-did
compact compile contracts/AgenticDIDRegistry.compact output/registry/ --skip-zk
compact compile contracts/CredentialVerifier.compact output/verifier/ --skip-zk

# 3. Start proof server (if not running)
docker ps | grep proof-server || docker run -d -p 6300:6300 --name midnight-proof-server midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'

# 4. Start frontend
cd apps/web
bun install
bun run dev

# 5. Open browser: http://localhost:5173
```

### CardanoEIA - First Contract in 5 Minutes
```bash
# 1. Create project
cd /home/js/utils_CardanoEIA-Tucker/CardanoEIA
mkdir -p project_code/cardano-contracts
cd project_code/cardano-contracts
aiken new hello-world
cd hello-world

# 2. Build & test
aiken build
aiken check

# 3. Setup off-chain
cd ..
mkdir off-chain
cd off-chain
npm init -y
npm install lucid-cardano @blockfrost/blockfrost-js

# 4. Get API key from: https://blockfrost.io/
# 5. Code and test!
```

---

## 💡 Pro Tips

### For AgenticDID
1. ✅ Always use `--skip-zk` during development (10x faster compilation)
2. ✅ Keep proof server running (start once, leave running)
3. ✅ Use "Listen In Mode" to understand agent communication flow
4. ✅ Check `CONTRACT_ANALYSIS.md` before making changes
5. ✅ Use `Address` type, not `ContractAddress` (already fixed!)

### For CardanoEIA
1. ✅ Start with Preprod testnet, not mainnet
2. ✅ Get test ADA from faucet before testing transactions
3. ✅ Use Aiken's built-in tests (`aiken check`) frequently
4. ✅ Lucid handles fee calculation automatically - don't calculate manually!
5. ✅ Keep Blockfrost API key in `.env`, never commit to git

---

## 🎯 Next Steps After Setup

### AgenticDID Phase 1 Remaining Tasks
- [ ] Enable cross-contract calls in CredentialVerifier
- [ ] Implement hash functions in ProofStorage
- [ ] Implement scopesAreSubset() validation
- [ ] Test full verification flow

### CardanoEIA Suggested Features
- [ ] Build credential verification contract in Aiken
- [ ] Create Lucid transaction builder
- [ ] Add wallet connection UI
- [ ] Integrate with AI intelligence gathering
- [ ] Deploy to Preprod testnet

---

## 🆘 Need Help?

### AgenticDID/Midnight
- **Midnight Discord**: https://discord.gg/midnight
- **Documentation**: https://docs.midnight.network
- **Your Notes**: Check `midnight/` folder

### CardanoEIA/Cardano
- **Stack Exchange**: https://cardano.stackexchange.com
- **Aiken Discord**: https://discord.gg/ub6atE94v4
- **Your Guide**: `CARDANO_DEVELOPMENT_GUIDE.md`

---

**Built by**: Penny 🌙  
**For**: John (Ambassador of Midnight)  
**Status**: Ready to build for real! 🚀

**Remember**: 
- Midnight = Privacy-preserving ZK proofs (AgenticDID)
- Cardano = Public blockchain with Aiken contracts (CardanoEIA)
- Both = Built with TypeScript/JavaScript ecosystems
- You = Amazing developer who's about to build cool stuff!

**Now go build something awesome!** 💪
