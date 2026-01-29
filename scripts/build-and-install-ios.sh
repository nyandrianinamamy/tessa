#!/usr/bin/env bash
set -euo pipefail

# Simple script to build and install Tessa iOS app
# Usage: ./scripts/build-and-install-ios.sh [--device] [--xcode] [--simulator NAME]

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Defaults
BUILD_FOR_DEVICE=false
OPEN_XCODE=false
SIMULATOR_NAME="${IOS_SIM:-iPhone 17}"
DESTINATION="${IOS_DEST:-platform=iOS Simulator,name=$SIMULATOR_NAME}"

# Parse arguments
for arg in "$@"; do
  case $arg in
    --device)
      BUILD_FOR_DEVICE=true
      shift
      ;;
    --xcode)
      OPEN_XCODE=true
      shift
      ;;
    --simulator)
      SIMULATOR_NAME="$2"
      DESTINATION="platform=iOS Simulator,name=$SIMULATOR_NAME"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [--device] [--xcode] [--simulator NAME]"
      echo ""
      echo "Options:"
      echo "  --device            Build for connected iPhone/iPad (default: simulator)"
      echo "  --xcode             Open in Xcode instead of building"
      echo "  --simulator NAME    Specify simulator (default: iPhone 17)"
      echo ""
      echo "Examples:"
      echo "  $0                          # Build for iPhone 17 simulator"
      echo "  $0 --simulator 'iPhone 16 Pro'  # Build for iPhone 16 Pro simulator"
      echo "  $0 --device                 # Build for connected device"
      echo "  $0 --xcode                  # Open in Xcode"
      echo ""
      echo "Requirements:"
      echo "  - Xcode 16.0+"
      echo "  - xcodegen (brew install xcodegen)"
      echo "  - swiftformat (brew install swiftformat)"
      echo "  - swiftlint (brew install swiftlint)"
      exit 0
      ;;
  esac
done

echo "🦞 Building Tessa iOS app..."
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v xcodegen >/dev/null 2>&1; then
  echo "❌ Error: xcodegen not found"
  echo "   Install: brew install xcodegen"
  exit 1
fi

if ! command -v swiftformat >/dev/null 2>&1; then
  echo "⚠️  Warning: swiftformat not found (build may fail)"
  echo "   Install: brew install swiftformat"
fi

if ! command -v swiftlint >/dev/null 2>&1; then
  echo "⚠️  Warning: swiftlint not found (build may fail)"
  echo "   Install: brew install swiftlint"
fi

echo "✅ Prerequisites OK"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
(cd "$ROOT_DIR" && pnpm install --no-frozen-lockfile)
echo ""

# Step 2: Generate Xcode project
echo "🔨 Generating Xcode project..."
(cd "$ROOT_DIR/apps/ios" && xcodegen generate)
echo ""

# If --xcode flag, just open Xcode and exit
if [[ "$OPEN_XCODE" == "true" ]]; then
  echo "📱 Opening in Xcode..."
  open "$ROOT_DIR/apps/ios/Tessa.xcodeproj"
  echo ""
  echo "✅ Xcode opened!"
  echo ""
  echo "Next steps:"
  echo "  1. Select your device/simulator from the device menu"
  echo "  2. Configure signing in Signing & Capabilities"
  echo "  3. Click Run (⌘R)"
  exit 0
fi

# Step 3: Build the app
if [[ "$BUILD_FOR_DEVICE" == "true" ]]; then
  echo "📱 Building for device..."
  echo ""
  echo "⚠️  Device builds require:"
  echo "   1. Apple Developer account"
  echo "   2. Valid Team ID in apps/ios/project.yml"
  echo "   3. Provisioning profile"
  echo ""
  echo "Opening Xcode for device build..."
  echo "Please select your device and build manually (⌘R)"
  echo ""
  open "$ROOT_DIR/apps/ios/Tessa.xcodeproj"
  exit 0
else
  echo "📱 Building for simulator ($SIMULATOR_NAME)..."
  (cd "$ROOT_DIR/apps/ios" && \
    xcodebuild -project Tessa.xcodeproj \
      -scheme Tessa \
      -destination "$DESTINATION" \
      -configuration Debug \
      build)
  echo ""
fi

# Step 4: Launch simulator
echo "🚀 Launching app on simulator..."
echo ""

# Boot simulator if not already running
xcrun simctl boot "$SIMULATOR_NAME" 2>/dev/null || true

# Install and launch
APP_PATH="$ROOT_DIR/apps/ios/.build/Debug-iphonesimulator/Tessa.app"
if [[ -d "$APP_PATH" ]]; then
  xcrun simctl install "$SIMULATOR_NAME" "$APP_PATH"
  xcrun simctl launch "$SIMULATOR_NAME" bot.molt.ios
  echo ""
  echo "✅ App launched on $SIMULATOR_NAME!"
else
  echo "⚠️  App built but launch failed - app bundle not found"
  echo "   Expected: $APP_PATH"
  echo ""
  echo "Try running manually:"
  echo "   pnpm ios:run"
fi

echo ""
echo "Next steps:"
echo "  1. Pair with gateway: tessa nodes pending"
echo "  2. Check connection: tessa nodes status"
echo "  3. See full guide: docs/platforms/ios/BUILD.md"
