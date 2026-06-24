#!/bin/bash
# ============================================================================
# COMPILE ALL MIDNIGHT CONTRACTS
# ============================================================================
#
# Compiles all AgenticDID Compact smart contracts for Midnight Network.
#
# USAGE:
#   ./scripts/compile-all.sh [--fast]
#
# FLAGS:
#   --fast    Skip ZK key generation (faster, for development)
#
# OUTPUT:
#   compiled/
#     ├── registry/       (AgenticDIDRegistry)
#     ├── verifier/       (CredentialVerifier)
#     └── storage/        (ProofStorage)
#
# REQUIREMENTS:
#   - Docker installed
#   - midnightnetwork/compactc:latest image
#
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0.32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROTOCOL_DIR="$(dirname "$SCRIPT_DIR")"
CONTRACTS_DIR="$PROTOCOL_DIR/contracts"
OUTPUT_DIR="$PROTOCOL_DIR/compiled"

# Docker image
COMPILER_IMAGE="midnightnetwork/compactc:latest"

# Parse flags
SKIP_ZK=""
if [[ "$1" == "--fast" ]]; then
  SKIP_ZK="--skip-zk"
  echo -e "${BLUE}🚀 Fast mode: Skipping ZK key generation${NC}"
fi

# Banner
echo ""
echo "============================================================================"
echo " 📜 AgenticDID Midnight Contracts Compilation"
echo "============================================================================"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
  echo -e "${RED}❌ Error: Docker is not installed${NC}"
  exit 1
fi

# Pull latest compiler (if needed)
echo -e "${BLUE}📥 Pulling latest compiler image...${NC}"
docker pull $COMPILER_IMAGE || echo "Using cached image"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to compile a contract
compile_contract() {
  local CONTRACT_NAME=$1
  local SOURCE_FILE="$CONTRACTS_DIR/${CONTRACT_NAME}.compact"
  local OUT_DIR="$OUTPUT_DIR/${CONTRACT_NAME,,}"  # lowercase
  
  if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}❌ Contract not found: $SOURCE_FILE${NC}"
    return 1
  fi
  
  echo ""
  echo -e "${GREEN}▶️  Compiling $CONTRACT_NAME...${NC}"
  echo "    Source: $SOURCE_FILE"
  echo "    Output: $OUT_DIR"
  
  # Run compiler in Docker
  docker run --rm \
    -v "$CONTRACTS_DIR:/work/contracts" \
    -v "$OUTPUT_DIR:/work/output" \
    $COMPILER_IMAGE \
    sh -c "compactc $SKIP_ZK /work/contracts/${CONTRACT_NAME}.compact /work/output/${CONTRACT_NAME,,}/"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $CONTRACT_NAME compiled successfully${NC}"
  else
    echo -e "${RED}❌ $CONTRACT_NAME compilation failed${NC}"
    return 1
  fi
}

# Compile all contracts
echo "Starting compilation..."

compile_contract "AgenticDIDRegistry"
compile_contract "CredentialVerifier"
compile_contract "ProofStorage"

# Summary
echo ""
echo "============================================================================"
echo -e "${GREEN}✅ All contracts compiled successfully!${NC}"
echo "============================================================================"
echo ""
echo "📁 Output directory: $OUTPUT_DIR"
echo ""
echo "📋 Compiled contracts:"
ls -lh "$OUTPUT_DIR" | tail -n +2 | awk '{print "   -", $9, "("$5")"}'
echo ""

if [[ "$SKIP_ZK" == "--skip-zk" ]]; then
  echo -e "${BLUE}⚠️  Note: ZK keys were skipped (fast mode)${NC}"
  echo -e "${BLUE}   For production, recompile without --fast flag${NC}"
  echo ""
fi

echo "🚀 Ready for deployment!"
echo ""
