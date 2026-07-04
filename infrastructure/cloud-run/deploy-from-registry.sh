#!/bin/bash

# 🔮 AgenticDID - Deploy from Artifact Registry to Cloud Run
# Deploys pre-built Docker images from Artifact Registry

set -e

echo "🔮 =================================================="
echo "   AgenticDID - Deploy from Registry"
echo "   =================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_ID=${GOOGLE_PROJECT_ID:-"agenticdid"}
REGION=${REGION:-"us-central1"}
REGISTRY="$REGION-docker.pkg.dev"
REPO_NAME="agenticdid"

# Image tag (use 'latest' or specific commit hash)
TAG=${IMAGE_TAG:-"latest"}

echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Image Tag: $TAG"
echo ""

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local image_name=$2
    local memory=$3
    local cpu=$4
    local env_vars=$5
    local secrets=$6
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Deploying: $service_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    IMAGE_PATH="$REGISTRY/$PROJECT_ID/$REPO_NAME/$image_name:$TAG"
    
    gcloud run deploy "$service_name" \
        --image "$IMAGE_PATH" \
        --region "$REGION" \
        --platform managed \
        --allow-unauthenticated \
        --memory "$memory" \
        --cpu "$cpu" \
        --max-instances 10 \
        --min-instances 0 \
        --set-env-vars "$env_vars" \
        --set-secrets "$secrets"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Deployed successfully"
        
        # Get service URL
        URL=$(gcloud run services describe "$service_name" --region "$REGION" --format 'value(status.url)')
        echo "   URL: $URL"
    else
        echo -e "${RED}❌ Deployment failed${NC}"
        return 1
    fi
    
    echo ""
}

echo "🚀 Deploying services to Cloud Run..."
echo ""

# Deploy API Gateway
deploy_service \
    "agenticdid-api" \
    "agenticdid-api" \
    "512Mi" \
    "1" \
    "NODE_ENV=production,AGENTS_RUNTIME_URL=https://agenticdid-agents-${PROJECT_ID}.run.app,MIDNIGHT_GATEWAY_URL=https://agenticdid-midnight-${PROJECT_ID}.run.app" \
    "ANTHROPIC_API_KEY=anthropic-key:latest"

# Deploy Agents Runtime
deploy_service \
    "agenticdid-agents" \
    "agenticdid-agents" \
    "1Gi" \
    "2" \
    "NODE_ENV=production,ENABLE_LISTEN_IN_MODE=true" \
    "ANTHROPIC_API_KEY=anthropic-key:latest,GOOGLE_APPLICATION_CREDENTIALS_JSON=gcp-credentials:latest"

# Deploy Midnight Gateway
deploy_service \
    "agenticdid-midnight" \
    "agenticdid-midnight" \
    "512Mi" \
    "1" \
    "NODE_ENV=production,MIDNIGHT_RPC_URL=https://testnet.midnight.network,ENABLE_SPOOF_TRANSACTIONS=true,SPOOF_TRANSACTION_RATIO=0.8" \
    ""

echo ""
echo "🎉 =================================================="
echo "   All services deployed successfully!"
echo "   =================================================="
echo ""

# Get all URLs
API_URL=$(gcloud run services describe agenticdid-api --region $REGION --format 'value(status.url)')
AGENTS_URL=$(gcloud run services describe agenticdid-agents --region $REGION --format 'value(status.url)')
MIDNIGHT_URL=$(gcloud run services describe agenticdid-midnight --region $REGION --format 'value(status.url)')

echo "🌐 Your services are live:"
echo ""
echo "   API Gateway:      $API_URL"
echo "   Agents Runtime:   $AGENTS_URL"
echo "   Midnight Gateway: $MIDNIGHT_URL"
echo ""
echo "📊 Monitoring:"
echo "   Cloud Console: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo ""
echo "✨ Deployment complete! ✨"
echo ""
