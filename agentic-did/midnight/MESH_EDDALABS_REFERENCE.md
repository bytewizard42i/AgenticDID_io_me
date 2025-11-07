# Mesh.js & Eddalabs Midnight Reference
**Date**: November 7, 2025  
**Purpose**: Complete guide to Mesh.js and Eddalabs Midnight tools

---

## 🌐 Mesh.js Overview

**Website**: https://meshjs.dev  
**Midnight Docs**: https://midnight.meshjs.dev  
**GitHub Org**: https://github.com/MeshJS

### What is Mesh.js?

> **"Ship UTXO Apps Faster with Mesh"**

Mesh is a TypeScript open-source framework providing comprehensive tools to build Web3 apps on both **Cardano** and **Midnight** blockchains.

### Key Features

1. **Frontend Components & React Hooks**
   - Ready-to-use UI components
   - React integration
   - Wallet connectivity

2. **Universal Wallet Support**
   - Lace wallet integration
   - Browser extension support
   - Multi-wallet compatibility

3. **Built for Modern Web3 Development**
   - TypeScript-first
   - Comprehensive API
   - Production-ready tools

---

## 📦 Mesh Midnight Packages

### Core Repository Structure

**Main Repo**: https://github.com/MeshJS/midnight

```
MeshJS/midnight/
├── apps/
│   ├── docs/              # Documentation website (Next.js)
│   └── playground/        # Developer playground
├── examples/              # Example projects
├── packages/
│   ├── configs/           # ESLint, Prettier, Jest, TypeScript configs
│   ├── mesh-midnight-cli/ # Command-line interface
│   ├── mesh-midnight-core/# Core library ⭐
│   ├── mesh-midnight-react/# React components ⭐
│   ├── mesh-midnight-ui-templates/# UI templates
│   └── mesh-midnight-wallet/# Wallet functionalities ⭐
└── scripts/               # Automation scripts
```

### Package Descriptions

#### 1. **mesh-midnight-core** ⭐⭐⭐
- Core library for Midnight integration
- Provider implementations
- Type definitions
- Contract interaction APIs

**Use For**:
- Backend integrations
- Pure TypeScript apps
- Contract deployment
- State management

#### 2. **mesh-midnight-react** ⭐⭐⭐
- React components for Midnight
- Hooks for wallet connection
- UI state management
- Context providers

**Use For**:
- React frontends
- Web dApps
- User interfaces
- Wallet integration

#### 3. **mesh-midnight-wallet** ⭐⭐⭐
- Wallet connection logic
- Transaction signing
- Account management
- Key handling

**Use For**:
- Wallet connectivity
- User authentication
- Transaction submission
- Balance queries

#### 4. **mesh-midnight-cli**
- Command-line tools
- Development utilities
- Deployment scripts
- Testing helpers

**Use For**:
- Local development
- Contract deployment
- Testing workflows
- CI/CD integration

#### 5. **mesh-midnight-ui-templates**
- Pre-built UI components
- Common patterns
- Design system
- Theme support

**Use For**:
- Rapid prototyping
- Consistent UI
- Best practices
- Accessibility

---

## 🎯 Mesh Related Projects

### 1. Midnight Starter Template ⭐⭐⭐
**Repo**: https://github.com/MeshJS/midnight-starter-template  
**Your Fork**: `midnight-starter-template-johns-copy/`

**Structure**:
```
midnight-starter-template/
├── counter-cli/           # CLI tools
├── counter-contract/      # Smart contracts
└── frontend-vite-react/   # React application
```

**Features**:
- Complete project scaffold
- Vite + React frontend
- Counter contract example
- CLI integration
- Wallet tools included
- Framework-specific setup

**Best For**:
- Starting new projects
- Learning Mesh integration
- Business applications
- Quick prototypes

**Pragma Version**: `0.16` (Good - should update to range)

---

### 2. Midnight Contracts ⭐⭐
**Repo**: https://github.com/MeshJS/midnight-contracts

**Available Contracts**:
- ✅ **Counter** - Basic state management
- ✅ **Bulletin Board** - Message posting with privacy
- ✅ **Tokenization ZSWAP** - Token operations
- 🚧 **NFT-ERC721 Bucket Identity** (WIP)

**Contains**:
- Example contracts folder
- Provider implementations
- CLI tools
- React components per contract

**Best For**:
- Contract patterns
- Integration examples
- UI/contract connection
- Token operations

---

## 🏢 Eddalabs Midnight Resources

**Your Cloned Repo**: `eddalabs-midnight_johns-copy/`  
**Status**: Comprehensive monorepo with 18 examples

### Eddalabs Repository Structure

```
eddalabs-midnight_johns-copy/
├── apps/                  # Standalone applications
├── examples/              # 18 example projects! ⭐⭐⭐
├── packages/              # Mesh packages
│   ├── mesh-midnight-core/
│   ├── mesh-midnight-react/
│   └── mesh-midnight-wallet/
└── example-workspaces/    # Additional examples
```

### 📚 Eddalabs Examples (18 Total!)

#### Midnight Examples (Official)

**1. midnight-examples-0.2.0/** (Older version)
- Counter example
- Bulletin board example
- `pragma language_version >= 0.14.0;`

**2. midnight-examples-0.2.2/** (Newer version)
- Counter example
- Bulletin board example
- `pragma language_version >= 0.14.0;`

**3. midnight-auction-token/** ⭐
- Token contract
- Auction contract
- `pragma language_version >= 0.14.0;`
- Complex multi-contract example

**4. midnight-amm/**
- Automated Market Maker
- DeFi patterns

**5. midnight-seabattle/**
- Game logic example
- State management

**6. midnight-voting/**
- Governance patterns
- Privacy-preserving voting

#### Cardano + Midnight Hybrid Examples (9 projects)

**Integration Examples**:
1. `cardano-escrow-midnight-counter/`
2. `cardano-giftcard-midnight-counter/`
3. `cardano-helloworld-midnight-counter/`
4. `cardano-marketplace-midnight-counter/`
5. `cardano-nftminting-midnight-counter/`
6. `cardano-ownership-midnight-counter/`
7. `cardano-splitter-midnight-counter/`
8. `cardano-swap-midnight-counter/`
9. `cardano-vesting-midnight-counter/`

**Purpose**: Show cross-chain integration patterns between Cardano and Midnight

#### Wallet Examples

**1. wallet-examples-150107/** (Older)
**2. wallet-examples-latest/** (Current)

---

## 🎯 Priority Use Cases

### For AgenticDID Project

#### Primary References (Use First):

1. **midnight-starter-template** ⭐⭐⭐
   - Project structure
   - Frontend integration
   - Wallet connection
   - Development workflow

2. **midnight-auction-token** ⭐⭐⭐
   - Multi-contract patterns
   - Token operations
   - Complex state management
   - Similar to our DID registry

3. **mesh-midnight-core** ⭐⭐
   - Provider implementations
   - Contract APIs
   - Type definitions

4. **mesh-midnight-react** ⭐⭐
   - React components
   - Wallet hooks
   - UI patterns

#### Secondary References:

5. **midnight-examples-0.2.2/**
   - Counter (basic patterns)
   - Bulletin board (privacy patterns)

6. **wallet-examples-latest/**
   - Wallet integration
   - Transaction signing
   - State management

---

## 🔧 Installation & Usage

### Install Mesh Midnight Packages

```bash
# Core library
npm install @meshsdk/midnight-core

# React components
npm install @meshsdk/midnight-react

# Wallet integration
npm install @meshsdk/midnight-wallet
```

### Basic Usage Example

```typescript
// Using Mesh Midnight Core
import { MidnightProvider } from '@meshsdk/midnight-core';

const provider = new MidnightProvider({
  indexerUrl: 'https://indexer.testnet.midnight.network',
  networkId: 'testnet'
});

// Using React hooks
import { useMidnightWallet } from '@meshsdk/midnight-react';

function WalletButton() {
  const { connect, connected, address } = useMidnightWallet();
  
  return (
    <button onClick={connect}>
      {connected ? address : 'Connect Wallet'}
    </button>
  );
}
```

---

## 📖 Documentation Links

### Mesh.js Official

- **Main Site**: https://meshjs.dev
- **Midnight Docs**: https://midnight.meshjs.dev
- **Requirements**: https://midnight.meshjs.dev/en/wiki/training/001_requirements
- **GitHub**: https://github.com/MeshJS

### Mesh GitHub Repositories

- **Main Midnight Repo**: https://github.com/MeshJS/midnight
- **Starter Template**: https://github.com/MeshJS/midnight-starter-template
- **Contracts**: https://github.com/MeshJS/midnight-contracts
- **Mesh (Cardano)**: https://github.com/MeshJS/mesh

---

## 🎓 Learning Path with Mesh/Eddalabs

### Beginner (Start Here)

1. **Read**: Mesh Midnight documentation
   - https://midnight.meshjs.dev

2. **Study**: midnight-starter-template
   - Project structure
   - Simple counter contract
   - Frontend integration

3. **Run**: Counter CLI example
   ```bash
   cd midnight-starter-template-johns-copy/counter-cli
   npm install && npm run build
   ```

### Intermediate

4. **Study**: midnight-examples-0.2.2
   - Counter patterns
   - Bulletin board (privacy)
   
5. **Study**: mesh-midnight-react
   - React hooks
   - Component patterns
   
6. **Build**: Simple DApp using template
   - Modify counter
   - Add custom circuits
   - Connect UI

### Advanced

7. **Study**: midnight-auction-token
   - Multi-contract architecture
   - Token operations
   - Complex state

8. **Study**: Cardano-Midnight hybrid examples
   - Cross-chain patterns
   - Bridge concepts

9. **Build**: Production DApp
   - Custom contracts
   - Full frontend
   - Wallet integration

---

## ⚠️ Important Notes

### Pragma Versions in Eddalabs

Most Eddalabs examples use **older pragma versions**:
- `pragma language_version >= 0.14.0;`
- Some use `>= 0.13.0;`

**Action**: Always verify syntax against current best practices (v0.16-0.18)

### What to Check

When using Eddalabs examples:
1. ✅ Update pragma to `>= 0.16 && <= 0.18`
2. ✅ Verify type names (`Boolean` not `Bool`)
3. ✅ Check circuit syntax
4. ✅ Validate Map operations
5. ✅ Confirm error handling patterns

### Package Versions

Mesh packages are actively maintained:
- Check for latest versions on npm
- Follow Mesh documentation for compatibility
- Test with current Midnight SDK v2.0.2

---

## 🚀 Quick Setup for AgenticDID

### 1. Install Mesh Packages

```bash
cd /home/js/AgenticDID_CloudRun/agentic-did/apps/web
npm install @meshsdk/midnight-core @meshsdk/midnight-react @meshsdk/midnight-wallet
```

### 2. Study References (Priority Order)

1. `midnight-starter-template-johns-copy/` - Project structure
2. `midnight-auction-token/` - Multi-contract patterns
3. `mesh-midnight-core/` - Provider APIs
4. `mesh-midnight-react/` - React components

### 3. Implement Patterns

- Use Mesh providers for contract interaction
- Integrate React hooks for wallet
- Follow starter template structure
- Adapt auction patterns for DID registry

---

## 📊 Comparison: Mesh vs Official Examples

### Mesh Advantages ✅

- **Better Documentation**: Comprehensive guides
- **React Integration**: Built-in components
- **Wallet Support**: Universal wallet APIs
- **Active Maintenance**: Regular updates
- **TypeScript First**: Full type safety
- **Production Ready**: Battle-tested
- **Templates**: Ready-to-use scaffolds

### Official Examples Advantages ✅

- **Closer to Metal**: Direct Midnight APIs
- **More Examples**: 24 official repos
- **Latest Features**: Cutting-edge patterns
- **Community**: Official Discord support

### Recommendation for AgenticDID 🎯

**Use Both!**

1. **Mesh** for:
   - Frontend/UI development
   - Wallet integration
   - React components
   - Provider abstractions

2. **Official** for:
   - Contract patterns
   - Latest syntax
   - Advanced features
   - Core concepts

---

## 📁 Your Cloned Resources

You have access to:

1. ✅ **midnight-starter-template-johns-copy**
2. ✅ **eddalabs-midnight_johns-copy** (with 18 examples!)
3. ✅ **midnight-mcp-johns_copy** (MCP integration)
4. ✅ **compact-contracts-OpZepp-johns-copy** (OpenZeppelin)

**Total**: 20+ different contract examples across all repos!

---

## 🎯 Next Actions

### For AgenticDID Development

1. **Study Structure**:
   ```bash
   cd midnight/midnight-references/midnight-starter-template-johns-copy
   # Review project structure
   ```

2. **Check Packages**:
   ```bash
   cd eddalabs-midnight_johns-copy/packages
   # Study mesh-midnight-core and mesh-midnight-react
   ```

3. **Examine Examples**:
   ```bash
   cd eddalabs-midnight_johns-copy/examples/midnight-auction-token
   # Study multi-contract patterns
   ```

4. **Install Dependencies**:
   ```bash
   cd /home/js/AgenticDID_CloudRun/agentic-did/apps/web
   npm install @meshsdk/midnight-core @meshsdk/midnight-react
   ```

---

**Summary**: You now have comprehensive Mesh.js and Eddalabs resources with 18+ example projects, complete package source code, and production-ready templates! 🚀

**Created by**: Penny  
**For**: AgenticDID Midnight Integration
