# 🔮 AgenticDID - Real Protocol Implementation

**The Identity Layer for the Fi Ecosystem**

This is the production-ready implementation of AgenticDID, separated from the demo for safety and modularity.

## 🏗️ Architecture

```
AgenticDID_io_me_REAL-DEAL/
├── frontend/              ← React UI (deploy to Vercel or Cloud Run)
├── backend/              ← All backend services
│   ├── api/              ← Main API Gateway (Fastify)
│   ├── agents-runtime/   ← Google ADK + Claude agents
│   └── services/         ← Microservices (Midnight, TTS, etc.)
├── protocol/             ← Smart contracts + SDK
├── infrastructure/       ← Deployment configs (Render, Cloud Run, Docker)
└── docs-nerds-only/      ← Technical documentation
```

## 🚀 Quick Start (One Button!)

```bash
# Local development (Docker)
./start-everything.sh

# Or manual
docker-compose up --build
```

**Access**:
- Frontend: http://localhost:5173
- API: http://localhost:8787
- Agents: http://localhost:3000
- Docs: http://localhost:8080

## 📦 Deployment

### Hackathon (Google Cloud Run)
```bash
cd infrastructure/cloud-run
./deploy-all.sh
```

### Production (Vercel + Render)
```bash
# Frontend to Vercel
cd frontend/web
vercel deploy --prod

# Backend to Render
render deploy -f infrastructure/render.yaml
```

## 🔑 Environment Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Fill in required values:
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
MIDNIGHT_RPC_URL=https://testnet.midnight.network
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account"...}

# Optional
ENABLE_LISTEN_IN_MODE=true
TTS_PROVIDER=google
```

## 📚 Documentation

See [`docs-nerds-only/README.md`](./docs-nerds-only/README.md) for complete documentation.

## 🎯 Roadmap

- ✅ Phase 1: AI Agent Identity (Demo complete)
- 🔄 Phase 2: Real Midnight Integration (Q4 2025)
- 🔜 Phase 3: Human Identity (DIDz Protocol - Q1 2026)
- 🔮 Phase 4: Agentic Commerce (Q2 2026)
- 🔮 Phase 5: Fi Ecosystem Infrastructure (2027+)

## 🔗 Related Repos

- [Demo Repo](https://github.com/bytewizard42i/AgenticDID_io_me) - Frozen demo/prototype
- [Documentation](../AgenticDID_DEMO-LAND/agentic-did/docs/GRAND_VISION.md) - Complete vision

---

**Built with 🔮 by John Santi & the AgenticDID Team**  
**Powered by Midnight Network, Google ADK, and Claude AI**
