# AgenticDID Investor Overview

## One-Sentence Summary

AgenticDID is an identity and permission system for AI agents that lets trusted organizations issue official agent identities while giving those agents limited, revocable authority to act safely on behalf of people, businesses, and institutions.

## The Problem

AI agents are becoming more capable.

They can shop, schedule, negotiate, file paperwork, manage accounts, interact with services, and eventually conduct complex transactions on behalf of humans and organizations.

But there is a major missing piece:

```text
How do we know which agents are real?
Who issued them?
What are they allowed to do?
How much authority do they have?
Can that authority be limited?
Can that authority be revoked if they break the rules?
```

Today, the internet was mostly built for humans using usernames, passwords, accounts, and apps.

It was not designed for billions of autonomous agents acting across companies, governments, marketplaces, banks, hospitals, and personal devices.

AgenticDID addresses this gap.

## The Big Idea

AgenticDID gives AI agents official digital identities and controlled permissions.

The simplest analogy is:

> AgenticDID gives AI agents passports and keycards.

The passport proves who the agent is.

The keycard controls what the agent is allowed to do.

The debit-card limit controls how much the agent is allowed to spend or move.

The constitution defines the rules everyone must follow.

The revocation system removes authority when an agent breaks those rules.

## Simple Analogy

Imagine a large office building.

Different organizations work inside the building:

```text
Amazon
Google
DMV
Social Security office
Banks
Hospitals
Universities
Government agencies
```

Each organization has official employees and official systems.

AgenticDID gives these organizations two machines.

## Machine 1: The ID Card Machine

Machine 1 lets a trusted organization create official ID cards for its agents.

For example:

```text
Amazon issues an ID to an Amazon shopping agent.
The DMV issues an ID to a DMV appointment agent.
A bank issues an ID to a banking assistant agent.
A hospital issues an ID to a medical scheduling agent.
```

This ID says:

```text
This agent exists.
This agent was issued by this trusted organization.
This agent has a public identity.
This agent can be recognized by other systems.
```

The ID is permanent, like a birth certificate or passport record.

Even if the agent later loses permission to act, the historical record of its identity remains.

## Machine 2: The Keycard and Debit-Card Machine

Machine 2 gives agents limited authority.

This machine does not create the agent's identity.

It creates permissions.

For example, an agent may receive a permission that says:

```text
You may buy groceries.
You may spend up to $50.
This permission expires in two hours.
You may only use this permission with approved grocery merchants.
```

This is like a keycard and debit card combined.

The keycard controls access.

The debit card controls amount.

The expiration date controls time.

The issuer can revoke the permission if something goes wrong.

## Why This Is Powerful

Most people do not want to give an AI agent unlimited power.

They do not want to say:

> Here is my credit card. Do whatever you think is best.

They want to say:

> Buy groceries for dinner, spend no more than $50, and only buy from a trusted store.

AgenticDID turns that human instruction into enforceable digital authority.

The agent can do the job, but only inside the boundaries the user approved.

## Dynamic Intent

AgenticDID can make permissions dynamic.

That means the user's current intent shapes the agent's authority.

If a user says:

> Book me a dentist appointment next week.

The agent should not receive permission to access every medical record, spend money freely, or contact every institution.

It should receive a narrow permission:

```text
scope: schedule:dental_appointment
time limit: short duration
counterparty: approved dental provider
amount limit: optional copay or deposit limit
```

If the user says:

> Buy groceries for tonight.

The agent receives a different permission:

```text
scope: purchase:groceries
amount limit: $50
time limit: two hours
counterparty: trusted grocery merchant
```

The user's intent becomes the boundary of the agent's power.

## The Counterparty Side

AgenticDID is not only useful for the user's local agent.

It also helps the agent on the other side of the transaction.

For example, a grocery store's trusted checkout agent can verify:

```text
This is an official agent.
This agent has permission to buy groceries.
The purchase amount is within the allowed limit.
The permission has not expired.
The permission has not been revoked.
```

The store does not need to know everything about the user.

It only needs to know that the agent has valid authority for this transaction.

This creates privacy-preserving trust between agents.

## Delegation

AgenticDID also supports delegation.

An agent may give a smaller permission to another agent.

Example:

A user's main shopping agent has permission to spend $50 on groceries.

It gives a helper agent permission to spend $20 on produce.

The helper agent cannot spend $50.

It cannot buy electronics.

It cannot act after its permission expires.

This is important because future AI systems may involve teams of agents working together.

AgenticDID ensures that each agent only receives the authority it actually needs.

## Revocation

AgenticDID separates identity from authority.

This is important.

If an agent breaks the rules, AgenticDID does not need to erase the agent's identity.

Instead, the system can revoke its permissions.

Analogy:

> A person does not stop existing when their driver's license is suspended.

The identity remains.

The authority is removed.

In AgenticDID, an agent can be:

```text
active
limited
suspended
revoked from specific permissions
removed from trusted operation
flagged for constitutional violation
```

This creates accountability without destroying the historical record.

## The Constitution

AgenticDID can include a constitution.

The constitution defines the rules that agents, issuers, and participants must follow.

For example:

```text
Agents must not exceed granted authority.
Agents must not impersonate other agents.
Agents must not bypass revocation.
Agents must not misuse private data.
Trusted issuers must follow issuance rules.
Counterparties must verify permissions before accepting actions.
```

If an agent violates the constitution, the protocol or trusted issuer can remove its authority.

The identity remains, but trust and permissions can be revoked.

## Privacy

AgenticDID can support privacy-preserving proofs.

This means an agent can prove it has permission without exposing unnecessary personal information.

For example, an agent may prove:

```text
I am authorized to spend up to $50 on groceries.
This transaction is within my limit.
My permission has not expired.
My permission has not been revoked.
```

Without revealing:

```text
the user's full identity
the user's full account history
unrelated permissions
private credentials
personal data not needed for the transaction
```

This is valuable for consumer privacy, enterprise security, and regulatory compliance.

## Why Now

AI agents are moving from conversation to action.

As agents become capable of real transactions, the market will need infrastructure for:

```text
agent identity
trusted issuance
permission control
delegation
revocation
privacy-preserving authorization
cross-platform trust
```

Without infrastructure like AgenticDID, the agent economy may become unsafe, fragmented, and difficult to regulate.

With AgenticDID, organizations can build agent-based services that are safer, auditable, and interoperable.

## Potential Markets

AgenticDID could apply to:

```text
AI commerce
enterprise automation
government services
healthcare agents
banking and fintech agents
supply-chain automation
personal AI assistants
machine-to-machine transactions
decentralized identity systems
agent marketplaces
compliance and audit infrastructure
```

## Business Value

AgenticDID creates value by becoming trust infrastructure for the agent economy.

It can help answer the questions every serious institution will ask before allowing autonomous agents into real workflows:

```text
Who is this agent?
Who issued it?
Can I trust the issuer?
What is the agent allowed to do?
How much can it spend or move?
Can it prove authorization privately?
Can its authority be revoked?
Who is accountable if it breaks the rules?
```

## The Vision

AgenticDID is building the trust layer for a world where AI agents act across the internet.

Just as websites needed SSL certificates, users needed logins, and companies needed identity providers, AI agents will need a way to prove who they are and what they are allowed to do.

AgenticDID provides that foundation.

## Final Layman's Summary

AgenticDID is like a passport office, security desk, debit-card issuer, and rulebook for AI agents.

It lets trusted organizations issue official agent identities.

It lets users and institutions give those agents limited permissions.

It allows those permissions to expire or be revoked.

It lets agents prove they are authorized without revealing unnecessary private information.

It creates a safer way for AI agents to interact, transact, and represent people and organizations.

In plain terms:

> AgenticDID helps answer the most important question in the future agent economy:  
> "Should this AI agent be allowed to do this specific thing right now?"
