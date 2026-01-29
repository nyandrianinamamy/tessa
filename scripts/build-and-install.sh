#!/bin/bash
set -e

# Script to build and install Tessa globally
# Usage: ./scripts/build-and-install.sh

echo "🦞 Building and installing Tessa globally..."
echo

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo

# Step 2: Build UI
echo "🎨 Building UI..."
pnpm ui:build
echo

# Step 3: Build TypeScript
echo "🔨 Building TypeScript..."
pnpm build
echo

# Step 4: Link globally
echo "🔗 Linking globally..."
pnpm link --global
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
