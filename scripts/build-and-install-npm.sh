#!/bin/bash
set -e

# Script to build and install Tessa globally using npm
# Usage: ./scripts/build-and-install-npm.sh

echo "🦞 Building and installing Tessa globally (using npm)..."
echo

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
echo

# Step 2: Build UI
echo "🎨 Building UI..."
npm run ui:build
echo

# Step 3: Build TypeScript
echo "🔨 Building TypeScript..."
npm run build
echo

# Step 4: Link globally
echo "🔗 Linking globally..."
npm link
echo

# Step 5: Verify installation
echo "✅ Installation complete!"
echo
echo "Installed version:"
tessa --version
echo
echo "Available commands: tessa, moltbot, clawdbot"
echo
echo "Next steps:"
echo "  tessa onboard --install-daemon"
echo "  tessa doctor"
