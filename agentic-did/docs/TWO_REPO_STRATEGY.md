# Two-Repo Strategy: Demo vs Production

## Overview
Maintain two separate repositories to preserve the demo while building production.

---

## Repo 1: AgenticDID_io_me (CURRENT - DEMO)

**Purpose:** Working demo, hackathon submission, always available reference

**Status:** Freeze after hackathon, minimal maintenance only

**What it contains:**
- Mock Midnight adapter (fast, simple)
- Demo frontend with Listen In Mode
- Fastify API with mock verification
- All documentation and examples
- Docker Compose for local demo

**URL:** `https://github.com/bytewizard42i/AgenticDID_io_me`

**Commands:**
```bash
# Always works, always fast
./docker-quickstart.sh

# Demo runs on:
# Frontend: http://localhost:5175
# API: http://localhost:8787
```

**Value:**
- Reference implementation
- Hackathon judges see working demo
- Tutorial/educational resource
- Proof of concept
- Always functional fallback

---

## Repo 2: AgenticDID (NEW - PRODUCTION)

**Purpose:** Production-ready with real Midnight Network integration

**Status:** Active development, production deployment

**What it contains:**
- Real Midnight SDK integration
- Lace wallet support
- ZK proof generation/verification
- On-chain smart contracts
- Agent runtime system
- ONE-BUTTON DOCKER DEPLOYMENT

**URL:** `https://github.com/bytewizard42i/AgenticDID` (to create)

**Structure:**
```
AgenticDID/
├── docker-compose.production.yml   # One-button deploy
├── Dockerfile.all-in-one           # Everything bundled
├── .env.example                    # Configuration template
├── apps/
│   ├── frontend/                   # React UI (same as demo)
│   ├── api/                        # Real verification API
│   └── proof-server/              # Midnight proof generation
├── packages/
│   ├── midnight-sdk/              # Real Midnight integration
│   ├── agent-runtime/             # Real agents with ZK
│   └── wallet-connector/          # Lace wallet integration
├── contracts/
│   ├── AgenticDIDRegistry.compact
│   ├── CredentialVerifier.compact
│   └── compiled/                  # Pre-compiled contracts
├── scripts/
│   ├── setup.sh                   # Initial setup
│   ├── deploy-contracts.sh        # Deploy to testnet
│   └── health-check.sh            # Verify all services
└── docs/
    ├── QUICKSTART.md              # One-button instructions
    ├── PRODUCTION.md              # Deployment guide
    └── ARCHITECTURE.md            # System design
```

**One-Button Deploy:**
```bash
# User runs just this:
docker-compose up -d

# Everything starts:
# - Frontend on :5175
# - API on :8787
# - Midnight proof server on :9090
# - PostgreSQL for state
# - Redis for caching
```

---

## Docker All-in-One Architecture

### What Goes in the Docker Image

**Base Image:** `ubuntu:22.04`

**Includes:**
1. **Node.js 20** - Runtime for all services
2. **Bun** - Fast package manager and runtime
3. **Midnight Node** - Local testnet node (optional)
4. **Midnight Proof Server** - ZK proof generation
5. **PostgreSQL** - State persistence
6. **Redis** - Caching and session management
7. **Nginx** - Reverse proxy for all services

**Pre-installed:**
- All npm dependencies
- Compiled smart contracts
- Wallet SDK configured
- Example credentials for testing

### Docker Compose Structure

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  # Frontend (React)
  frontend:
    build: ./apps/frontend
    ports:
      - "5175:5175"
    environment:
      - VITE_API_URL=http://localhost:8787
      - VITE_MODE=production
    depends_on:
      - api

  # Backend API
  api:
    build: ./apps/api
    ports:
      - "8787:8787"
    environment:
      - MODE=production
      - MIDNIGHT_RPC_URL=http://midnight-node:3000
      - PROOF_SERVER_URL=http://proof-server:9090
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/agenticdid
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
      - proof-server
      - midnight-node

  # Midnight Proof Server
  proof-server:
    image: midnightnetwork/proof-server:latest
    ports:
      - "9090:9090"
    volumes:
      - ./contracts/compiled:/contracts
    environment:
      - CONTRACTS_DIR=/contracts

  # Midnight Node (local testnet)
  midnight-node:
    image: midnightnetwork/midnight-node:latest
    ports:
      - "3000:3000"
    volumes:
      - midnight-data:/data
    environment:
      - NETWORK=testnet

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=agenticdid
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - api

volumes:
  postgres-data:
  redis-data:
  midnight-data:
```

### One-Button Experience

**For End Users:**

```bash
# 1. Clone repo
git clone https://github.com/bytewizard42i/AgenticDID.git
cd AgenticDID

# 2. Configure (optional - has defaults)
cp .env.example .env
# Edit .env if needed

# 3. Start everything
docker-compose up -d

# 4. Wait for health checks (30-60 seconds)
./scripts/health-check.sh

# 5. Open browser
open http://localhost

# Done! Everything is running.
```

**What Happens Automatically:**
1. All containers start in correct order
2. Database migrations run
3. Smart contracts deploy to local testnet
4. Test agents registered
5. Example delegations created
6. Health checks verify everything works
7. UI accessible at http://localhost

---

## Migration Plan: Demo → Production

### Step 1: Create New Repo (Week 1)

```bash
# On your machine
mkdir AgenticDID
cd AgenticDID
git init

# Copy selective files from demo
# (not everything - fresh start)
```

### Step 2: Copy Core Files (Preserve Demo)

**Copy these FROM demo:**
- `contracts/` (smart contracts - already fixed)
- `apps/web/src/components/` (UI components)
- `packages/agenticdid-sdk/` (types and interfaces)
- `docs/` (documentation)

**DO NOT copy:**
- `packages/midnight-adapter/` (mock - rebuild from scratch)
- `apps/verifier-api/` (rebuild with real Midnight)
- `node_modules/`, `bun.lock` (fresh install)

### Step 3: Rebuild with Real Integration

**New packages to create:**
```
packages/
├── midnight-sdk/           # Real Midnight integration
├── agent-runtime/          # Real agents with ZK proofs
├── wallet-connector/       # Lace wallet
└── proof-generator/        # ZK proof creation
```

**New apps:**
```
apps/
├── frontend/              # Same UI, real backend calls
├── api/                   # Real verification
└── proof-server/         # Proof generation service
```

---

## Benefits of Two-Repo Approach

### Demo Repo Benefits
✅ Always working for demos/presentations  
✅ Fast setup (no Midnight node needed)  
✅ Educational resource  
✅ Hackathon submission (frozen in time)  
✅ Reference implementation  
✅ No risk of breaking during production work

### Production Repo Benefits
✅ Clean slate for real integration  
✅ No legacy mock code to confuse  
✅ Production-grade architecture  
✅ Docker all-in-one deployment  
✅ Real Midnight Network  
✅ Scalable for actual users

### Both Share
- Same UI/UX (users don't see difference)
- Same smart contracts
- Same documentation foundation
- Same branding

---

## Docker Image Features

### For Users
- One command to start: `docker-compose up -d`
- Pre-configured everything
- No manual setup required
- Works offline (local testnet)
- Auto-updates available

### For Developers
- Clean separation of concerns
- Easy to add new services
- Health checks built-in
- Logs aggregated
- Easy debugging

### Production Ready
- Horizontal scaling (add more containers)
- Load balancing (Nginx)
- Database persistence
- Redis caching
- SSL/TLS support
- Monitoring hooks

---

## Maintenance Strategy

### Demo Repo (Low Maintenance)
- Security patches only
- Documentation updates
- Bug fixes if critical
- No feature additions

### Production Repo (Active Development)
- New features
- Performance optimization
- Security hardening
- User feedback implementation
- Midnight Network updates

---

## Timeline

**Week 1:** Create production repo structure  
**Week 2:** Docker compose configuration  
**Week 3:** Real Midnight integration  
**Week 4:** Agent runtime system  
**Week 5:** Testing and optimization  
**Week 6:** Documentation and release

---

## Docker Image Distribution

### Options

**Option 1: Docker Hub (Public)**
```bash
# Users pull and run
docker pull bytewizard42i/agenticdid:latest
docker run -p 80:80 bytewizard42i/agenticdid
```

**Option 2: GitHub Container Registry**
```bash
docker pull ghcr.io/bytewizard42i/agenticdid:latest
```

**Option 3: Docker Compose (Recommended)**
```bash
# Single command, no manual pulls
docker-compose up -d
```

---

## Success Metrics

### Demo Repo
- ✅ Still works after 6 months
- ✅ <5 minute setup time
- ✅ Clear documentation
- ✅ Educational value

### Production Repo
- ✅ One-button Docker deploy works
- ✅ Real ZK proofs verified
- ✅ <5 second end-to-end flow
- ✅ 99.9% uptime
- ✅ Scales to 1000+ users

---

## Conclusion

**Two repos is the right choice:**
- Demo stays pristine
- Production has clean architecture
- Docker makes deployment trivial
- Users get one-button experience
- You keep working reference

**Next Steps:**
1. Finish hackathon with demo repo
2. Create production repo structure
3. Build Docker all-in-one
4. Migrate components selectively
5. Test one-button deploy
6. Release to users

🎯 **Best of both worlds: Fast demo + Production-ready system**
