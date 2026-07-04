#!/bin/bash

# 🔮 AgenticDID - Development Machine Setup
# Checks and installs everything needed for local development

set -e

echo "🔮 =================================================="
echo "   AgenticDID - Setting Up Development Machine"
echo "   =================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track what needs installation
NEEDS_INSTALL=()

echo "📋 Checking installed tools..."
echo ""

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    echo -e "${GREEN}✓ Installed${NC} (v$DOCKER_VERSION)"
else
    echo -e "${RED}✗ Not installed${NC}"
    NEEDS_INSTALL+=("docker")
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f4 | cut -d ',' -f1)
    echo -e "${GREEN}✓ Installed${NC} (v$COMPOSE_VERSION)"
elif docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version | cut -d ' ' -f4 | cut -d ',' -f1)
    echo -e "${GREEN}✓ Installed${NC} (v$COMPOSE_VERSION - plugin)"
else
    echo -e "${RED}✗ Not installed${NC}"
    NEEDS_INSTALL+=("docker-compose")
fi

# Check Bun
echo -n "Checking Bun... "
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun --version)
    echo -e "${GREEN}✓ Installed${NC} (v$BUN_VERSION)"
else
    echo -e "${RED}✗ Not installed${NC}"
    NEEDS_INSTALL+=("bun")
fi

# Check gcloud
echo -n "Checking gcloud CLI... "
if command -v gcloud &> /dev/null; then
    GCLOUD_VERSION=$(gcloud version --format="value(core.version)" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ Installed${NC} (v$GCLOUD_VERSION)"
else
    echo -e "${RED}✗ Not installed${NC}"
    NEEDS_INSTALL+=("gcloud")
fi

# Check Vercel CLI (optional)
echo -n "Checking Vercel CLI (optional)... "
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    echo -e "${GREEN}✓ Installed${NC} (v$VERCEL_VERSION)"
else
    echo -e "${YELLOW}✗ Not installed${NC} (optional)"
    NEEDS_INSTALL+=("vercel")
fi

# Check Render CLI (optional)
echo -n "Checking Render CLI (optional)... "
if command -v render &> /dev/null; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}✗ Not installed${NC} (optional)"
    NEEDS_INSTALL+=("render")
fi

# Check Git (should be installed)
echo -n "Checking Git... "
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d ' ' -f3)
    echo -e "${GREEN}✓ Installed${NC} (v$GIT_VERSION)"
else
    echo -e "${RED}✗ Not installed${NC}"
    NEEDS_INSTALL+=("git")
fi

echo ""
echo "=================================================="
echo ""

# Summary
if [ ${#NEEDS_INSTALL[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 All tools installed! You're ready to build!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Copy .env.example to .env and fill in your API keys"
    echo "  2. Run: ./start-everything.sh"
    echo ""
    exit 0
fi

echo "📦 Tools that need installation:"
for tool in "${NEEDS_INSTALL[@]}"; do
    case $tool in
        "docker")
            echo -e "  ${RED}•${NC} Docker (CRITICAL)"
            ;;
        "docker-compose")
            echo -e "  ${RED}•${NC} Docker Compose (CRITICAL)"
            ;;
        "bun")
            echo -e "  ${RED}•${NC} Bun (CRITICAL)"
            ;;
        "gcloud")
            echo -e "  ${RED}•${NC} gcloud CLI (CRITICAL for hackathon)"
            ;;
        "vercel")
            echo -e "  ${YELLOW}•${NC} Vercel CLI (optional)"
            ;;
        "render")
            echo -e "  ${YELLOW}•${NC} Render CLI (optional)"
            ;;
        "git")
            echo -e "  ${RED}•${NC} Git (CRITICAL)"
            ;;
    esac
done

echo ""
echo "🔧 Installation Instructions:"
echo ""

# Docker installation
if [[ " ${NEEDS_INSTALL[@]} " =~ " docker " ]]; then
    echo -e "${BLUE}Docker:${NC}"
    echo "  Linux: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    echo "  Mac: brew install docker"
    echo "  Or download from: https://docker.com/get-started"
    echo ""
fi

# Bun installation
if [[ " ${NEEDS_INSTALL[@]} " =~ " bun " ]]; then
    echo -e "${BLUE}Bun:${NC}"
    echo "  curl -fsSL https://bun.sh/install | bash"
    echo ""
fi

# gcloud installation
if [[ " ${NEEDS_INSTALL[@]} " =~ " gcloud " ]]; then
    echo -e "${BLUE}gcloud CLI:${NC}"
    echo "  Linux/Mac: curl https://sdk.cloud.google.com | bash"
    echo "  Then: exec -l \$SHELL"
    echo "  Or download from: https://cloud.google.com/sdk/docs/install"
    echo ""
fi

# Vercel CLI
if [[ " ${NEEDS_INSTALL[@]} " =~ " vercel " ]]; then
    echo -e "${BLUE}Vercel CLI (optional):${NC}"
    echo "  npm install -g vercel"
    echo "  (or use Vercel web dashboard)"
    echo ""
fi

# Render CLI
if [[ " ${NEEDS_INSTALL[@]} " =~ " render " ]]; then
    echo -e "${BLUE}Render CLI (optional):${NC}"
    echo "  npm install -g render"
    echo "  (or use Render web dashboard)"
    echo ""
fi

# Git installation
if [[ " ${NEEDS_INSTALL[@]} " =~ " git " ]]; then
    echo -e "${BLUE}Git:${NC}"
    echo "  Linux: sudo apt-get install git"
    echo "  Mac: brew install git"
    echo ""
fi

echo "💡 Quick Install (Critical Tools Only):"
echo ""
echo "# Install Bun"
echo "curl -fsSL https://bun.sh/install | bash"
echo ""
echo "# Install gcloud"
echo "curl https://sdk.cloud.google.com | bash"
echo ""
echo "# Install Docker"
echo "curl -fsSL https://get.docker.com | sh"
echo ""

echo "Would you like me to auto-install the critical tools? (requires sudo)"
read -p "Install Bun, gcloud, and Docker? [y/N] " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Installing tools..."
    echo ""
    
    # Install Bun
    if [[ " ${NEEDS_INSTALL[@]} " =~ " bun " ]]; then
        echo "Installing Bun..."
        curl -fsSL https://bun.sh/install | bash
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"
        echo -e "${GREEN}✓ Bun installed${NC}"
    fi
    
    # Install gcloud
    if [[ " ${NEEDS_INSTALL[@]} " =~ " gcloud " ]]; then
        echo "Installing gcloud CLI..."
        curl https://sdk.cloud.google.com | bash
        echo -e "${GREEN}✓ gcloud CLI installed${NC}"
        echo -e "${YELLOW}⚠️  Run: exec -l \$SHELL to activate gcloud${NC}"
    fi
    
    # Install Docker (requires sudo)
    if [[ " ${NEEDS_INSTALL[@]} " =~ " docker " ]]; then
        echo "Installing Docker (requires sudo)..."
        curl -fsSL https://get.docker.com | sudo sh
        sudo usermod -aG docker $USER
        echo -e "${GREEN}✓ Docker installed${NC}"
        echo -e "${YELLOW}⚠️  You may need to log out and back in for Docker permissions${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Installation complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Restart your terminal (or run: exec -l \$SHELL)"
    echo "  2. Run this script again to verify: ./setup-dev-machine.sh"
    echo "  3. Copy .env.example to .env and fill in your API keys"
    echo "  4. Run: ./start-everything.sh"
    echo ""
else
    echo ""
    echo "No problem! Install them manually using the commands above."
    echo ""
    echo "Once installed, run this script again to verify:"
    echo "  ./setup-dev-machine.sh"
    echo ""
fi
