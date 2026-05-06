# 📡 Project Beacons — Integration with EventRevolution

> **Source of truth:** [`EventRevolution/docs/PROJECT_BEACONS.md`](https://github.com/bytewizard42i/DIDzMonolith/blob/main/EventRevolution/docs/PROJECT_BEACONS.md) — read that first.
>
> **Inspiration video:** [Beacon Technology — Using Beacons in Proximity Marketing](https://youtu.be/2YorsgulwdU?si=UNPxybBfCewfBZnV).
>
> **Why this matters to AgenticDID:** Project Beacons are the **physical sensor input** that gives the AgenticDID-bound personal AI agent its *"what's around me?"* situational awareness at events. Without them, the agent works from calendar data alone. With them, the agent can answer *"which of the 87 sponsor booths in this venue best fits my Rust + ZK profile, and is one of them currently 5 m away?"* in real time.

---

## The 30-second pitch

EventRevolution puts a BLE beacon on every conference booth, broadcasting the project's URL. The attendee's phone harvests these URLs in the background; the AgenticDID-bound personal agent **ranks projects against the attendee's interest profile, both pre-event from the cloud directory and on-site from live BLE scans.**

This makes the agent's *"plan my day"* output dramatically richer: instead of suggesting only sessions and meetings, it can suggest **which 5 booths to actually walk to**, in what order, and why each fits the attendee's stated goals.

---

## Where AgenticDID's profile feeds in

The agent's relevance ranking needs three inputs:

1. **Attendee profile** (this is AgenticDID's domain) — interests, hiring/looking-for status, current projects, conversation history with the agent
2. **Project metadata** (from DiscoveryManagement, surfaced via EventRevolution's `er.app/p/<slug>` shortener) — tags, demo schedule, hiring status, funding stage
3. **Live presence signal** (from EventRevolution's BLE scan) — which projects are currently within ~5 m and how strongly

The agent's job is to multiply these three vectors:

```
relevance(project) = profile_alignment(attendee, project)
                   × demo_proximity_in_time(project)
                   × physical_proximity_in_space(project)
                   × historical_interest(attendee_history, project_tags)
```

Above a threshold (default 80%, user-configurable) → push notification. Below threshold → silently pre-load into the *"projects nearby"* tab for opportunistic browsing.

---

## Pre-event briefing capability

The most-loved feature in user-research of comparable products: a **pre-event "what's worth your time" briefing** delivered the night before. AgenticDID can run this entirely from the cloud-replicated EventRevolution directory, **without any physical beacon presence**:

```
Attendee: "I'm flying to ZK Bermuda 2026 tomorrow. Pre-brief me."

Agent:    "I see 87 sponsors and 142 hackathon teams. Based on your AgenticDID
           profile — Rust developer, ZK infrastructure focus, looking for DePIN
           collaborators — your top-10 booths are:

           1. Midnight Network (P4)        92% — privacy ZK on Cardano
           2. Aleo (P12)                   89% — ZK rollups, Rust SDK
           3. RISC Zero (P8)               84% — ZK VM, Rust-first
           ...

           I've drafted a route through the show floor that hits all 10 in
           ~2 hours, paired with the 3 sessions you marked must-see. Want me
           to schedule selectConnect handshakes with each booth in advance?"
```

The agent **does not need to be on the venue floor** to do this — the EventRevolution directory replicates to the cloud at registration time, so the briefing works while the attendee is still in their hotel room.

---

## On-site real-time augmentation

When the attendee arrives at the venue:

1. EventRevolution app starts background BLE scan
2. Project Beacons within range produce live presence signals
3. Agent re-runs the ranker with `physical_proximity_in_space` factor activated
4. Push surfaces only when score crosses threshold AND the attendee is in a "free time" window per their calendar (no sense pinging during a session)
5. Attendee taps notification → AR Yellow Brick Road arrows guide them to the booth (or kiosk renders directions)

---

## Privacy posture matches AgenticDID's tier model

| Attendee Tier (per AgenticDID) | Agent's Project Beacon behavior |
|---|---|
| **Tier 0 (anonymous)** | Agent runs entirely on-device. No server-side correlation. Profile inputs come from local AgenticDID context. Ranking happens in local LLM/heuristic. |
| **Tier 1 (pseudonymous)** | Same as Tier 0 + can share aggregate "interests like mine visited these booths" signals back to event organizers as anonymized aggregate metrics. |
| **Tier 2 (selectConnect-bound)** | Agent can fire `requestBoothHandshake` on the attendee's behalf (with explicit confirmation) — see selectConnect's `EVENTREVOLUTION_PROJECT_BEACONS.md`. |
| **Tier 3 (full identity)** | Agent can act fully autonomously on booth interactions — RSVP to demos, pre-share business card, schedule follow-ups. Equivalent to a delegated executive assistant. |

---

## Open coordination items

- [ ] Specify the agent's `rankProjects(attendeeProfile, projectList, presenceList) → rankedList` interface, including how `presenceList` is signed to prevent spoofing
- [ ] Define profile-to-tag mapping shape — should AgenticDID expose tags directly, or only an embedding vector? (Embedding gives more privacy but harder to debug)
- [ ] Design the on-device LLM fallback for Tier 0 — agent must work without cloud calls
- [ ] Decide push-notification budget: too many → opt-out; too few → missed opportunities. Suggest user-configurable threshold + max-per-hour cap

---

*Maintained by Penny. Created May 5, 2026 from John's request to cross-pollinate Project Beacon technology across the DIDzMonolith subs.*
