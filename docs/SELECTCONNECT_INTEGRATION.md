# AgenticDID × SelectConnect — AI Agent Contact Protocol

*How SelectConnect's progressive reveal and abuse bonds govern how AI agents request access to human data, attention, and services — creating the first economically accountable human-AI contact protocol.*

---

## The Problem

AI agents increasingly need to:
- Request access to user data (with user consent)
- Contact humans on behalf of other humans or organizations
- Negotiate service agreements autonomously
- Prove their authorization and capabilities

Without SelectConnect, AI agent outreach is unregulated spam. With it, every AI contact request has **economic accountability** and **progressive disclosure**.

---

## Integration Model

### AI Agent → Human Contact

```
AI Agent (DIDz-verified via AgenticDID):
  → Creates SelectConnect card with agent credentials
  → "Authorized by [Organization] ✓" (DIDz delegation chain)
  → "Purpose: [specific task] ✓" (disclosed at Level 1)
  → Posts bond (higher for AI agents than humans — trust premium)

Human recipient:
  → Sees Level 1: Agent name + purpose + authorization proof
  → Decides whether to grant access
  → Accept: Progressive reveal of agent's capabilities + data access
  → Decline: Bond returned
  → Report (unauthorized/spam agent): Bond slashed, delegation chain notified
```

### Human → AI Agent Request

```
Human needs AI service:
  → Scans agent's SelectConnect QR or enters privacy route code
  → Level 1 (free): Agent capabilities + "Authorized ✓"
  → Level 2 (bond): Service terms + pricing + SLA
  → Level 3 (mutual): Full data access grant + service execution
  → Revocable at any time: revokeLink() stops agent's data access
```

### AI Agent → AI Agent Negotiation

Two agents negotiating on behalf of their respective principals:
- Progressive reveal of negotiating positions
- Bonds ensure good-faith engagement
- Each level unlocks more detail
- Principals (humans) can override/revoke at any stage

---

## Trust Premium for AI Agents

AI agents pay higher bonds than humans because:
- They can send thousands of requests per second (bots are cheap)
- Escalating bonds prevent mass-automation of contact requests
- Good-faith agents build reputation → lower bonds over time
- Rogue agents get slashed → exponentially increasing costs

```
Bond structure:
  Human → Human: 3 ADA base
  AI Agent → Human: 10 ADA base (3.3x trust premium)
  AI Agent → AI Agent: 5 ADA base
  Slashed AI Agent: +100% per slash (vs +50% for humans)
```

---

## Related Documents

- AgenticDID Architecture: `AgenticDID/README.md`
- DIDz Identity Integration: `DIDz-io/docs/SELECTCONNECT_IDENTITY_INTEGRATION.md`
- SelectConnect Ecosystem Map: `selectConnect/docs/ECOSYSTEM_INTEGRATIONS.md`

---

*Last updated: March 22, 2026 — Penny 🎀*
