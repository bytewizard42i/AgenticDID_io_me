# Midnight Proof Server - CPU Compatibility Issue

**Report Date:** November 16, 2025  
**Reporter:** John @ AgenticDID.io  
**Component:** `midnightnetwork/proof-server:4.0.0`  
**Status:** ⚠️ Blocking local development

---

## 🔴 **Critical Issue**

The Midnight proof server Docker container crashes immediately with **SIGILL (exit code 132)** on Intel Haswell CPUs and earlier generations that lack AVX-512 instruction support.

---

## **Environment**

**Development System:**
- **CPU:** Intel Core i7-4770 (Haswell, 2013)
- **Architecture:** x86_64
- **Supported Instructions:** AVX2, BMI1/2, AES-NI, FMA
- **Missing Instructions:** AVX-512, ADX, VAES

**Docker Setup:**
- **Image:** `midnightnetwork/proof-server:latest` and `:4.0.0`
- **Command:** `midnight-proof-server --network undeployed`
- **Port:** 6300:6300

---

## **Problem Details**

### **Observed Behavior:**
```bash
$ docker run -d -p 6300:6300 \
    midnightnetwork/proof-server:latest \
    midnight-proof-server --network undeployed

$ docker ps -a
CONTAINER ID   STATUS
abc123def456   Restarting (132) continuously

$ docker logs midnight-proof-server
INFO midnight_proof_server: Ensuring zswap key material is available...
[Immediate crash with exit 132]
```

### **Root Cause:**
- Exit code **132 = 128 + 4 (SIGILL - Illegal Instruction)**
- Binary compiled with AVX-512 optimizations
- Haswell CPUs only support AVX2 (one generation behind)

### **CPU Compatibility:**
```bash
$ cat /proc/cpuinfo | grep -E "avx|avx2|avx512"
flags: ... avx avx2 ...
[No avx512f, avx512dq, or adx flags]
```

---

## **Impact**

### ✅ **What Works:**
- Compact compiler (0.26.0) verified
- Contract syntax and structure
- All other Docker services
- Midnight package dependencies

### ❌ **What Doesn't Work:**
- Local contract compilation (zkir requires proof server)
- ZK proof generation
- Full credential verification testing

---

## **Questions for Midnight DevRel**

### 1. **CPU Requirements**
Is AVX-512 a hard requirement for the proof server? If so, should this be documented?

**Affected CPUs:**
- Intel: Haswell, Broadwell, Skylake (non-X) - Common in development machines
- AMD: Pre-Zen4 (most Ryzen generations)
- Apple Silicon: M1/M2 (ARM, different issue)

### 2. **Portable Build Availability**
Could Midnight provide a Docker image compiled for broader compatibility?

**Options:**
```bash
# Current (fails on Haswell):
RUSTFLAGS="-C target-cpu=skylake-avx512"

# Requested (works on Haswell):
RUSTFLAGS="-C target-cpu=haswell"
# or
RUSTFLAGS="-C target-cpu=x86-64-v2"
```

**Image naming suggestion:**
- `midnightnetwork/proof-server:latest` (current, AVX-512)
- `midnightnetwork/proof-server:compat` (AVX2, broader support)

### 3. **Development Workflow Guidance**
What's the recommended approach for teams without AVX-512?

**Current workarounds:**
- ☁️ Use cloud VM for compilation (works but adds latency)
- 🎭 Mock ZK operations locally (our current approach)
- 🖥️ Require developers to have modern CPUs (expensive)

### 4. **Performance Implications**
If a portable build is provided, what's the performance impact on AVX2 vs AVX-512?

---

## **Technical Analysis**

### **Why Docker Doesn't Isolate This:**
Docker containers share the host CPU directly - they do NOT virtualize CPU instructions. The binary inside the container executes directly on the host processor.

```
┌─────────────────────────────┐
│  Docker Container           │
│  ┌────────────────────────┐ │
│  │ proof-server binary    │ │  Compiled for AVX-512
│  │ (needs AVX-512)        │ │
│  └────────┬───────────────┘ │
└───────────┼──────────────────┘
            ↓ Executes on
     ┌──────────────┐
     │ Host CPU     │  Only has AVX2
     │ (i7-4770)    │  → SIGILL!
     └──────────────┘
```

### **Instruction Set Comparison:**
| Generation | Year | SIMD Width | Multi-Precision | Status |
|------------|------|------------|-----------------|---------|
| Haswell (AVX2) | 2013 | 256-bit | - | ❌ Fails |
| Skylake-X (AVX-512) | 2017 | 512-bit | ADX | ✅ Works |
| Cloud VMs | - | 512-bit | ADX | ✅ Works |

---

## **Current Workaround**

We've adopted a **hybrid development model**:

```yaml
Local Development:
  - Mock verifier for ZK operations
  - Full API/frontend testing
  - Contract design and syntax
  - Status: ✅ Working well

Cloud Deployment:
  - Real proof server on Cloud Run
  - Full ZK verification
  - Production-ready contracts
  - Status: ⏳ Planned for Phase 3
```

**This aligns with Midnight's documented flexibility** for running proof servers on remote/cloud infrastructure.

---

## **Request**

### **Short Term:**
Documentation update noting AVX-512 requirement (if intentional)

### **Medium Term:**
Portable Docker image for broader CPU support

### **Long Term:**
Official guidance on development workflows for diverse hardware

---

## **Project Context**

**AgenticDID.io:**
- Decentralized identity with ZK-based credential verification
- Agent-mediated workflow for privacy-preserving authentication
- Target: Midnight Testnet_02
- Deployment: Cloud Run for production agents

**Current Status:**
- Phase 1: Foundation ✅ (Complete with workarounds)
- Phase 2: AgenticDID Registry (In progress with mocks)
- Phase 3: Cloud deployment (Real ZK operations)

**Compatibility Matrix Followed:**
```
Compactc: 0.26.0 ✅
Language: 0.18.0 ✅
Compact-runtime: 0.9.0 ✅
Ledger: 4.0.0 ✅
Proof Server: 4.0.0 ⚠️ (CPU incompatibility)
```

---

## **Additional Information**

**Confirmed by:** Claude Sonnet 4.5 analysis of Midnight documentation
- No official CPU requirements documented
- No portable builds mentioned
- Standard workflow assumes local Docker works
- Remote/cloud deployment is documented alternative

**Related Issues:**
- Similar reports expected from developers with older hardware
- May affect onboarding and developer experience
- Could impact Midnight adoption in regions with older infrastructure

---

## **Contact**

**Developer:** John  
**Project:** AgenticDID.io  
**Repository:** `AgenticDID_io_me_REAL-DEAL`  
**Workspace:** `/home/js/utils_AgenticDID_io_me/`

**For Midnight DevRel:** We're available to test any alternative images or configurations!

---

**Report Generated:** November 16, 2025  
**Last Updated:** November 16, 2025  
**Status:** Awaiting Midnight DevRel response

---

*This report is being shared with Midnight Network team for resolution and documentation.*
