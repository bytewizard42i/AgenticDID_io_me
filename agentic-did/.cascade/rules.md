# AgenticDID Phase 2 Build Rules

## Core Architecture Principle

**Preserve the demo UI/UX exactly while replacing all mock backend components with real Midnight Network integration.**

---

## Frontend Development (React + Vite)

**All UI components must remain visually and functionally identical to the demo - users should not notice any difference in look or feel.**

**Use Vite for development and build tooling - it's already configured and working perfectly with the project.**

**Keep all existing component structure in `apps/web/src/components/` - do not refactor UI architecture unless absolutely necessary.**

**The verification timeline, Listen In Mode toggle, and goal selection interface are sacred - these define the UX and must not change.**

**All new functionality must be added behind the existing UI - the frontend should only swap API responses, not change visual presentation.**

---

## Backend Development (Bun Runtime)

**Use Bun as the runtime for all backend services - it's faster than Node and already configured in the project.**

**The Fastify API in `apps/verifier-api/` keeps its exact same endpoint contract - `/challenge`, `/verify`, `/capability` endpoints must maintain their request/response format.**

**When replacing the Midnight adapter, implement the same interface (`IMidnightAdapter`) so the API layer doesn't need changes.**

**Create new packages under `packages/` directory for new functionality - keep the monorepo structure clean.**

**Use `bun install` for dependencies and `bun run dev` for development - maintain consistency with existing scripts.**

---

## Midnight/Compact Smart Contracts

**Use Compact language version 0.18.0 (Minokawa) - all contracts in `contracts/` are already written for this version.**

**The 19 critical fixes in the contracts are already applied - do not modify the contracts without understanding why each fix was needed (see CONTRACT_REVIEW_AND_FIXES.md).**

**Always use `disclose()` wrapper when storing witness data in ledger - this is Midnight's privacy protection mechanism.**

**Compile contracts using Docker image `midnightnetwork/compactc:latest` - do not attempt local compilation without Docker.**

**Use `--skip-zk` flag during development for fast iteration, remove it only for production builds to generate proving keys.**

**All hash functions should use `persistentHash()` from CompactStandardLibrary for on-chain data - never use custom hashing.**

**Contract deployment to testnet requires saving contract addresses in environment variables - document these addresses immediately after deployment.**

---

## Agent Development (AI Studio + Runtime)

**All agents must implement the `BaseAgent` interface with `execute()` method that returns results + ZK proofs + transcripts.**

**Use Google AI Studio to create and test agent prompts before implementing in code - save prompt share links in documentation.**

**The four agents are: Comet (orchestrator), Banker, Traveler, Shopper - do not add new agents without corresponding smart contract updates.**

**Agent execution must generate ZK proofs proving: valid credential + valid delegation + action within scope + knowledge of private key.**

**The Listen In Mode feature requires agents to produce human-readable transcripts - this is not optional, it's a core differentiator.**

**Agent responses must include timing information so the frontend can simulate the 10-15s Listen In Mode vs 2-3s Fast Mode experience.**

---

## Deployment Strategy

**Use Vercel for frontend deployment - it provides zero-config React deployment with automatic HTTPS and global CDN.**

**Use Render for backend API deployment - it's cost-effective and supports Docker containers which we already have.**

**For Midnight Summit Hackathon: Deploy contracts to Midnight Testnet_02 network using the testnet RPC endpoint.**

**Never hardcode private keys or contract addresses in code - always use environment variables loaded from `.env` files.**

**Maintain separate `.env.development` and `.env.production` files - development can use mock mode, production must use real mode.**

**Docker Compose configuration in `docker-compose.yml` must support both mock mode (demo) and real mode (production) via MODE environment variable.**

---

## Development Workflow

**Always run the demo first using `./docker-quickstart.sh` to verify it still works before making changes.**

**Create new packages in `packages/` with their own `package.json` and proper TypeScript configuration.**

**Use `bun workspaces` to manage the monorepo - all packages should be linked properly.**

**Write end-to-end tests in `tests/e2e/` that verify the entire flow from wallet connection to agent execution with proofs.**

**Performance target is <5 seconds for complete verification flow in production - use caching and optimization if needed.**

---

## Privacy & Security

**The spoof transaction system in PRIVACY_ARCHITECTURE.md must be preserved - 80% fake queries to hide real transactions.**

**Private keys must never leave the client side - all signing happens in Lace wallet, never on the server.**

**Every proof must be verified on-chain via the CredentialVerifier contract - never trust client-provided verification results.**

**Delegation scopes must be strictly enforced - an agent with `bank:balance` scope cannot execute `bank:transfer` actions.**

**Revocation must be checked on every verification - a revoked credential must immediately fail all checks.**

---

## Lace Wallet Integration

**Use `@midnight-ntwrk/lace-wallet-connector` for wallet integration - do not implement custom wallet connection logic.**

**Wallet connection must happen before any agent execution - check connection status and prompt user if not connected.**

**Delegation signing must happen in the wallet using `signMessage()` - the signature proves user intent to delegate.**

**Store the wallet DID in React state but never persist it beyond the session - wallet reconnection handles DID retrieval.**

---

## Code Quality

**Follow the existing code style - the project uses Prettier with config in `.prettierrc`.**

**TypeScript strict mode is enabled - all code must have proper types, no `any` unless absolutely necessary.**

**Document all exported functions with JSDoc comments explaining parameters, return values, and side effects.**

**Use descriptive variable names that explain intent - `agentDID` not `did`, `userDelegation` not `deleg`.**

**Keep functions small and focused - if a function is over 50 lines, consider breaking it into smaller functions.**

---

## Documentation

**Update README.md immediately when adding new features - users must understand how to use the system.**

**Maintain the PHASE2_IMPLEMENTATION.md roadmap document - check off tasks as completed.**

**Add inline comments for complex logic, especially ZK proof generation and verification code.**

**The 27 Midnight documentation files in the repo are reference material - link to relevant sections when explaining Midnight features.**

**Create a CHANGELOG.md to track all changes between demo (Phase 1) and production (Phase 2) versions.**

---

## External Dependencies

**Clone the `i-am-midnight` reference repo for examples and patterns - it contains battle-tested Midnight integration code.**

**Use Mesh SDK (`@meshsdk/midnight`) version compatible with testnet_02 - check the support matrix in docs.**

**Google AI Studio prompts should be version-controlled by saving their share links in `ai-studio-generated/` directory.**

**Monitor Midnight Network status at https://status.midnight.network before debugging testnet connection issues.**

---

## Testing Requirements

**Every agent must have unit tests verifying proof generation works correctly.**

**Integration tests must verify the adapter correctly queries on-chain registry and returns proper credential data.**

**End-to-end tests must use real testnet contracts, not mocks - this ensures production readiness.**

**Performance tests must measure proof generation time, on-chain query latency, and total verification flow time.**

---

## Reference Resources

**Reference the official Midnight documentation at https://docs.midnight.network/develop/tutorial for integration patterns and examples.**

**Check DEV Community posts tagged with #midnightchallenge for real-world dApp examples and integration patterns.**

**The midnight-ntwrk GitHub organization has 4 public repos: releases, rs-merkle, partner-chain-deps-docker, .github - use these for reference implementations.**

**Monitor https://midnight.network/blog for State of the Network updates which announce new example repositories and features.**

---

## Success Criteria

**Phase 2 is complete when: UI looks identical to demo + all verifications use real ZK proofs + contracts deployed to testnet + Lace wallet works + end-to-end flow under 5 seconds.**
