#!/usr/bin/env bash
set -euo pipefail

# Simple script to build and install Tessa macOS app locally
# Usage: ./scripts/build-and-install-mac.sh [--release] [--universal]

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Parse arguments
BUILD_CONFIG="debug"
BUILD_ARCHS="$(uname -m)"

for arg in "$@"; do
  case $arg in
    --release)
      BUILD_CONFIG="release"
      shift
      ;;
    --universal)
      BUILD_ARCHS="all"
      shift
      ;;
    --help)
      echo "Usage: $0 [--release] [--universal]"
      echo ""
      echo "Options:"
      echo "  --release    Build optimized release version (default: debug)"
      echo "  --universal  Build universal binary for arm64 + x86_64 (default: current arch)"
      echo ""
      echo "Examples:"
      echo "  $0                    # Debug build, current architecture"
      echo "  $0 --release          # Release build, current architecture"
      echo "  $0 --release --universal  # Release universal binary"
      exit 0
      ;;
  esac
done

echo "🦞 Building Tessa macOS app..."
echo "   Config: $BUILD_CONFIG"
echo "   Architecture: $BUILD_ARCHS"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
(cd "$ROOT_DIR" && pnpm install --no-frozen-lockfile --config.node-linker=hoisted)
echo ""

# Step 2: Build TypeScript
echo "🔨 Building TypeScript..."
(cd "$ROOT_DIR" && pnpm exec tsc -p tsconfig.json)
echo ""

# Step 3: Build UI
echo "🎨 Building Control UI..."
(cd "$ROOT_DIR" && node scripts/ui.js build)
echo ""

# Step 4: Package the macOS app
echo "📦 Packaging macOS app..."
export BUILD_CONFIG
export BUILD_ARCHS
"$ROOT_DIR/scripts/package-mac-app.sh"
echo ""

# Step 5: Verify the app
APP_PATH="$ROOT_DIR/dist/Tessa.app"
if [[ ! -d "$APP_PATH" ]]; then
  echo "❌ Error: App bundle not found at $APP_PATH"
  exit 1
fi

VERSION=$(/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" "$APP_PATH/Contents/Info.plist" 2>/dev/null || echo "unknown")
BUILD=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" "$APP_PATH/Contents/Info.plist" 2>/dev/null || echo "unknown")

echo "✅ Build complete!"
echo ""
echo "   App: $APP_PATH"
echo "   Version: $VERSION (build $BUILD)"
echo "   Config: $BUILD_CONFIG"
echo ""
echo "Next steps:"
echo "   1. Open the app: open dist/Tessa.app"
echo "   2. Or install to Applications: cp -R dist/Tessa.app /Applications/"
echo "   3. Or run directly: ./dist/Tessa.app/Contents/MacOS/Tessa"
