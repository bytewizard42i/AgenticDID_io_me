# PrivateEye + ZKsplunk OPSEC Integration

> **Canonical spec:** [`PrivateEye/docs/PRIVATEEYE_ZKSPLUNK_OPSEC.md`](../PrivateEye/docs/PRIVATEEYE_ZKSPLUNK_OPSEC.md)

## AgenticDID's Role

AgenticDID binds an AI agent's authority to a responsible identity, permitted
purpose, scope, duration, and revocation state. PrivateEye translates an agent's
broad natural-language request into a bounded action that fits its delegated
authority.

**AgenticDID establishes what an agent may do. PrivateEye constrains what the
current request actually does. ZKsplunk monitors whether the agent remains
inside its operational envelope over time.**

### What ZKsplunk Observes from AgenticDID

- Scope creep
- Repeated attempts beyond authority
- Unusual tool usage
- Delegation-chain anomalies
- Agents acting after expiry or revocation
- Prompt-injection symptoms
- Unauthorized data destinations
- Coordinated behavior among multiple agents
- Unexpected changes in an agent's operational pattern
