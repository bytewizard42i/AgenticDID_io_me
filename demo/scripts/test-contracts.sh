#!/bin/bash
# Test AgenticDID Contracts Locally
# Runs unit tests for all contracts before deployment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  AgenticDID Contract Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if compiled
if [ ! -d "./contracts/compiled" ]; then
    echo -e "${YELLOW}Contracts not compiled. Compiling now...${NC}"
    ./scripts/compile-contracts.sh
fi

echo -e "${YELLOW}Running contract tests...${NC}"
echo ""

# Run TypeScript tests
npm run test:contracts || {
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo -e "${BLUE}Test coverage report:${NC}"
npm run coverage:contracts

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  Deploy to testnet: ./scripts/deploy-testnet.sh"
echo ""
