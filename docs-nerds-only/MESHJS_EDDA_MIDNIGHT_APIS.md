# Mesh.js & Edda Labs Midnight APIs

**Comprehensive Guide to Third-Party Midnight Integration Tools**

**Date**: November 14, 2025, 10:31am  
**Purpose**: Document Mesh.js and Edda Labs APIs for Phase 3 Midnight Gateway development

---

## 🎯 Executive Summary

**Mesh.js** and **Edda Labs** provide complementary tools for Midnight Network integration:

- **Mesh.js**: Production-ready SDK with React components, wallet integration, and developer tooling
- **Edda Labs**: Educational content, consulting, and real-world application development
- **Official Midnight SDK**: Low-level APIs from `@midnight-ntwrk/*` packages (already documented)

**Our Approach**: Use **Official Midnight SDK** as primary (already in progress), reference Mesh.js for patterns and UI components.

---

## 📦 Mesh.js Midnight Ecosystem

### Overview

**Website**: https://midnight.meshjs.dev/  
**GitHub**: https://github.com/MeshJS/midnight  
**Main Site**: https://meshjs.dev/

**Purpose**: Remove barriers for organizations and service providers leveraging Midnight technology through:
- Tools and SDKs
- Documentation and tutorials
- Educational materials
- React components and hooks

### Architecture

**Monorepo Structure** (using Turborepo):
```
MeshJS/midnight/
├── apps/
│   ├── docs/              # Next.js documentation site
│   └── playground/        # Developer experimentation environment
│
├── examples/              # Example projects and demos
│
├── packages/
│   ├── configs/           # Shared configs (ESLint, Prettier, Jest, TS)
│   ├── mesh-midnight-cli/        # Command-line interface
│   ├── mesh-midnight-core/       # Core library ⭐
│   ├── mesh-midnight-react/      # React components ⭐
│   ├── mesh-midnight-ui-templates/  # UI templates
│   └── mesh-midnight-wallet/     # Wallet functionalities
│
└── scripts/               # Automation scripts (version bumping, etc.)
```

---

## 🔧 Mesh.js Packages

### 1. **@meshsdk/midnight-core** ⭐

**NPM**: `@meshsdk/midnight-core`  
**Purpose**: Core library for Midnight integration  
**Version**: 0.0.4 (actively developed)  
**License**: Apache-2.0

**Key Features**:
- Low-level Midnight Network integration
- Provider abstractions
- Logging mechanics for existing Midnight providers
- TypeScript support

**Installation**:
```bash
npm install @meshsdk/midnight-core
# or
bun add @meshsdk/midnight-core
```

**Use Cases**:
- Building custom Midnight integrations
- Extending existing providers with logging
- Low-level blockchain interactions

---

### 2. **@meshsdk/midnight-react** ⭐

**Purpose**: React components for Midnight UI development  
**Features**:
- Pre-built UI components
- Wallet connection hooks
- State management patterns
- Responsive design

**Example Use**:
```tsx
import { MidnightWallet } from '@meshsdk/midnight-react';

export default function App() {
  return (
    <MidnightWallet 
      label="Connect Midnight Lace"
      onConnected={(wallet) => console.log('Connected:', wallet)}
    />
  );
}
```

**Benefits**:
- Faster UI development
- Consistent wallet UX
- Built-in error handling
- Accessibility features

---

### 3. **@meshsdk/midnight-wallet**

**Purpose**: Wallet integration utilities  
**Supported Wallets**:
- Lace Wallet (primary)
- Future: Additional Midnight wallets

**Features**:
- Wallet detection (`window.midnight?.mnLace`)
- Connection management
- Transaction signing
- Balance queries

**Example**:
```typescript
import { MidnightWalletProvider } from '@meshsdk/midnight-wallet';

const provider = new MidnightWalletProvider();
await provider.enable();
const address = await provider.getShieldAddress();
```

---

### 4. **@meshsdk/midnight-cli**

**Purpose**: Command-line tools for Midnight development  
**Capabilities**:
- Project scaffolding
- Contract compilation helpers
- Deployment automation
- Testing utilities

**Usage**:
```bash
# Create new Midnight project
npx @meshsdk/midnight-cli create my-dapp

# Compile contracts
npx @meshsdk/midnight-cli compile

# Deploy to network
npx @meshsdk/midnight-cli deploy --network testnet
```

---

### 5. **@meshsdk/midnight-ui-templates**

**Purpose**: Ready-to-use UI templates for common patterns  
**Templates**:
- Wallet connection flows
- Transaction status displays
- Contract interaction forms
- Dashboard layouts

---

## 🚀 Mesh.js Starter Templates

### 1. **Midnight Starter Template**

**GitHub**: https://github.com/MeshJS/midnight-starter-template  
**Purpose**: Complete starter for business developers

**Structure**:
```
midnight-starter-template/
├── counter-cli/              # CLI tools
├── counter-contract/         # Smart contracts
└── frontend-vite-react/      # React application
```

**Features**:
- Pre-configured Vite + React setup
- Wallet integration included
- Example counter contract
- Network switching (testnet/undeployed)
- TypeScript throughout

**Quick Start**:
```bash
# Clone template
git clone https://github.com/MeshJS/midnight-starter-template my-dapp
cd my-dapp

# Install dependencies
npm install

# Start development
npm run dev
```

**Network Configuration**:
```typescript
// frontend-vite-react/src/App.tsx
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// For testnet
setNetworkId(NetworkId.TestNet);

// For local development
setNetworkId(NetworkId.Undeployed);
```

---

### 2. **Midnight Contracts**

**GitHub**: https://github.com/MeshJS/midnight-contracts  
**Purpose**: Resource for smart contract developers

**Contents**:
- Example contracts with providers
- CLI integration examples
- React components for contract interaction
- Testing patterns

**Use Cases**:
- Learning contract patterns
- Reference implementations
- Integration examples

---

## 🎓 Edda Labs

### Overview

**Website**: https://www.eddalabs.io/  
**GitHub**: (Educational content focused)  
**Ecosystem**: https://midnight.network/ecosystem-catalog

**Mission**: Real-world blockchain application development and consulting

**Focus Areas**:
1. Cardano fundamentals for business developers
2. Midnight tools integration
3. Practical dApp development
4. Database integration (reactive databases)
5. Authentication systems implementation
6. UI/UX enhancement for blockchain apps
7. Web2 tooling within Cardano ecosystem

---

### Educational Content

**Delivery**:
- Weekly YouTube content
- Multilingual: English, Spanish, Portuguese
- Hands-on projects with code repositories
- Step-by-step tutorials

**Target Audience**:
- Web2 developers transitioning to blockchain
- Business developers
- Hackathon participants
- Enterprise teams

**Project Catalyst Initiative**:
- **Title**: "Cardano for Business & Web2 Devs - Multilingual Video Tutorials"
- **Fund**: Fund 13
- **Link**: https://projectcatalyst.io/funds/13/cardano-open-ecosystem/cardano-for-business-and-web2-devs-multilingual-video-tutorials-by-edda-labs

---

### Edda Labs Services

**Consulting**:
- Smart contract development
- dApp architecture design
- Midnight integration support
- Security audits

**Development**:
- Custom blockchain applications
- Real-world asset (RWA) tokenization
- Privacy-preserving systems
- Enterprise solutions

**Recent Projects**:
- **Midnight RWA Tokenization**: Private waste receipts & marketplace
- **Privacy-First Applications**: Healthcare, supply chain, finance

---

## 🔍 Key Differences: Official SDK vs Mesh.js

### Official Midnight SDK (`@midnight-ntwrk/*`)

**Pros**:
- ✅ Official and maintained by Midnight Foundation
- ✅ Most up-to-date with network changes
- ✅ Complete feature coverage
- ✅ Direct access to all APIs
- ✅ Better for production/enterprise

**Cons**:
- ❌ Lower-level (more code required)
- ❌ Steeper learning curve
- ❌ Less UI components
- ❌ Fewer examples

### Mesh.js SDK (`@meshsdk/*`)

**Pros**:
- ✅ Higher-level abstractions
- ✅ React components included
- ✅ Faster development
- ✅ More examples and templates
- ✅ Better for rapid prototyping

**Cons**:
- ❌ Additional dependency
- ❌ May lag behind official SDK updates
- ❌ Abstractions can limit flexibility
- ❌ Less control over low-level operations

---

## 🎯 Recommendation for AgenticDID Phase 3

### Our Current Approach: ✅ **Official Midnight SDK**

**Why**:
1. ✅ Already started with `@midnight-ntwrk/*` packages in Phase 3
2. ✅ Better for production/hackathon demo
3. ✅ Full control over implementation
4. ✅ Direct access to all features
5. ✅ Aligned with reference example-counter repo

**What We're Building**:
```typescript
// backend/midnight/package.json
{
  "dependencies": {
    "@midnight-ntwrk/compact-runtime": "^0.9.0",
    "@midnight-ntwrk/midnight-js-contracts": "2.0.2",
    "@midnight-ntwrk/midnight-js-http-client-proof-provider": "2.0.2",
    "@midnight-ntwrk/midnight-js-node-zk-config-provider": "2.0.2",
    "@midnight-ntwrk/midnight-js-types": "2.0.2"
  }
}
```

---

### Where Mesh.js Can Help

**1. Frontend UI (Phase 5)**:
```bash
# Install for React components
bun add @meshsdk/midnight-react @meshsdk/midnight-wallet
```

**Use**:
- Wallet connection button
- Transaction status displays
- Balance displays
- Network switcher UI

**2. Reference Patterns**:
- Study their starter template structure
- Learn from their examples
- UI/UX best practices
- Error handling patterns

**3. Rapid Prototyping** (Optional):
If we need a quick frontend demo:
```bash
npx @meshsdk/midnight-cli create quick-demo
```

---

## 📚 Integration Patterns from Mesh.js

### 1. **Wallet Connection Pattern**

```typescript
// From Mesh.js examples
import { useState, useEffect } from 'react';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

export function useWalletConnection() {
  const [wallet, setWallet] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Set network
    setNetworkId(NetworkId.TestNet);

    // Check for Lace wallet
    if (window.midnight?.mnLace) {
      setWallet(window.midnight.mnLace);
    }
  }, []);

  const connect = async () => {
    if (!wallet) return;
    
    try {
      await wallet.enable();
      setConnected(true);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return { wallet, connected, connect };
}
```

### 2. **Contract Interaction Pattern**

```typescript
// From Mesh.js examples
import { deployContract } from '@meshsdk/midnight-core';

export async function deployMyContract(
  providers: MidnightProviders,
  contract: ContractInstance
) {
  try {
    const deployedContract = await deployContract(
      providers,
      contract
    );
    
    console.log('Contract deployed:', deployedContract.address);
    return deployedContract;
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}
```

### 3. **Network Switching Pattern**

```typescript
// From Mesh.js starter template
export const NETWORKS = {
  testnet: {
    networkId: NetworkId.TestNet,
    rpcUrl: 'https://rpc.testnet-02.midnight.network',
    indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    proofServer: 'http://localhost:6300', // Always local!
  },
  undeployed: {
    networkId: NetworkId.Undeployed,
    rpcUrl: 'http://localhost:9944',
    indexer: 'http://localhost:8088/api/v1/graphql',
    proofServer: 'http://localhost:6300',
  },
};

export function useNetwork(networkName: 'testnet' | 'undeployed') {
  const config = NETWORKS[networkName];
  
  useEffect(() => {
    setNetworkId(config.networkId);
  }, [config.networkId]);
  
  return config;
}
```

---

## 🔗 Related Resources

### Mesh.js Resources
- **Docs**: https://midnight.meshjs.dev/
- **GitHub Org**: https://github.com/MeshJS
- **Main Mesh SDK**: https://meshjs.dev/ (Cardano + Midnight)
- **Discord**: https://discord.gg/WvnCNqmAxy
- **Twitter**: https://twitter.com/meshsdk

### Edda Labs Resources
- **Website**: https://www.eddalabs.io/
- **YouTube**: https://www.youtube.com/@eddalabs
- **Project Catalyst**: https://projectcatalyst.io/funds/13/cardano-open-ecosystem/cardano-for-business-and-web2-devs-multilingual-video-tutorials-by-edda-labs
- **Midnight Ecosystem**: https://midnight.network/ecosystem-catalog

### Official Midnight Resources
- **Main Site**: https://midnight.network
- **Docs**: https://docs.midnight.network
- **GitHub**: https://github.com/midnightntwrk

---

## 📋 Action Items for Phase 3

### Current Phase (Backend)

**✅ Continue with Official SDK**:
- Already using `@midnight-ntwrk/*` packages
- Aligned with official example-counter
- Building Midnight Gateway service

**✅ Reference Mesh.js for Patterns**:
- Study their configuration patterns
- Learn from their examples
- Understand their error handling

### Future Phase 5 (Frontend)

**Consider Mesh.js React Components**:
```bash
bun add @meshsdk/midnight-react @meshsdk/midnight-wallet
```

**Use for**:
- Wallet connection UI
- Transaction displays
- Network switcher
- Status indicators

**Don't Use for**:
- Core business logic (keep in backend)
- Contract deployment (backend responsibility)
- Sensitive operations

---

## 🎓 Learning Resources

### Video Tutorials (Edda Labs)
- Cardano & Midnight fundamentals
- Web2 to Web3 transition
- Practical dApp development
- Authentication systems
- Database integration

### Code Examples (Mesh.js)
- Starter templates (GitHub)
- React component examples
- Contract interaction patterns
- Wallet integration guides

### Official Documentation (Midnight)
- Compact language reference
- Smart contract development
- Deployment guides
- API documentation

---

## 💡 Key Takeaways

1. **Mesh.js = Developer Experience**:
   - Faster prototyping
   - Pre-built UI components
   - Higher-level abstractions

2. **Official SDK = Production Ready**:
   - Full feature access
   - Most up-to-date
   - Better for complex applications

3. **Edda Labs = Education & Consulting**:
   - Learning resources
   - Real-world application guidance
   - Multilingual support

4. **Our Strategy**:
   - Backend: Official Midnight SDK ✅
   - Frontend: Consider Mesh.js React components
   - Learning: Reference all three sources

---

## 📊 Comparison Matrix

| Feature | Official SDK | Mesh.js | Edda Labs |
|---------|-------------|---------|-----------|
| **Type** | Core SDK | Developer Toolkit | Education/Consulting |
| **React Components** | ❌ | ✅ | N/A |
| **Low-level Access** | ✅✅ | ✅ | N/A |
| **Learning Curve** | Steep | Moderate | Beginner-friendly |
| **Production Ready** | ✅✅ | ✅ | N/A |
| **UI Templates** | ❌ | ✅✅ | N/A |
| **Maintained By** | Midnight Foundation | Community (MeshJS) | Edda Labs |
| **Update Frequency** | High | Moderate | N/A |
| **Documentation** | Excellent | Good | Videos/Tutorials |
| **Best For** | Production apps | Rapid prototyping | Learning & consulting |

---

**Status**: ✅ Documented and reviewed  
**Decision**: Continue with Official Midnight SDK for Phase 3 backend  
**Next**: Consider Mesh.js React components for Phase 5 frontend  
**Last Updated**: November 14, 2025, 10:45am
