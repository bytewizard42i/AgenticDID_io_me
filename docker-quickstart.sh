#!/bin/bash
# AgenticDID.io Docker Quick Start
# One-command setup for judges and reviewers

set -e

echo "🚀 AgenticDID.io - Docker Quick Start"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker detected"
echo ""

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true
echo ""

# Build and start containers
echo "🏗️  Building Docker image..."
echo "   (This may take a few minutes on first run)"
docker-compose build --no-cache
echo ""

echo "🚀 Starting AgenticDID.io..."
docker-compose up -d
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ AgenticDID.io is now running!"
    echo ""
    echo "📱 Access the application:"
    echo "   Frontend:  http://localhost:5173"
    echo "   Backend:   http://localhost:8787"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs:     docker-compose logs -f"
    echo "   Stop:          docker-compose down"
    echo "   Restart:       docker-compose restart"
    echo ""
    echo "🎯 Ready for demo! Open http://localhost:5173 in your browser"
else
    echo "❌ Failed to start services"
    echo "Check logs with: docker-compose logs"
    exit 1
fi
