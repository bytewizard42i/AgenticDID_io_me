# Documentation Changelog

**Track major documentation updates and refactorings**

---

## 📅 November 14, 2025 - Three-Axis Model & Stanford Consolidation

### 🎯 **Major Changes**

#### 1. **Three-Axis Issuer Model Implemented**
- **Old Model:** `IssuerCategory` + `VerificationLevel` (two axes)
- **New Model:** `IssuerType` + `IssuerDomain[]` + `AssuranceLevel` (three independent axes)

**Why the change?**
- Old model led to "category explosion" (e.g., `MEDICAL_CORPORATION`, `MEDICAL_GOVERNMENT`, etc.)
- Real-world entities like Stanford operate across multiple domains
- Better fraud detection (brand impersonation, domain mismatches)

**Documentation:**
- ✅ **[THREE_AXIS_ISSUER_MODEL.md](./THREE_AXIS_ISSUER_MODEL.md)** - NEW comprehensive guide
- ✅ **[ISSUERS_AND_AGENTS_CHART.md](./ISSUERS_AND_AGENTS_CHART.md)** - NEW complete registry

#### 2. **Stanford University Consolidation**
- **Before:** 3 separate issuers (Hospital, IVF Center, Education)
- **After:** 1 multi-domain issuer (Stanford University with `[EDUCATION, RESEARCH, MEDICAL]`)

**Result:**
- 10 issuers → 7 issuers (cleaner, more realistic)
- One Stanford Agent covers all four service areas
- Perfect demonstration of three-axis model power

#### 3. **Registry Updates**
- **Trusted Issuers:** 7 total (1 active, 6 inactive)
  1. AgenticDID Foundation ✅ ACTIVE
  2. Bank ❌ OFF
  3. Amazon ❌ OFF
  4. Airline ❌ OFF
  5. Ecuador Voting Dept ❌ OFF
  6. Doctor's Office ❌ OFF
  7. Stanford University ❌ OFF (covers Hospital, IVF, Education)

- **Registered Agents:** 8 total (1 active, 7 inactive)
  1. Comet ✅ ACTIVE
  2. agent_0 🔜 NEXT
  3. Bank Agent ❌ OFF
  4. Amazon Agent ❌ OFF
  5. Airline Agent ❌ OFF
  6. Voting Agent ❌ OFF
  7. Doctor's Office Agent ❌ OFF
  8. Stanford Agent ❌ OFF

---

## 📚 **New Documentation Files**

### Created
- **[THREE_AXIS_ISSUER_MODEL.md](./THREE_AXIS_ISSUER_MODEL.md)**
  - Complete guide to three-axis issuer model
  - 8+ real-world examples
  - Policy enforcement scenarios
  - Brand protection examples
  - ~435 lines

- **[ISSUERS_AND_AGENTS_CHART.md](./ISSUERS_AND_AGENTS_CHART.md)**
  - Complete registry chart (7 TIs, 8 RAs)
  - Issuer→Agent relationships
  - Credential type matrix
  - Stanford multi-domain showcase
  - Implementation roadmap
  - ~365 lines

- **[DOCUMENTATION_CHANGELOG.md](./DOCUMENTATION_CHANGELOG.md)** (this file)
  - Track major documentation changes
  - Deprecation notices
  - Migration guide

---

## 🔄 **Updated Documentation Files**

### Updated
- **[README.md](./README.md)**
  - Added new documentation links
  - Updated documentation status table
  - Marked old files as deprecated

### Deprecated (with notices added)
- **[REGISTRY_STATUS.md](./REGISTRY_STATUS.md)** ⚠️
  - Uses old two-axis model
  - Shows incorrect issuer count (8 vs 7)
  - **→ Superseded by ISSUERS_AND_AGENTS_CHART.md**

- **[AGENTS_AND_ISSUERS.md](./AGENTS_AND_ISSUERS.md)** ⚠️
  - Uses old `IssuerCategory` and `VerificationLevel` terminology
  - Doesn't include Stanford consolidation
  - **→ Superseded by ISSUERS_AND_AGENTS_CHART.md and THREE_AXIS_ISSUER_MODEL.md**

---

## 🔧 **Code Changes Reflected in Docs**

### Type System (`backend/midnight/src/types.ts`)
- **Added:**
  - `IssuerType` enum (SELF_SOVEREIGN, CORPORATION, GOVERNMENT_ENTITY, INSTITUTION)
  - `IssuerDomain` enum (GENERAL, IDENTITY_INFRA, FINANCIAL, MEDICAL, etc.)
  - `AssuranceLevel` enum (UNVERIFIED, BASIC_KYC, REGULATED_ENTITY, SYSTEM_CRITICAL)
  - `TrustedIssuerConfig` interface
  - Brand protection fields (`brandAttestationDid`, `isBrandProtected`)

- **Renamed (with legacy aliases):**
  - `IssuerCategory` → `IssuerType` (alias preserved)
  - `VerificationLevel` → `AssuranceLevel` (alias preserved)

- **Updated:**
  - `IssuerRecord` - uses three-axis model
  - `CredentialTypePolicy` - supports domain requirements
  - `TaskAgentPolicy` - supports three-axis filtering
  - `VerificationResponse` - returns all three axes
  - `WellKnownBrand` - includes `rootBrandDid`

### Registry Files
- **Updated:**
  - `protocol/issuers/index.ts` - 7 issuers (removed Hospital, IVF as separate)
  - `protocol/agents/registered-agents.ts` - 8 agents (consolidated medical)
  - `protocol/issuers/stanford-issuer.ts` - Multi-domain issuer config

---

## 📊 **Migration Guide**

### For Developers

#### Old Code:
```typescript
// ❌ Old two-axis model
issuer = {
  category: IssuerCategory.INSTITUTION,
  verificationLevel: VerificationLevel.REGULATED_ENTITY,
}

policy = {
  allowedCategories: [IssuerCategory.INSTITUTION],
  minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
}
```

#### New Code:
```typescript
// ✅ New three-axis model
issuer = {
  issuerType: IssuerType.INSTITUTION,
  domains: [IssuerDomain.EDUCATION, IssuerDomain.MEDICAL],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
}

policy = {
  allowedIssuerTypes: [IssuerType.INSTITUTION],
  requiredDomains: [IssuerDomain.MEDICAL],
  minAssuranceLevel: AssuranceLevel.REGULATED_ENTITY,
}
```

### For Documentation Readers

- **Looking for issuer registry?**  
  → **[ISSUERS_AND_AGENTS_CHART.md](./ISSUERS_AND_AGENTS_CHART.md)**

- **Understanding issuer categorization?**  
  → **[THREE_AXIS_ISSUER_MODEL.md](./THREE_AXIS_ISSUER_MODEL.md)**

- **Building a new issuer?**  
  → Use `protocol/issuers/stanford-issuer.ts` as template  
  → Follow three-axis model

- **Old documentation references?**  
  → Check this changelog for migration path

---

## 🎯 **Key Insights**

### Why Three Axes?

**Problem:** Stanford University is simultaneously:
- Educational institution (grants degrees)
- Research institution (publishes papers)
- Medical institution (runs hospital + IVF center)

**Old Solution (Bad):**
```
EDUCATIONAL_INSTITUTION? ← Only covers degrees
MEDICAL_INSTITUTION? ← Only covers hospital
EDUCATIONAL_MEDICAL_RESEARCH_INSTITUTION? ← Category explosion! 😵
```

**New Solution (Good):**
```typescript
{
  issuerType: INSTITUTION,
  domains: [EDUCATION, RESEARCH, MEDICAL],
  assuranceLevel: REGULATED_ENTITY,
}
```

**Benefits:**
- ✅ No category explosion
- ✅ Accurately represents real-world entities
- ✅ Clean policy enforcement
- ✅ Composable and scalable

---

## 📖 **Documentation Hierarchy**

### Core Reading Order
1. **[PROTOCOL_RULES.md](./PROTOCOL_RULES.md)** ⭐ START HERE
2. **[ISSUERS_AND_AGENTS_CHART.md](./ISSUERS_AND_AGENTS_CHART.md)** - Registry
3. **[THREE_AXIS_ISSUER_MODEL.md](./THREE_AXIS_ISSUER_MODEL.md)** - Model explained
4. **[DID_AND_KYC_ARCHITECTURE.md](./DID_AND_KYC_ARCHITECTURE.md)** - DID/KYC
5. **[ISSUER_0_CANONICAL_FLOW.md](./ISSUER_0_CANONICAL_FLOW.md)** - E2E flow

### Legacy (For Historical Reference)
- **[REGISTRY_STATUS.md](./REGISTRY_STATUS.md)** ⚠️ Old model
- **[AGENTS_AND_ISSUERS.md](./AGENTS_AND_ISSUERS.md)** ⚠️ Old terminology

---

## 🚀 **Next Steps**

### Immediate
- [ ] Update `PROTOCOL_RULES.md` to reference three-axis model
- [ ] Update any references in code comments
- [ ] Update frontend UI to show three axes

### Phase 2 (agent_0 implementation)
- [ ] Document agent_0 using three-axis model
- [ ] Update fraud detection rules documentation
- [ ] Add domain-based policy examples

### Future
- [ ] Archive old documentation files
- [ ] Create migration script for existing issuers
- [ ] Add interactive registry explorer

---

## 📝 **Version History**

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-14 | 2.0 | Three-axis model, Stanford consolidation |
| 2025-11-14 | 1.0 | Initial registry with two-axis model |

---

**Questions?** Refer to **[THREE_AXIS_ISSUER_MODEL.md](./THREE_AXIS_ISSUER_MODEL.md)** for the complete model explanation. 🚀
