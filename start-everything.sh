#!/bin/bash

# 🔮 AgenticDID - One-Button Startup Script
# Starts the entire Real Protocol stack locally

set -e

echo "🔮 =================================================="
echo "   AgenticDID Real Protocol - Starting..."
echo "   =================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is required but not installed${NC}"
    echo "   Install from: https://docker.com"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker found"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is required but not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker Compose found"

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo "   Creating from template..."
    cp .env.example .env
    echo -e "${YELLOW}   Please edit .env with your API keys before continuing${NC}"
    echo ""
    echo "   Required variables:"
    echo "   - ANTHROPIC_API_KEY"
    echo "   - GOOGLE_APPLICATION_CREDENTIALS_JSON"
    echo "   - MIDNIGHT_RPC_URL"
    echo ""
    read -p "   Press Enter after updating .env, or Ctrl+C to exit..."
fi
echo -e "${GREEN}✓${NC} Environment configured"

# Check if required env vars are set
source .env
if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "sk-ant-your-key-here" ]; then
    echo -e "${RED}❌ ANTHROPIC_API_KEY not set in .env${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} API keys configured"

echo ""
echo "🚀 Starting services..."
echo ""

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Build and start all services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service health
check_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $service is ready"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${YELLOW}⚠️${NC}  $service may not be ready (timeout)"
    return 1
}

echo ""
check_service "API Gateway" "http://localhost:8787/health"
check_service "Agents Runtime" "http://localhost:3000/health"
check_service "Midnight Gateway" "http://localhost:3001/health"
check_service "Frontend" "http://localhost:5173"

echo ""
echo "🎉 =================================================="
echo "   All services started successfully!"
echo "   =================================================="
echo ""
echo "🌐 Access your services:"
echo ""
echo "   Frontend (User Interface):"
echo "   ${GREEN}→ http://localhost:5173${NC}"
echo ""
echo "   Backend APIs:"
echo "   → API Gateway:       http://localhost:8787"
echo "   → Agents Runtime:    http://localhost:3000"
echo "   → Midnight Gateway:  http://localhost:3001"
echo "   → TTS Service:       http://localhost:3002"
echo ""
echo "   Documentation:"
echo "   → Local Docs:        http://localhost:8080"
echo ""
echo "🎧 Features:"
echo "   → Listen In Mode:    Toggle in UI"
echo "   → Multi-Agent Auth:  Comet → Banker → Result"
echo "   → Privacy System:    80% spoof transactions"
echo ""
echo "📊 Monitoring:"
echo "   → View logs:         docker-compose logs -f"
echo "   → View all services: docker-compose ps"
echo "   → Stop all:          docker-compose down"
echo ""
echo "📚 Next Steps:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Try 'Send \$50' (Banker agent)"
echo "   3. Toggle Listen In Mode to hear agents communicate"
echo "   4. Check logs: docker-compose logs -f agents-runtime"
echo ""
echo "🔧 Troubleshooting:"
echo "   → Rebuild services:  docker-compose up --build"
echo "   → Reset everything:  docker-compose down -v"
echo "   → Check service:     docker-compose logs <service-name>"
echo ""
echo "✨ Happy building with AgenticDID! ✨"
echo ""
