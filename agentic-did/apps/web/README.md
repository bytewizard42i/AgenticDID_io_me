# Frontend Application (React + Vite)

**Privacy-Preserving AI Agent Identity Demo**

---

## Overview

This is the frontend UI for the AgenticDID demo. It provides an interactive interface demonstrating how AI agents authenticate and execute goals using privacy-preserving credentials.

**Technology Stack:**
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Bun** - Runtime (faster than Node.js)

---

## What This Frontend Does

### User Experience Flow

1. **User selects a goal:**
   - "Send $100 to Bob" (Bank agent)
   - "Buy headphones" (Shopping agent)
   - "Book flight to NYC" (Travel agent)

2. **System auto-selects appropriate agent:**
   - Goal triggers agent selection logic
   - Right agent for the task (Banker, Shopper, Traveler)

3. **Verification happens:**
   - Frontend requests challenge from API
   - Agent builds proof (VP)
   - Frontend submits proof for verification
   - API returns capability token or error

4. **Result displayed:**
   - Success: Green checkmark + agent action result
   - Failure: Red X + error message
   - Timeline shows verification steps

### Key Features

**Listen In Mode** 🎤
- Toggle to hear agent communication via text-to-speech
- Transparent mode: ~10-15 seconds with TTS narration
- Fast mode: ~2-3 seconds silent execution
- Demonstrates transparency vs efficiency tradeoff

**Results-Focused UX**
- User states goal, not process
- System handles implementation
- Inspired by Charles Hoskinson's vision

**Interactive Timeline**
- Shows verification steps in real-time
- Visual feedback for each phase
- Educational for understanding flow

---

## File Structure

```
apps/web/
├── src/
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # Main application component
│   ├── agents.ts          # Agent configuration
│   ├── api.ts             # API client for verifier
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   │   └── useSpeech.ts   # Text-to-speech for Listen In Mode
│   └── pages/             # Page components
│
├── public/                # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

---

## Running the Frontend

### Development Mode

```bash
# From repository root
bun run dev

# Or directly
cd apps/web
bun run dev
```

**Access:** http://localhost:5175

### Production Build

```bash
cd apps/web
bun run build
```

Output in `dist/` directory ready for deployment.

---

## Key Components

### `App.tsx`
Main application component that orchestrates the demo flow.

**Responsibilities:**
- Goal selection UI
- Agent selection logic
- Verification flow coordination
- Result display

### `agents.ts`
Agent configuration defining available agents and their capabilities.

**Defines:**
- Agent types (Banker, Traveler, Shopper)
- Agent credentials (mock for demo)
- Goal → Agent mapping

### `api.ts`
API client for communication with verifier backend.

**Endpoints:**
- `POST /challenge` - Request verification challenge
- `POST /verify` - Submit VP for verification
- Error handling and retries

### `hooks/useSpeech.ts`
Text-to-speech hook for Listen In Mode.

**Features:**
- Browser speech synthesis API
- Queue management for multiple messages
- Configurable voice and rate
- Pause/resume support

---

## Configuration

### Environment Variables

```bash
# .env file
VITE_API_BASE=http://localhost:8787  # Verifier API URL
VITE_MODE=demo                       # demo | production
```

### Vite Configuration

Key settings in `vite.config.ts`:
- Port: 5175
- Proxy to API (development)
- Build optimizations
- TypeScript support

---

## Demo vs Production

### Demo Mode (Current)

**What's Mock:**
- Agent credentials (in-memory, not on-chain)
- Verification (string matching, not ZK proofs)
- No Lace wallet required
- Instant responses

**What's Real:**
- Full UX flow
- Challenge-response protocol
- Result display
- All UI interactions

### Production Mode (Phase 2)

**Will Add:**
- Lace wallet integration
- Real Midnight Network connection
- On-chain credential verification
- Real ZK proof generation
- ~500ms verification time (vs <1ms demo)

**Will Keep:**
- Exact same UI/UX
- Listen In Mode feature
- Goal selection interface
- Results display

---

## Development Guide

### Adding a New Agent Type

1. **Define in `agents.ts`:**
   ```typescript
   export const AGENTS = {
     // ... existing agents
     'Doctor': {
       role: 'Doctor',
       scopes: ['health:diagnose', 'health:prescribe']
     }
   };
   ```

2. **Add goal mapping:**
   ```typescript
   export function selectAgentForGoal(goal: string): string {
     if (goal.includes('health') || goal.includes('medical')) {
       return 'Doctor';
     }
     // ... existing mappings
   }
   ```

3. **UI will automatically use new agent!**

### Customizing Listen In Mode

Edit `hooks/useSpeech.ts`:
```typescript
// Change voice
const voice = voices.find(v => v.name.includes('Samantha'));

// Change speaking rate
utterance.rate = 1.2;  // 1.0 is normal

// Change pitch
utterance.pitch = 1.1;  // 1.0 is normal
```

---

## Styling

**TailwindCSS** is used for all styling.

**Color Scheme:**
- Primary: Purple (`bg-purple-600`)
- Success: Green (`bg-green-500`)
- Error: Red (`bg-red-500`)
- Background: Dark (`bg-gray-900`)

**Responsive:**
- Mobile-first design
- Breakpoints: sm, md, lg, xl
- All components responsive

---

## Performance

**Bundle Size:**
- Development: ~2MB (includes source maps)
- Production: ~150KB gzipped

**Load Time:**
- First paint: <1s
- Interactive: <2s
- Demo execution: 2-15s (depending on Listen In Mode)

**Optimizations:**
- Code splitting by route
- Lazy loading components
- Tree shaking unused code
- Minification and compression

---

## Testing

```bash
# Run tests (when available)
bun test

# Type checking
bun run tsc --noEmit

# Linting
bun run lint
```

---

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

Auto-detects Vite, zero configuration needed.

### Manual Deployment

```bash
# Build
bun run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - GitHub Pages
# - Any static host
```

---

## Troubleshooting

### API Connection Issues

**Problem:** "Failed to fetch" or CORS errors

**Solution:**
- Check `VITE_API_BASE` environment variable
- Ensure verifier API is running (port 8787)
- Verify CORS configuration in API

### Listen In Mode Not Working

**Problem:** No speech output

**Solution:**
- Check browser supports Web Speech API (Chrome, Edge, Safari)
- Firefox has limited support
- Enable sound/unmute
- Check browser permissions

### Build Failures

**Problem:** TypeScript or build errors

**Solution:**
```bash
# Clear cache
rm -rf node_modules dist
bun install
bun run build
```

---

## Contributing

When making changes:

1. **Preserve UX** - Don't change user-facing behavior
2. **Test thoroughly** - Try all scenarios
3. **Check responsiveness** - Test on mobile
4. **Update this README** - Document new features

---

## Resources

- **Vite Docs:** https://vitejs.dev
- **React Docs:** https://react.dev
- **TailwindCSS:** https://tailwindcss.com
- **Bun:** https://bun.sh

---

## License

MIT - See LICENSE file in repository root
