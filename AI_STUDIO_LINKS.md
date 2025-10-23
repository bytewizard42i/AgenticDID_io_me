# 🤖 Google AI Studio Agent Prompts

**Required for Hackathon Submission**

These are the public shareable links to our AI Studio prompts, demonstrating use of Google's AI Studio tools.

---

## Agent Prompts

### 1. Comet - AI Agent Orchestrator ✅
**Created**: October 23, 2025 at 6:00am
**Share Link**: https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221JLtXYW11X-Da7mpQeLgERQFjQGajCbK6%22%5D,%22action%22:%22open%22,%22userId%22:%22117323252760887931920%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing

**Description**: 
- Acts as local privacy-preserving coordinator for user AI agents
- Analyzes user intent from natural language requests
- Selects appropriate specialist agent (Banker, Shopper, Traveler)
- Verifies agent credentials using zero-knowledge proofs
- Coordinates multi-party authentication flows
- Maintains privacy through spoof transaction generation

**Key Capabilities**:
- Intent analysis and agent selection
- ZKP credential verification
- Privacy protection with 80% spoof ratio
- Multi-agent orchestration
- Security enforcement (reject revoked agents)

---

### 2. Banker - Financial AI Agent ✅
**Created**: October 23, 2025 at 6:25am
**Share Link**: https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221MJrRIK6CgUWoVAlsGT_OP6sTSirM0YT2%22%5D,%22action%22:%22open%22,%22userId%22:%22117323252760887931920%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing

**Description**: Financial operations agent
**Role**: finance
**Scopes**: read:balance, transfer:funds, read:transactions

**Key Capabilities**:
- Check account balances securely
- Transfer funds with authorization
- Generate transaction reports
- Verify user identity with ZKP
- Maintain cryptographic audit trail

---

### 3. Shopper - E-commerce AI Agent ✅
**Created**: October 23, 2025 at 6:51am
**Share Link**: https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221bkxOiEMp6N_t6hDBTTZ7uIxHpRkak2ap%22%5D,%22action%22:%22open%22,%22userId%22:%22117323252760887931920%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing

**Description**: Online shopping and purchase agent
**Role**: commerce
**Scopes**: search:products, purchase:items, read:orders

**Key Capabilities**:
- Search products with Gemini AI
- Shopping cart management
- Purchase authorization with ZKP
- Spoof queries to prevent tracking
- Order tracking and management

---

### 4. Traveler - Travel Booking AI Agent ✅
**Created**: October 23, 2025 at 7:06am (Gemini 2.5 Pro - 73 seconds of analysis!)
**Share Link**: https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221Er31jXUHlj3TZeURRKtWNfl0CMZOk8T9%22%5D,%22action%22:%22open%22,%22userId%22:%22117323252760887931920%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing

**Description**: Flight and hotel booking agent
**Role**: travel
**Scopes**: search:flights, book:travel, manage:reservations

**Key Capabilities**:
- Flight search with Gemini AI
- Hotel search with star ratings
- Booking reservations
- Mock travel API integration
- Beautiful flight cards with animations
- Hotel cards with images and amenities

---

## Usage in Hackathon Submission

These links will be included in the Devpost submission to demonstrate:
1. ✅ Use of Google AI Studio (required tool)
2. ✅ Prompt engineering for multi-agent system
3. ✅ Integration of AI-generated code with custom logic
4. ✅ Results-focused agent design

**Submission Note**: 
"All four agents were designed using Google AI Studio's prompt engineering interface. Each agent was given specific roles, scopes, and security requirements. The generated code was then integrated with our custom Midnight Network smart contracts for privacy-preserving verification."

---

**Last Updated**: October 23, 2025 at 6:03am
