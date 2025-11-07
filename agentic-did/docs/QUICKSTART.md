# 🚀 AgenticDID.io Quick Start Guide

**Get the demo running in under 2 minutes!**

---

## 📋 Prerequisites

Choose **ONE** of these options:

### Option A: Docker (Easiest! ⭐ Recommended for Judges)
- ✅ Docker Desktop installed
- ✅ That's it!

### Option B: Local Development with Bun
- ✅ Bun 1.2+ ([bun.sh](https://bun.sh))
- ✅ Git

### Option C: Local Development with Node
- ✅ Node.js 18+
- ✅ npm or yarn
- ✅ Git

---

## 🐳 Option A: Docker (One Command!)

```bash
# Clone the repository
git clone https://github.com/bytewizard42i/AgenticDID_io_me.git
cd AgenticDID_io_me

# Run the magic script ✨
./docker-quickstart.sh
```

**That's it!** Open http://localhost:5173 in your browser.

### Docker Commands
```bash
# Start the demo
docker-compose up

# Stop the demo
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose build --no-cache
```

---

## ⚡ Option B: Bun (Fastest Local Dev)

```bash
# Clone the repository
git clone https://github.com/bytewizard42i/AgenticDID_io_me.git
cd AgenticDID_io_me

# Install dependencies (10x faster than npm!)
bun install

# Run both services
bun run dev
```

**Visit:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8787

---

## 📦 Option C: Node.js/npm

```bash
# Clone the repository
git clone https://github.com/bytewizard42i/AgenticDID_io_me.git
cd AgenticDID_io_me

# Install dependencies
npm install

# Set up environment variables (if needed)
cp apps/verifier-api/.env.example apps/verifier-api/.env
cp apps/web/.env.example apps/web/.env

# Build packages
npm --prefix packages/agenticdid-sdk run build
npm --prefix packages/midnight-adapter run build
npm --prefix apps/verifier-api run build

# Run both services
npm run dev
```

**Visit:**
- Frontend: http://localhost:5175
- Backend: http://localhost:8787

---

## 🎮 Try the Demo

### Step 1: Establish Trust with Comet
1. Click the purple **"🛡️ Step 1: Let Comet Prove Itself"** button
2. Watch Comet present its credential and pass integrity checks
3. See the **green ZKP proof popup** appear → Click "View Proof Log" to see the full audit trail

### Step 2: Pick What You Want to Do
- **🎧 Buy Headphones ($149)** → Amazon Shopper agent selected
- **💸 Send $50** → Banker agent selected
- **🛫 Book Flight** → Traveler agent selected

### Step 3: Watch the Magic
- System auto-selects the appropriate agent
- Watch the verification timeline
- See success or failure based on permissions

### Step 4: Try the Rogue Agent (Security Demo)
- Manually select the **🚨 Rogue Agent** (glitching, scary design)
- Try any action → Watch it FAIL
- Demonstrates credential revocation in action

---

## 🎯 What You're Seeing

### The Results-Focused Workflow
> *Inspired by Charles Hoskinson: "The future is about results, not processes"*

**Old Way (Process-Focused):**
1. Pick which agent to use
2. Choose what action to perform
3. Hope you picked the right one

**New Way (Results-Focused):**
1. Say what you want to achieve
2. System auto-selects the right agent
3. Just works ✨

### The Mutual Authentication Flow
1. **Agent proves first** → Critical security: Never give credentials to unverified agents
2. **ZKP verification** → Zero-knowledge proof confirms identity without exposing keys
3. **Then user authenticates** → Biometric or 2FA
4. **Trust established** → Delegation can proceed safely

### The Privacy Architecture
- **Spoof transactions** → 80% fake queries prevent timing analysis
- **Zero-knowledge proofs** → Prove identity without revealing data
- **Selective disclosure** → Only share what's necessary
- **Midnight receipts** → Cryptographic proof on-chain

---

## 📚 Next Steps

### For Hackathon Judges
- ✅ Demo works out of the box
- 📖 Read [AGENT_DELEGATION_WORKFLOW.md](./AGENT_DELEGATION_WORKFLOW.md) for complete multi-party flow
- 🏗️ Read [PRIVACY_ARCHITECTURE.md](./PRIVACY_ARCHITECTURE.md) for spoof transaction design
- 🔍 Review [AI-DEVELOPMENT-LOG.md](./AI-DEVELOPMENT-LOG.md) for development journey

### For Developers
- 📋 Read [PHASE2_IMPLEMENTATION.md](./PHASE2_IMPLEMENTATION.md) for roadmap
- 🌙 Read [MIDNIGHT_INTEGRATION_GUIDE.md](./MIDNIGHT_INTEGRATION_GUIDE.md) for Compact integration
- 🔧 Read [MIDNIGHT_DEVELOPMENT_PRIMER.md](./MIDNIGHT_DEVELOPMENT_PRIMER.md) for ZK details

### For Contributors
- 💻 Check [README.md](./README.md) for full project overview
- 🎨 Explore `apps/web/src/components/` for UI components
- 🔐 Explore `apps/verifier-api/src/` for backend logic

---

## 🐛 Troubleshooting

### Docker Issues
```bash
# Port already in use?
docker-compose down
# Kill any processes on 5173 and 8787
lsof -ti:5173 | xargs kill -9
lsof -ti:8787 | xargs kill -9
# Try again
docker-compose up
```

### Bun Issues
```bash
# Lockfile out of sync?
rm -rf node_modules bun.lock
bun install

# Port already in use?
pkill -f "bunx --bun vite"
pkill -f "bun --watch"
```

### npm Issues
```bash
# Dependency issues?
rm -rf node_modules package-lock.json
npm install

# Build failures?
npm run clean
npm install
npm run build
```

---

## 💡 Tips for Demo

### Best Flow for Showing Off
1. Start with **"Buy Headphones"** → Shows auto-selection
2. Try **"Send $50"** → Different agent selected
3. Manually select **Rogue Agent** → Security fail demo
4. Show **ZKP Proof popup** → Visual proof of ZK verification
5. Open **Proof Log** → Show audit trail transparency

### Key Points to Emphasize
- **Results over processes** → User intent-driven
- **Agent proves first** → Critical security principle
- **Zero-knowledge** → Privacy preserved
- **Multi-party trust** → User ↔ Agent ↔ Service
- **Spoof transactions** → Novel privacy innovation

---

## 🎉 Ready to Win!

You're all set! The demo showcases:
- ✅ Privacy-preserving identity
- ✅ Zero-knowledge proofs
- ✅ Mutual authentication
- ✅ Results-focused UX
- ✅ Midnight Network integration
- ✅ Production-ready architecture

**Good luck at the hackathon!** 🏆

---

**Built with ❤️ for the Midnight Network Hackathon**

[GitHub](https://github.com/bytewizard42i/AgenticDID_io_me) • [Documentation](./README.md) • [Architecture](./AGENT_DELEGATION_WORKFLOW.md)
