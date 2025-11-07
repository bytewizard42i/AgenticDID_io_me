#!/bin/bash
# Compile AgenticDID Contracts for Midnight Network
# Requires: Docker with Compact compiler image

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  AgenticDID Contract Compilation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

# Setup directories
CONTRACTS_DIR="$(pwd)/contracts"
OUTPUT_DIR="$CONTRACTS_DIR/compiled"

echo -e "${YELLOW}Creating output directory...${NC}"
mkdir -p "$OUTPUT_DIR"

# Compiler settings
COMPILER_IMAGE="midnightnetwork/compactc:latest"
COMPILER_VERSION="0.26.0"
LANGUAGE_VERSION="0.18"

echo -e "${YELLOW}Using Compact Compiler v${COMPILER_VERSION} (Language v${LANGUAGE_VERSION})${NC}"
echo ""

# Function to compile a contract
compile_contract() {
    local contract_name=$1
    local contract_file="${contract_name}.compact"
    
    echo -e "${BLUE}Compiling ${contract_name}...${NC}"
    
    if [ ! -f "$CONTRACTS_DIR/$contract_file" ]; then
        echo -e "${RED}Error: $contract_file not found${NC}"
        return 1
    fi
    
    # Run compiler in Docker
    docker run --rm \
        -v "$CONTRACTS_DIR:/workspace/contracts" \
        -v "$OUTPUT_DIR:/workspace/output" \
        -w /workspace \
        "$COMPILER_IMAGE" \
        compactc "contracts/$contract_file" "output/${contract_name}/" \
        || {
            echo -e "${RED}❌ Compilation failed for ${contract_name}${NC}"
            return 1
        }
    
    echo -e "${GREEN}✅ ${contract_name} compiled successfully${NC}"
    echo ""
}

# Compile all contracts in dependency order
echo -e "${YELLOW}Starting compilation...${NC}"
echo ""

# 1. AgenticDIDRegistry (no dependencies)
compile_contract "AgenticDIDRegistry"

# 2. CredentialVerifier (depends on AgenticDIDRegistry)
compile_contract "CredentialVerifier"

# 3. ProofStorage (independent)
compile_contract "ProofStorage"

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ All contracts compiled successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Output location:${NC} $OUTPUT_DIR"
echo ""
echo -e "${YELLOW}Generated files per contract:${NC}"
echo "  - contract.json     (Contract metadata)"
echo "  - contract-api.ts   (TypeScript API)"
echo "  - witness.ts        (ZK witness generation)"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Review compiled output in contracts/compiled/"
echo "  2. Run tests: npm run test:contracts"
echo "  3. Deploy to testnet: ./scripts/deploy-testnet.sh"
echo ""
