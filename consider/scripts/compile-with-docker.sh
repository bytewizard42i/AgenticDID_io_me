#!/bin/bash
#
# Compile Compact contracts using Docker proof server
# 
# This script:
# 1. Ensures proof server Docker container is running
# 2. Waits for it to be ready
# 3. Compiles contracts with local compactc pointing to Docker proof server
# 4. Outputs compiled contracts ready for Cloud Run deployment
#
# Usage: ./scripts/compile-with-docker.sh [contract-file]

set -e

PROOF_SERVER_PORT=6300
PROOF_SERVER_CONTAINER="midnight-proof-server"
COMPACTC="/home/js/utils_Midnight/bin/compactc"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

section() {
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""
}

# Check if proof server container exists
check_proof_server() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${PROOF_SERVER_CONTAINER}$"; then
        return 0
    else
        return 1
    fi
}

# Check if proof server is running
is_proof_server_running() {
    if docker ps --format '{{.Names}}' | grep -q "^${PROOF_SERVER_CONTAINER}$"; then
        return 0
    else
        return 1
    fi
}

# Start proof server
start_proof_server() {
    section "Starting Midnight Proof Server"
    
    if is_proof_server_running; then
        log_success "Proof server already running"
        return 0
    fi
    
    if check_proof_server; then
        log_info "Starting existing proof server container..."
        docker start ${PROOF_SERVER_CONTAINER}
    else
        log_info "Creating new proof server container..."
        docker run -d \
            --name ${PROOF_SERVER_CONTAINER} \
            --restart unless-stopped \
            -p ${PROOF_SERVER_PORT}:${PROOF_SERVER_PORT} \
            midnightnetwork/proof-server:3.0.7 \
            midnight-proof-server --network undeployed
    fi
    
    log_success "Proof server container started"
}

# Wait for proof server to be ready
wait_for_proof_server() {
    section "Waiting for Proof Server"
    
    log_info "Proof server needs to download ZK parameters (may take 2-3 minutes first time)..."
    log_info "Checking every 5 seconds..."
    
    MAX_ATTEMPTS=36  # 3 minutes
    ATTEMPT=0
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        ATTEMPT=$((ATTEMPT + 1))
        
        # Check if container is still running
        if ! is_proof_server_running; then
            log_error "Proof server container stopped unexpectedly"
            docker logs ${PROOF_SERVER_CONTAINER} --tail 20
            return 1
        fi
        
        # Check logs for success indicator
        if docker logs ${PROOF_SERVER_CONTAINER} 2>&1 | grep -q "Ensuring zswap key material is available"; then
            log_success "Proof server is initializing ZK parameters..."
            sleep 5
            log_success "Proof server ready!"
            return 0
        fi
        
        echo -n "."
        sleep 5
    done
    
    log_error "Proof server did not become ready in time"
    log_info "Last 20 lines of logs:"
    docker logs ${PROOF_SERVER_CONTAINER} --tail 20
    return 1
}

# Compile contract
compile_contract() {
    local CONTRACT_FILE="$1"
    local OUTPUT_DIR="$2"
    
    section "Compiling Contract"
    
    if [ ! -f "$CONTRACT_FILE" ]; then
        log_error "Contract file not found: $CONTRACT_FILE"
        return 1
    fi
    
    log_info "Contract: $CONTRACT_FILE"
    log_info "Output: $OUTPUT_DIR"
    log_info "Proof server: localhost:${PROOF_SERVER_PORT}"
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Set environment variable for proof server
    export PROOF_SERVER_HOST="localhost"
    export PROOF_SERVER_PORT="${PROOF_SERVER_PORT}"
    
    log_info "Compiling with Compact 0.26.0..."
    
    if ${COMPACTC} "$CONTRACT_FILE" "$OUTPUT_DIR"; then
        log_success "Compilation successful!"
        log_info "Compiled files:"
        ls -lh "$OUTPUT_DIR"
        return 0
    else
        log_error "Compilation failed"
        return 1
    fi
}

# Main script
main() {
    section "Docker-Based Contract Compilation"
    
    # Parse arguments
    if [ -z "$1" ]; then
        log_error "Usage: $0 <contract-file> [output-directory]"
        log_info "Example: $0 contracts/AgenticDIDRegistry.compact contracts/compiled"
        exit 1
    fi
    
    CONTRACT_FILE="$1"
    OUTPUT_DIR="${2:-${PROJECT_ROOT}/contracts/compiled}"
    
    # Make paths absolute
    CONTRACT_FILE="$(cd "$(dirname "$CONTRACT_FILE")" && pwd)/$(basename "$CONTRACT_FILE")"
    OUTPUT_DIR="$(cd "$(dirname "$OUTPUT_DIR")" 2>/dev/null && pwd)/$(basename "$OUTPUT_DIR")" || OUTPUT_DIR="$OUTPUT_DIR"
    
    # Start proof server
    start_proof_server || exit 1
    
    # Wait for it to be ready
    wait_for_proof_server || exit 1
    
    # Compile contract
    compile_contract "$CONTRACT_FILE" "$OUTPUT_DIR" || exit 1
    
    section "Compilation Complete"
    log_success "Contract compiled and ready for Cloud Run deployment!"
    log_info "Next steps:"
    echo "  1. Test contract locally with undeployed network"
    echo "  2. Deploy to Cloud Run for production use"
    echo "  3. Integrate with frontend"
}

# Run main function
main "$@"
