#!/bin/bash

# 🔮 AgenticDID - Setup Google Cloud Secrets
# Creates required secrets in Secret Manager

set -e

echo "🔮 =================================================="
echo "   AgenticDID - Setup Cloud Secrets"
echo "   =================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_ID=${GOOGLE_PROJECT_ID:-"agenticdid"}

echo "📋 Project: $PROJECT_ID"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Please create .env from .env.example first"
    exit 1
fi

# Load .env
source .env

# Enable Secret Manager API
echo "🔧 Enabling Secret Manager API..."
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID
echo -e "${GREEN}✓${NC} API enabled"
echo ""

# Function to create or update a secret
create_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}⚠${NC}  Skipping $secret_name (not set in .env)"
        return
    fi
    
    echo "🔐 Creating secret: $secret_name"
    
    # Create secret (ignore error if exists)
    gcloud secrets create "$secret_name" \
        --replication-policy="automatic" \
        --project=$PROJECT_ID \
        2>/dev/null || echo "Secret already exists, updating..."
    
    # Add new version with the value
    echo -n "$secret_value" | gcloud secrets versions add "$secret_name" \
        --data-file=- \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✓${NC} Secret created/updated: $secret_name"
    echo ""
}

echo "🔐 Creating secrets from .env file..."
echo ""

# Create all required secrets
create_secret "anthropic-key" "$ANTHROPIC_API_KEY"
create_secret "gcp-credentials" "$GOOGLE_APPLICATION_CREDENTIALS_JSON"
create_secret "midnight-rpc-url" "$MIDNIGHT_RPC_URL"

echo ""
echo "🎉 =================================================="
echo "   Secrets setup complete!"
echo "   =================================================="
echo ""
echo "📋 Created secrets:"
gcloud secrets list --project=$PROJECT_ID
echo ""
echo "🔍 View in console:"
echo "   https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
echo ""
echo "🚀 Next step: Deploy services"
echo "   ./infrastructure/cloud-run/deploy-from-registry.sh"
echo ""
