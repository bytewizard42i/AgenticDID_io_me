#!/bin/bash
# Build script - builds all workspaces

set -e

echo "🏗️  Building AgenticDID.io..."
yarn build
echo "✅ Build complete!"
