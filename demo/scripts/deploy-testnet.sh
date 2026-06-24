#!/bin/bash
# Deploy AgenticDID Contracts to Midnight Testnet
# Requires: Compiled contracts, Lace wallet with tDUST

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  AgenticDID Testnet Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration
NETWORK="testnet"
INDEXER_URL="https://indexer.testnet.midnight.network"
NODE_URL="https://rpc.testnet.midnight.network"
COMPILED_DIR="./contracts/compiled"
DEPLOYMENT_DIR="./deployments"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check if contracts are compiled
if [ ! -d "$COMPILED_DIR/AgenticDIDRegistry" ]; then
    echo -e "${RED}Error: Contracts not compiled${NC}"
    echo "Run: ./scripts/compile-contracts.sh"
    exit 1
fi

# Check if deployment configuration exists
if [ ! -f ".env.midnight" ]; then
    echo -e "${YELLOW}Warning: .env.midnight not found${NC}"
    echo "Creating template..."
    cat > .env.midnight << EOF
# Midnight Network Configuration
MIDNIGHT_NETWORK=testnet
MIDNIGHT_INDEXER_URL=$INDEXER_URL
MIDNIGHT_NODE_URL=$NODE_URL

# Wallet Configuration (DO NOT COMMIT)
# Get these from Lace wallet
MIDNIGHT_WALLET_ADDRESS=
MIDNIGHT_PRIVATE_KEY=

# Contract Configuration
INITIAL_SPOOF_RATIO=80
EOF
    echo -e "${RED}Please configure .env.midnight with your wallet details${NC}"
    exit 1
fi

# Load environment
source .env.midnight

# Verify wallet address
if [ -z "$MIDNIGHT_WALLET_ADDRESS" ]; then
    echo -e "${RED}Error: MIDNIGHT_WALLET_ADDRESS not set${NC}"
    echo "Please configure .env.midnight"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites verified${NC}"
echo ""

# Create deployment directory
mkdir -p "$DEPLOYMENT_DIR/$NETWORK"

# Deployment function
deploy_contract() {
    local contract_name=$1
    local constructor_args=$2
    
    echo -e "${BLUE}Deploying ${contract_name}...${NC}"
    echo -e "${YELLOW}Constructor args: ${constructor_args}${NC}"
    
    # Run deployment script
    npm run deploy:contract -- \
        --contract "$contract_name" \
        --network "$NETWORK" \
        --args "$constructor_args" \
        --output "$DEPLOYMENT_DIR/$NETWORK/${contract_name}.json" \
        || {
            echo -e "${RED}❌ Deployment failed for ${contract_name}${NC}"
            return 1
        }
    
    echo -e "${GREEN}✅ ${contract_name} deployed${NC}"
    echo ""
}

echo -e "${YELLOW}Starting deployment sequence...${NC}"
echo ""

# 1. Deploy AgenticDIDRegistry
echo -e "${BLUE}Step 1/3: Deploying AgenticDIDRegistry${NC}"
deploy_contract "AgenticDIDRegistry" "$MIDNIGHT_WALLET_ADDRESS"
REGISTRY_ADDRESS=$(jq -r '.contractAddress' "$DEPLOYMENT_DIR/$NETWORK/AgenticDIDRegistry.json")
echo -e "${GREEN}Registry Address: ${REGISTRY_ADDRESS}${NC}"
echo ""

# 2. Deploy CredentialVerifier (with registry reference)
echo -e "${BLUE}Step 2/3: Deploying CredentialVerifier${NC}"
deploy_contract "CredentialVerifier" "$MIDNIGHT_WALLET_ADDRESS,$INITIAL_SPOOF_RATIO,$REGISTRY_ADDRESS"
VERIFIER_ADDRESS=$(jq -r '.contractAddress' "$DEPLOYMENT_DIR/$NETWORK/CredentialVerifier.json")
echo -e "${GREEN}Verifier Address: ${VERIFIER_ADDRESS}${NC}"
echo ""

# 3. Deploy ProofStorage
echo -e "${BLUE}Step 3/3: Deploying ProofStorage${NC}"
deploy_contract "ProofStorage" "$MIDNIGHT_WALLET_ADDRESS"
STORAGE_ADDRESS=$(jq -r '.contractAddress' "$DEPLOYMENT_DIR/$NETWORK/ProofStorage.json")
echo -e "${GREEN}Storage Address: ${STORAGE_ADDRESS}${NC}"
echo ""

# Generate deployment summary
SUMMARY_FILE="$DEPLOYMENT_DIR/$NETWORK/deployment-summary.json"
cat > "$SUMMARY_FILE" << EOF
{
  "network": "$NETWORK",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deployer": "$MIDNIGHT_WALLET_ADDRESS",
  "contracts": {
    "AgenticDIDRegistry": {
      "address": "$REGISTRY_ADDRESS",
      "constructorArgs": ["$MIDNIGHT_WALLET_ADDRESS"]
    },
    "CredentialVerifier": {
      "address": "$VERIFIER_ADDRESS",
      "constructorArgs": ["$MIDNIGHT_WALLET_ADDRESS", $INITIAL_SPOOF_RATIO, "$REGISTRY_ADDRESS"]
    },
    "ProofStorage": {
      "address": "$STORAGE_ADDRESS",
      "constructorArgs": ["$MIDNIGHT_WALLET_ADDRESS"]
    }
  },
  "config": {
    "indexerUrl": "$INDEXER_URL",
    "nodeUrl": "$NODE_URL"
  }
}
EOF

# Success summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Deployed Contracts:${NC}"
echo "  AgenticDIDRegistry:   $REGISTRY_ADDRESS"
echo "  CredentialVerifier:   $VERIFIER_ADDRESS"
echo "  ProofStorage:         $STORAGE_ADDRESS"
echo ""
echo -e "${YELLOW}Deployment summary:${NC} $SUMMARY_FILE"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Update frontend config with contract addresses"
echo "  2. Run integration tests: npm run test:integration"
echo "  3. Test with demo: npm run demo"
echo ""
echo -e "${YELLOW}View contracts on explorer:${NC}"
echo "  https://explorer.testnet.midnight.network/contract/$REGISTRY_ADDRESS"
echo ""
