#!/bin/bash

# 🔮 AgenticDID - Google Cloud Run Deployment
# Required for hackathon judging!

set -e

echo "🔮 =================================================="
echo "   AgenticDID - Deploying to Google Cloud Run"
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

echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Region: $REGION"
echo ""

# Check prerequisites
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is required but not installed${NC}"
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
echo -e "${GREEN}✓${NC} gcloud CLI found"

# Authenticate
echo "🔐 Authenticating..."
gcloud auth login
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable texttospeech.googleapis.com

echo ""
echo "🚀 Deploying services..."
echo ""

# Deploy API Gateway
echo "📦 Deploying API Gateway..."
gcloud run deploy agenticdid-api \
  --source ../../backend/api \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,AGENTS_RUNTIME_URL=https://agenticdid-agents-${PROJECT_ID}.run.app,MIDNIGHT_GATEWAY_URL=https://agenticdid-midnight-${PROJECT_ID}.run.app" \
  --set-secrets "ANTHROPIC_API_KEY=anthropic-key:latest" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
echo -e "${GREEN}✓${NC} API Gateway deployed"

# Deploy Agents Runtime
echo "📦 Deploying Agents Runtime..."
gcloud run deploy agenticdid-agents \
  --source ../../backend/agents-runtime \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,ENABLE_LISTEN_IN_MODE=true" \
  --set-secrets "ANTHROPIC_API_KEY=anthropic-key:latest,GOOGLE_APPLICATION_CREDENTIALS_JSON=gcp-credentials:latest" \
  --memory 1Gi \
  --cpu 2 \
  --max-instances 10
echo -e "${GREEN}✓${NC} Agents Runtime deployed"

# Deploy Midnight Gateway
echo "📦 Deploying Midnight Gateway..."
gcloud run deploy agenticdid-midnight \
  --source ../../backend/services/midnight-gateway \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,MIDNIGHT_RPC_URL=https://testnet.midnight.network,ENABLE_SPOOF_TRANSACTIONS=true,SPOOF_TRANSACTION_RATIO=0.8" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
echo -e "${GREEN}✓${NC} Midnight Gateway deployed"

# Deploy TTS Service
echo "📦 Deploying TTS Service..."
gcloud run deploy agenticdid-tts \
  --source ../../backend/services/tts-service \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,TTS_PROVIDER=google,TTS_VOICE_NAME=en-US-Neural2-J" \
  --set-secrets "GOOGLE_APPLICATION_CREDENTIALS_JSON=gcp-credentials:latest" \
  --memory 256Mi \
  --cpu 1 \
  --max-instances 10
echo -e "${GREEN}✓${NC} TTS Service deployed"

# Deploy Frontend
echo "📦 Deploying Frontend..."
gcloud run deploy agenticdid-frontend \
  --source ../../frontend/web \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "VITE_API_BASE=https://agenticdid-api-${PROJECT_ID}.run.app,VITE_AGENTS_WS=wss://agenticdid-agents-${PROJECT_ID}.run.app" \
  --memory 256Mi \
  --cpu 1 \
  --max-instances 10
echo -e "${GREEN}✓${NC} Frontend deployed"

echo ""
echo "🎉 =================================================="
echo "   All services deployed successfully!"
echo "   =================================================="
echo ""

# Get URLs
FRONTEND_URL=$(gcloud run services describe agenticdid-frontend --region $REGION --format 'value(status.url)')
API_URL=$(gcloud run services describe agenticdid-api --region $REGION --format 'value(status.url)')
AGENTS_URL=$(gcloud run services describe agenticdid-agents --region $REGION --format 'value(status.url)')

echo "🌐 Your services are live:"
echo ""
echo "   Frontend (User Interface):"
echo "   ${GREEN}→ $FRONTEND_URL${NC}"
echo ""
echo "   Backend APIs:"
echo "   → API Gateway:       $API_URL"
echo "   → Agents Runtime:    $AGENTS_URL"
echo ""
echo "📊 Monitoring:"
echo "   → Cloud Console: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "   → View logs:     gcloud run logs read --service agenticdid-api"
echo ""
echo "🏆 For Hackathon Judges:"
echo "   Main Demo URL: $FRONTEND_URL"
echo "   API Docs:      $API_URL/docs"
echo ""
echo "✨ Deployment complete! ✨"
echo ""
