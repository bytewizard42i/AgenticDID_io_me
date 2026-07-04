# Frontend Migration Plan: DEMO-LAND → REAL-DEAL

**Date:** November 16, 2025  
**Status:** In Progress

---

## 🎯 Objective

Copy the polished frontend from DEMO-LAND to REAL-DEAL and configure it to work with real backend services (API Gateway, Agents Runtime, Midnight Gateway).

---

## 📋 Pre-Migration Analysis

### Source (DEMO-LAND)
```
/apps/web/
├── src/
│   ├── App.tsx (25KB - main app with all workflows)
│   ├── agents.ts (11KB - agent definitions, workflow mappings)
│   ├── api.ts (714 bytes - API client)
│   ├── components/ (10 items)
│   │   ├── TasksPromptBanner.tsx
│   │   ├── WorkflowVisualization.tsx
│   │   ├── AgentSelector.tsx
│   │   ├── VerifierDisplay.tsx
│   │   ├── ActionPanel.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── useSpeech.ts
│   └── index.css (2KB - animations, Tailwind)
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── index.html
```

### Target (REAL-DEAL)
```
/frontend/web/  (NEW - will be created)
```

### Backend Infrastructure (Already Exists)
```
/backend/
├── api/ (Port 8787) - Fastify API Gateway
├── agents/ (Port 3001) - Google ADK + Claude
└── midnight/ (Port 3003) - Midnight Gateway
```

---

## 🔄 Migration Steps

### Phase 1: Create Directory Structure ✅

1. Create `/frontend/web/` directory
2. Create subdirectories matching DEMO-LAND structure

### Phase 2: Copy Core Files

**Files to Copy As-Is:**
- ✅ `index.html`
- ✅ `postcss.config.js`
- ✅ `tailwind.config.js`
- ✅ `tsconfig.json`
- ✅ `tsconfig.node.json`
- ✅ `vite.config.ts`
- ✅ All `/src/components/*`
- ✅ All `/src/hooks/*`
- ✅ `/src/index.css`
- ✅ `/src/main.tsx`

**Files to Modify:**
- ⚠️ `package.json` - Remove `@agenticdid/sdk` dependency (not built yet)
- ⚠️ `src/api.ts` - Already uses environment variables (good!)
- ⚠️ `src/App.tsx` - Remove SDK imports, keep mock functions
- ⚠️ `src/agents.ts` - Keep as-is (just definitions)

### Phase 3: Configuration Files

**Create New Files:**
1. `.env.example` - Template for environment variables
2. `.env.local` - Local development config
3. `Dockerfile` - Container for production
4. `.dockerignore` - Exclude node_modules, etc.
5. `README.md` - Frontend-specific docs

**Environment Variables:**
```bash
VITE_API_BASE=http://localhost:8787
VITE_AGENTS_URL=http://localhost:3001
VITE_MIDNIGHT_URL=http://localhost:3003
VITE_ENABLE_TTS=true
```

### Phase 4: Package.json Updates

**Changes Needed:**
```json
{
  "name": "@agenticdid/web-real",
  "dependencies": {
    // REMOVE: "@agenticdid/sdk": "*"  (not ready yet)
    // KEEP: All other deps (react, lucide-react, etc.)
  }
}
```

### Phase 5: Docker Integration

**Add to docker-compose.yml:**
```yaml
frontend:
  build:
    context: ./frontend/web
    dockerfile: Dockerfile
  ports:
    - "5173:5173"
  environment:
    - VITE_API_BASE=http://api-gateway:8787
    - VITE_AGENTS_URL=http://agents-runtime:3001
    - VITE_MIDNIGHT_URL=http://midnight-gateway:3003
  volumes:
    - ./frontend/web/src:/app/src
  networks:
    - agenticdid-network
  depends_on:
    - api-gateway
```

### Phase 6: API Integration Points

**Current API Calls (in api.ts):**
```typescript
getChallenge(audience) → POST /challenge
presentVP(vp, nonce) → POST /present
```

**Backend Must Provide:**
- `POST /challenge` - Generate nonce/challenge
- `POST /present` - Verify credential presentation
- `GET /health` - Health check (already exists)

### Phase 7: Testing & Verification

1. ✅ Frontend builds successfully
2. ✅ Vite dev server starts
3. ✅ All components render
4. ✅ API calls reach backend (may fail, but connection works)
5. ⚠️ Full workflow testing (Phase 2 work)

---

## 🚨 Critical Considerations

### 1. SDK Dependency
- DEMO-LAND imports `@agenticdid/sdk` 
- SDK doesn't exist in REAL-DEAL yet
- **Solution:** Remove imports, keep mock credential functions in App.tsx

### 2. Backend API Compatibility
- Frontend expects `/challenge` and `/present` endpoints
- Need to verify backend API implements these
- May need to create adapter layer

### 3. TTS Integration
- DEMO-LAND uses browser TTS (no backend needed)
- This will work as-is
- **Keep:** British male voice configuration

### 4. Workflow Mappings
- All 13 workflows defined in `agents.ts`
- These are just definitions (no backend dependency)
- **Safe to copy as-is**

### 5. Animations & UI
- All CSS animations in `index.css`
- Pure frontend, no backend dependency
- **Safe to copy as-is**

---

## 📦 Dependencies Analysis

### Will Work Immediately:
- ✅ React, React-DOM
- ✅ Lucide Icons
- ✅ TailwindCSS
- ✅ Vite
- ✅ Browser TTS API
- ✅ All UI components

### Need Backend Support:
- ⚠️ API authentication
- ⚠️ Challenge generation
- ⚠️ VP verification
- ⚠️ Midnight proof verification

### Future Work (Phase 2+):
- 🔜 Real Midnight Network integration
- 🔜 Google ADK agents
- 🔜 Actual ZK proofs
- 🔜 Smart contract calls

---

## 🎯 Success Criteria (Phase 1)

- [  ] Frontend directory created
- [  ] All files copied
- [  ] Dependencies installed (`bun install`)
- [  ] Dev server starts (`bun run dev`)
- [  ] UI loads at http://localhost:5173
- [  ] All components visible and interactive
- [  ] API calls attempt to reach backend (connection works)
- [  ] Docker build succeeds
- [  ] Added to docker-compose.yml

---

## 📝 Notes

- UI/UX is production-ready (just polished in DEMO-LAND)
- Backend infrastructure exists but needs endpoint verification
- This migration preserves all the beautiful work we did today
- Enables iterative backend integration in Phase 2

---

**Next Steps After Phase 1:**
1. Verify backend API endpoints exist
2. Test authentication flow
3. Integrate real Midnight Network
4. Test end-to-end workflows
5. Deploy to staging environment
