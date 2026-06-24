# 🔮 AgenticDID Frontend - Real Protocol Implementation

**Production-ready React frontend with polished UI/UX**

Migrated from DEMO-LAND on November 16, 2025 with all refinements:
- ✅ All 11 RAs with mirrored hands (👋[icon]🤚)
- ✅ All TIs with gavel ([ icon]⚖️)
- ✅ British male voice for Comet (en-GB)
- ✅ Blink/glow animations synced with TTS
- ✅ Cancel & New Action workflow controls
- ✅ Tasks Prompt Banner for user guidance
- ✅ Semantic color system
- ✅ All 13 workflows mapped

---

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Open browser
# http://localhost:5173
```

### Production Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Docker

```bash
# Build image
docker build -t agenticdid-frontend .

# Run container
docker run -p 5173:5173 agenticdid-frontend
```

---

## 🔧 Configuration

Environment variables (see `.env.example`):

```bash
VITE_API_BASE=http://localhost:8787      # API Gateway
VITE_AGENTS_URL=http://localhost:3001    # Agents Runtime
VITE_MIDNIGHT_URL=http://localhost:3003  # Midnight Gateway
VITE_ENABLE_TTS=true                     # Browser TTS
```

---

## 📂 Project Structure

```
src/
├── App.tsx                    # Main application
├── agents.ts                  # Agent definitions & workflows
├── api.ts                     # Backend API client
├── components/
│   ├── TasksPromptBanner.tsx  # User guidance banner
│   ├── WorkflowVisualization.tsx  # Horizontal flow display
│   ├── AgentSelector.tsx      # RA selection & display
│   ├── VerifierDisplay.tsx    # TI display
│   ├── ActionPanel.tsx        # Task buttons
│   ├── MutualAuth.tsx         # Comet + AgenticDID
│   ├── Timeline.tsx           # Event log
│   ├── ResultBanner.tsx       # Success/error messages
│   ├── Header.tsx             # App header
│   └── Hero.tsx               # Landing section
├── hooks/
│   └── useSpeech.ts           # Browser TTS (British male)
└── index.css                  # Tailwind + animations
```

---

## 🎨 UI/UX Features

### Visual Language
- **RAs (Registered Agents):** Hands flanking icons (👋[icon]🤚)
- **TIs (Trusted Issuer/Verifiers):** Gavel on right ([icon]⚖️)
  - **Name Display:** "Agent" suffix removed (e.g., "Bank of America Agent" → "Bank of America")
  - **Status Preserved:** Parenthetical text kept (e.g., "Rogue Agent (Revoked)" → "Rogue (Revoked)")
  - **Rationale:** TIs are organizations that verify, not agents that act
- **Semantic Color System:** Each service has meaning (green=money, red=emergency, etc.)

### Animations
- **Blink:** 3×0.5s for selection (green border, pulsing shadow)
- **Glow:** Sustained success state (green RA, purple TI)
- **Confetti:** 30 pieces on successful verification
- **LED Racing Border:** On selected task

### Workflow Controls
- **Cancel Button:** Stops transaction immediately (red, left)
- **New Action Button:** Scrolls to tasks with reset (cyan, right)

### User Guidance
- **Tasks Prompt Banner:** Appears when clicking RAs/TIs
- Explains task-first workflow
- "Go to Tasks" button with smooth scroll

### Voice
- **Comet:** British male voice (Daniel/Arthur, en-GB)
- **Auto-selection:** Best available GB male voice
- **Fallback:** Any British English voice

---

## 🔄 Workflows

All 13 workflows automatically configured:

**Financial:**
1. Send $50 (Bank)
2. Buy 0.01 BTC (Crypto)

**E-Commerce:**
3. Buy Headphones (Amazon)

**Travel:**
4. Book Flight to NYC (Airline)

**Government:**
5. Register to Vote
6. Cast Ballot

**Healthcare:**
7. Book Doctor Appointment
8. Hospital Admission
9. Schedule IVF Consultation

**Education:**
10. View Transcript
11. My Diplomas and Certificates

**Insurance:**
12. Check Insurance Coverage
13. Interact with Medical Records

---

## 🔗 Backend Integration

### API Endpoints (Required)

Frontend expects these endpoints from API Gateway:

```typescript
POST /challenge
  → Generate nonce/challenge for agent
  
POST /present
  → Verify credential presentation
  body: { vp, challenge_nonce }
  response: { status, scopes, ... }
```

### Service URLs

Configured via environment variables:
- **API Gateway:** `http://localhost:8787`
- **Agents Runtime:** `http://localhost:3001` (future use)
- **Midnight Gateway:** `http://localhost:3003` (future use)

---

## 📚 Documentation

See `/docs-nerds-only/UI_UX_GUIDE.md` for:
- Complete UI/UX patterns
- Animation specifications
- Color system rationale
- Implementation guidelines

---

## 🐛 Troubleshooting

### Dev server won't start
```bash
rm -rf node_modules dist
bun install
bun run dev
```

### API calls failing
- Verify backend is running: `docker-compose up`
- Check `.env.local` has correct URLs
- Test API directly: `curl http://localhost:8787/health`

### Animations not working
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Check browser console for errors

---

## 🚀 Deployment

### Vercel (Recommended for Frontend)
```bash
vercel deploy --prod
```

### Google Cloud Run
```bash
gcloud run deploy agenticdid-frontend \
  --source . \
  --region us-central1
```

### Docker Compose
Frontend is included in root `docker-compose.yml`

---

**Built with 🔮 by John Santi & Cassie**  
**Polished UI/UX - Production Ready**
