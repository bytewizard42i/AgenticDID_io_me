# Demo Repo Cleanup Plan
**Goal:** Professional, well-documented codebase for hackathon judges  
**Timeline:** Complete before Nov 18 submission  
**Status:** IN PROGRESS

---

## Cleanup Phases

### Phase 1: File Organization ✅ (Starting Now)
- [ ] Create clear directory structure
- [ ] Move files to logical locations
- [ ] Remove unused files
- [ ] Add README to each directory

### Phase 2: Code Documentation 📝 (Next)
- [ ] Add verbose comments to all source files
- [ ] Document function purposes
- [ ] Explain data flow
- [ ] Add JSDoc comments

### Phase 3: Verification ✅ (Final)
- [ ] Test demo still works
- [ ] Verify all imports
- [ ] Check Docker build
- [ ] Final polish

---

## Current Structure Analysis

```
agentic-did/
├── apps/
│   ├── verifier-api/          # Backend API
│   └── web/                   # Frontend React app
├── packages/
│   ├── agenticdid-sdk/        # Core SDK types
│   └── midnight-adapter/      # Mock Midnight adapter
├── contracts/                 # Smart contracts (Compact)
├── ai-studio-generated/       # AI Studio prompts & configs
├── docs/                      # Documentation
├── scripts/                   # Build/deploy scripts
├── archive/                   # Old session logs
└── media/                     # Images/assets
```

---

## Proposed Clean Structure

```
agentic-did/
├── 📱 apps/                   # Application code
│   ├── web/                   # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/    # UI components
│   │   │   ├── pages/         # Page views
│   │   │   ├── hooks/         # React hooks
│   │   │   ├── lib/           # Utilities
│   │   │   └── types/         # TypeScript types
│   │   ├── public/            # Static assets
│   │   └── README.md          # Frontend docs
│   │
│   └── verifier-api/          # Backend (Fastify + Bun)
│       ├── src/
│       │   ├── routes/        # API endpoints
│       │   ├── services/      # Business logic
│       │   ├── lib/           # Utilities
│       │   └── types/         # TypeScript types
│       └── README.md          # Backend docs
│
├── 📦 packages/               # Shared packages
│   ├── agenticdid-sdk/        # Core SDK
│   │   ├── src/
│   │   │   ├── agent.ts       # Agent functions
│   │   │   ├── crypto.ts      # Cryptography
│   │   │   ├── proof.ts       # Proof generation
│   │   │   └── types.ts       # Type definitions
│   │   └── README.md
│   │
│   └── midnight-adapter/      # Midnight integration
│       ├── src/
│       │   ├── adapter.ts     # Main adapter (MOCK)
│       │   └── types.ts       # Type definitions
│       └── README.md
│
├── 📜 contracts/              # Smart contracts (Compact/Minokawa)
│   ├── AgenticDIDRegistry.compact
│   ├── CredentialVerifier.compact
│   ├── ProofStorage.compact
│   ├── test_minimal.compact
│   ├── minokawa/              # Minokawa tooling
│   └── README.md              # Contract documentation
│
├── 🤖 ai-studio/              # AI Studio configurations (RENAMED)
│   ├── prompts/               # Agent prompts
│   │   ├── banker/
│   │   ├── traveler/
│   │   └── shopper/
│   ├── services/              # AI services
│   └── README.md              # AI Studio guide
│
├── 📚 docs/                   # Documentation
│   ├── api/                   # API documentation
│   ├── architecture/          # System design docs
│   ├── guides/                # How-to guides
│   └── reference/             # Reference materials
│
├── 🔧 scripts/                # Automation scripts
│   ├── build.sh
│   ├── deploy.sh
│   ├── test.sh
│   └── README.md
│
├── 📦 archive/                # Historical/reference only
│   └── session-logs/
│
├── 🖼️  media/                 # Images and assets
│   └── README.md
│
├── 🐳 Docker files
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-quickstart.sh
│
└── 📄 Root files
    ├── README.md              # Main project README
    ├── package.json           # Monorepo config
    ├── .prettierrc            # Code formatting
    ├── .gitignore
    └── LICENSE
```

---

## Files to Move

### Organize AI Studio Files
```bash
mv ai-studio-generated/ ai-studio/
mkdir -p ai-studio/prompts
mv ai-studio/banker ai-studio/prompts/
mv ai-studio/traveler ai-studio/prompts/
mv ai-studio/shopper ai-studio/prompts/
```

### Organize Documentation
```bash
mkdir -p docs/{api,architecture,guides,reference}
# Move architecture docs
mv docs/PRIVACY_ARCHITECTURE.md docs/architecture/
mv docs/DIDZ_SUITE_ARCHITECTURE.md docs/architecture/
# Move guides
mv docs/QUICKSTART.md docs/guides/
mv docs/DEPLOYMENT_GUIDE.md docs/guides/
# Move reference
mv docs/reference/* docs/reference/ # Already organized
```

---

## Files to Add README

Each directory needs a README explaining:
- **Purpose** - What this directory contains
- **Structure** - How files are organized
- **Usage** - How to use these files
- **Related** - Links to related docs

### Priority READMEs to Create:
1. `apps/web/README.md` - Frontend guide
2. `apps/verifier-api/README.md` - Backend guide
3. `packages/agenticdid-sdk/README.md` - SDK documentation
4. `packages/midnight-adapter/README.md` - Adapter explanation
5. `contracts/README.md` - Smart contract guide
6. `ai-studio/README.md` - AI Studio setup
7. `scripts/README.md` - Script usage

---

## Code Files to Comment (Priority Order)

### Critical Files (Add verbose comments first):
1. **Backend API**
   - `apps/verifier-api/src/index.ts` - Main entry point
   - `apps/verifier-api/src/verifier.ts` - Verification logic
   - `apps/verifier-api/src/config.ts` - Configuration

2. **Frontend**
   - `apps/web/src/main.tsx` - Entry point
   - `apps/web/src/App.tsx` - Main app component
   - `apps/web/src/pages/Demo.tsx` - Demo page (main flow)

3. **Packages**
   - `packages/midnight-adapter/src/adapter.ts` - MOCK adapter (explain it's mock!)
   - `packages/agenticdid-sdk/src/agent.ts` - Agent functions
   - `packages/agenticdid-sdk/src/proof.ts` - Proof generation

4. **Smart Contracts**
   - `contracts/AgenticDIDRegistry.compact` - Already has 19 fixes documented
   - `contracts/CredentialVerifier.compact` - Add usage examples

---

## Comment Style Guide

### TypeScript/JavaScript Files:
```typescript
/**
 * ============================================================================
 * FILE PURPOSE
 * ============================================================================
 * 
 * Brief description of what this file does.
 * 
 * Key Responsibilities:
 * - Responsibility 1
 * - Responsibility 2
 * 
 * Data Flow:
 * Input → Processing → Output
 * 
 * Dependencies:
 * - Dependency 1: Why needed
 * - Dependency 2: Why needed
 * 
 * Used By:
 * - File 1: How it uses this
 * - File 2: How it uses this
 * 
 * @see Related documentation
 * ============================================================================
 */

/**
 * Function description
 * 
 * @param paramName - What this parameter represents
 * @returns What this function returns
 * @throws When and why this throws errors
 * @example
 * ```typescript
 * const result = functionName(param);
 * ```
 */
export function functionName(paramName: Type): ReturnType {
  // Step 1: Explain what happens here
  const step1 = doSomething();
  
  // Step 2: Explain next step
  const step2 = doAnotherThing(step1);
  
  // Return with explanation
  return step2;
}
```

### Compact Contract Files:
```compact
/**
 * ============================================================================
 * CONTRACT: Name
 * ============================================================================
 * 
 * Purpose: What this contract does
 * 
 * State Variables:
 * - variable1: What it stores and why
 * - variable2: What it stores and why
 * 
 * Key Circuits:
 * - circuit1: What it does
 * - circuit2: What it does
 * 
 * Privacy Model:
 * - What's public: X, Y, Z
 * - What's private: A, B, C
 * 
 * @see Documentation link
 * ============================================================================
 */

/**
 * Circuit: circuitName
 * 
 * Purpose: Detailed explanation of what this circuit does
 * 
 * Privacy: What witness data is used, what gets disclosed
 * 
 * Parameters:
 * @param param1 - Description and privacy implications
 * @param param2 - Description and privacy implications
 * 
 * Returns: What the circuit returns and why
 * 
 * Side Effects:
 * - Ledger changes: What gets modified
 * - State updates: What state changes
 * 
 * @example
 * How to call this circuit
 */
export circuit circuitName(param1: Type, param2: Type): ReturnType {
  // Step 1: Validation
  // Explain validation logic
  
  // Step 2: Business logic
  // Explain what happens
  
  // Step 3: State update
  // Explain state changes
}
```

---

## Testing After Each Change

After moving/changing files:
```bash
# 1. Verify build works
bun install
bun run build

# 2. Verify demo works
./docker-quickstart.sh

# 3. Check specific services
bun --cwd apps/web run dev
bun --cwd apps/verifier-api run dev
```

---

## Success Metrics

- [ ] All directories have clear README files
- [ ] All source files have verbose header comments
- [ ] All functions have JSDoc comments
- [ ] File organization is intuitive
- [ ] Demo still works perfectly
- [ ] No broken imports
- [ ] Clean git history (meaningful commits)
- [ ] Professional appearance for judges

---

## Timeline

**Day 1 (Today):** File organization + critical READMEs  
**Day 2:** Comment backend API + packages  
**Day 3:** Comment frontend + contracts  
**Day 4:** Polish, test, verify  
**Day 5:** Final review before submission  

---

## Notes

- **Don't delete anything** - Move to archive if unsure
- **Test frequently** - Don't break the demo
- **Commit often** - Small, atomic commits
- **Document as you go** - Don't leave for later

**Remember: The goal is professional presentation for hackathon judges! 🏆**
