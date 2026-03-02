#!/bin/bash

# 🔮 AgenticDID - Build and Push Docker Images to Artifact Registry
# For manual deployments or CI/CD pipelines

set -e

echo "🔮 =================================================="
echo "   AgenticDID - Build & Push Docker Images"
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

echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Registry: $REGISTRY"
echo ""

# Check prerequisites
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is required${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is required${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Prerequisites check passed"
echo ""

# Authenticate
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker $REGISTRY

# Create Artifact Registry repository if it doesn't exist
echo "📦 Setting up Artifact Registry..."
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="AgenticDID Docker images" \
    2>/dev/null || echo "Repository already exists"

echo ""
echo "🏗️  Building and pushing images..."
echo ""

# Get git commit hash for versioning
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
echo "Git commit: $GIT_SHA"
echo ""

# Function to build and push an image
build_and_push() {
    local service_name=$1
    local context_path=$2
    local image_name=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Building: $service_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Full image path
    IMAGE_PATH="$REGISTRY/$PROJECT_ID/$REPO_NAME/$image_name"
    
    # Build with two tags: commit hash and latest
    docker build \
        -t "$IMAGE_PATH:$GIT_SHA" \
        -t "$IMAGE_PATH:latest" \
        "$context_path"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Build successful"
        
        # Push both tags
        echo "Pushing $image_name:$GIT_SHA..."
        docker push "$IMAGE_PATH:$GIT_SHA"
        
        echo "Pushing $image_name:latest..."
        docker push "$IMAGE_PATH:latest"
        
        echo -e "${GREEN}✓${NC} Push successful"
    else
        echo -e "${RED}❌ Build failed for $service_name${NC}"
        return 1
    fi
    
    echo ""
}

# Navigate to project root
cd "$(dirname "$0")/../.."

# Build and push all services
build_and_push "API Gateway" "./backend/api" "agenticdid-api"
build_and_push "Agents Runtime" "./backend/agents" "agenticdid-agents"
build_and_push "Midnight Gateway" "./backend/midnight" "agenticdid-midnight"

echo ""
echo "🎉 =================================================="
echo "   All images built and pushed successfully!"
echo "   =================================================="
echo ""
echo "📦 Images available at:"
echo "   $REGISTRY/$PROJECT_ID/$REPO_NAME/"
echo ""
echo "🔍 View in console:"
echo "   https://console.cloud.google.com/artifacts/docker/$PROJECT_ID/$REGION/$REPO_NAME"
echo ""
echo "🚀 Next step: Deploy to Cloud Run"
echo "   ./infrastructure/cloud-run/deploy-from-registry.sh"
echo ""
