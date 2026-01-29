---
summary: "Build and install Tessa iOS app locally"
---

# Building Tessa iOS App

This guide covers building and installing the Tessa iOS app for local development and testing.

## Prerequisites

- macOS (required for iOS development)
- Xcode 16.0+ with iOS 18.0+ SDK
- Command Line Tools (`xcode-select --install`)
- Node.js ≥22
- pnpm (`npm install -g pnpm`)
- XcodeGen (`brew install xcodegen`)
- SwiftFormat (`brew install swiftformat`)
- SwiftLint (`brew install swiftlint`)
- Apple Developer account (for device deployment)

## Quick Start

### Option 1: Simple Build and Install Script

```bash
# Build and install on simulator
./scripts/build-and-install-ios.sh

# Build and install on connected device
./scripts/build-and-install-ios.sh --device

# Open in Xcode for manual build
./scripts/build-and-install-ios.sh --xcode
```

### Option 2: Manual Build Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Xcode project
pnpm ios:gen

# 3. Build for simulator (default: iPhone 17)
pnpm ios:build

# 4. Run on simulator
pnpm ios:run

# Or open in Xcode
pnpm ios:open
```

## Build Modes

### Simulator Build (Quick Testing)

```bash
# Build and run on default simulator (iPhone 17)
pnpm ios:run

# Or specify a different simulator
IOS_DEST="platform=iOS Simulator,name=iPhone 16 Pro" pnpm ios:build
IOS_SIM="iPhone 16 Pro" pnpm ios:run
```

### Device Build (Real iPhone/iPad)

To build for a physical device:

```bash
# 1. Connect your iPhone/iPad via USB

# 2. Set your Team ID (one-time setup)
# Get your Team ID:
./scripts/ios-team-id.sh
# Or manually: security find-identity -p codesigning -v

# 3. Update project.yml with your Team ID
# Edit apps/ios/project.yml and set DEVELOPMENT_TEAM to your Team ID

# 4. Generate project with your Team ID
cd apps/ios
xcodegen generate
cd ../..

# 5. Open in Xcode and select your device
pnpm ios:open

# 6. In Xcode:
#    - Select your device from the device menu
#    - Go to Signing & Capabilities
#    - Select your Team
#    - Click Run (⌘R)
```

### Release Build

For App Store or TestFlight distribution:

```bash
# 1. Update version in project.yml
# Edit apps/ios/project.yml:
#   - CFBundleShortVersionString: "2026.1.27"
#   - CFBundleVersion: "20260127"

# 2. Generate Xcode project
cd apps/ios
xcodegen generate
cd ../..

# 3. Open in Xcode
pnpm ios:open

# 4. In Xcode:
#    - Select "Any iOS Device (arm64)" or your device
#    - Product > Archive
#    - Distribute App > App Store Connect
```

## Project Structure

```
apps/ios/
├── project.yml              # XcodeGen configuration
├── Sources/                 # Swift source files
│   └── Info.plist          # App metadata
├── Tests/                   # Unit tests
│   └── Info.plist          # Test metadata
├── SwiftSources.input.xcfilelist  # Swift files for linting
└── Tessa.xcodeproj/        # Generated Xcode project (gitignored)
```

## Configuration

### Team ID Setup

The project requires a Development Team ID for code signing:

```bash
# Find your Team ID
./scripts/ios-team-id.sh

# Update project.yml
# Edit apps/ios/project.yml line 73:
#   DEVELOPMENT_TEAM: YOUR_TEAM_ID_HERE

# Regenerate project
pnpm ios:gen
```

### Bundle Identifier

Default: `bot.molt.ios`

To use a custom bundle ID:

1. Edit [apps/ios/project.yml](apps/ios/project.yml)
2. Update `PRODUCT_BUNDLE_IDENTIFIER`
3. Regenerate project: `pnpm ios:gen`

### Version Numbers

Update in [apps/ios/project.yml](apps/ios/project.yml):

```yaml
info:
  properties:
    CFBundleShortVersionString: "2026.1.27"  # User-facing version
    CFBundleVersion: "20260127"              # Build number
```

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `ios:gen` | `xcodegen generate` | Generate Xcode project from project.yml |
| `ios:open` | Generate + open Xcode | Open project in Xcode |
| `ios:build` | Build for simulator | Compile the app |
| `ios:run` | Build + launch simulator | Run on simulator |

## Environment Variables

### Simulator Selection

```bash
# Choose simulator destination
export IOS_DEST="platform=iOS Simulator,name=iPhone 16 Pro"
pnpm ios:build

# Choose simulator to boot
export IOS_SIM="iPhone 16 Pro"
pnpm ios:run
```

### Build Configuration

```bash
# Build for release (optimized)
xcodebuild -project apps/ios/Tessa.xcodeproj \
  -scheme Tessa \
  -configuration Release \
  -destination "generic/platform=iOS" \
  archive
```

## Troubleshooting

### "No such module 'MoltbotKit'"

The shared framework is missing:

```bash
# Regenerate Xcode project
pnpm ios:gen

# Clean and rebuild
rm -rf apps/ios/.build
pnpm ios:build
```

### "Signing for 'Tessa' requires a development team"

You need to set your Team ID:

```bash
# 1. Find Team ID
./scripts/ios-team-id.sh

# 2. Update project.yml
# Edit apps/ios/project.yml and set DEVELOPMENT_TEAM

# 3. Regenerate
pnpm ios:gen
```

### "Provisioning profile 'bot.molt.ios Development' doesn't exist"

Either:

**Option A**: Let Xcode manage signing automatically:

1. Open in Xcode: `pnpm ios:open`
2. Select target "Tessa"
3. Signing & Capabilities tab
4. Change "Signing" to "Automatically manage signing"
5. Select your Team

**Option B**: Create provisioning profile manually:

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Certificates, Identifiers & Profiles
3. Create provisioning profile for `bot.molt.ios`
4. Download and install

### SwiftFormat/SwiftLint errors

Install the required tools:

```bash
brew install swiftformat swiftlint
```

### Clean Build

```bash
# Remove generated project and build artifacts
rm -rf apps/ios/Tessa.xcodeproj
rm -rf apps/ios/.build
rm -rf apps/ios/DerivedData

# Regenerate and rebuild
pnpm ios:gen
pnpm ios:build
```

## Running on Device

### Prerequisites

1. Connect iPhone/iPad via USB
2. Trust the computer on your device
3. Enable Developer Mode (Settings > Privacy & Security > Developer Mode)

### Build and Install

```bash
# 1. Check connected devices
xcrun devicectl list devices

# 2. Build for your device
# First, get device ID from above command
IOS_DEST="platform=iOS,id=YOUR_DEVICE_ID" pnpm ios:build

# Or open in Xcode and select your device
pnpm ios:open
```

### Trust Developer Certificate

First launch will show "Untrusted Developer":

1. Settings > General > VPN & Device Management
2. Tap your Apple ID
3. Tap "Trust"
4. Launch app again

## Testing

```bash
# Run unit tests
cd apps/ios
xcodebuild test \
  -project Tessa.xcodeproj \
  -scheme Tessa \
  -destination "platform=iOS Simulator,name=iPhone 17"
```

## App Features

The iOS app provides:

- **Gateway Connection**: WebSocket connection to Tessa gateway
- **Canvas**: WKWebView-based canvas for A2UI rendering
- **Camera**: Photo and video capture
- **Screen Recording**: Screen capture capabilities
- **Location**: GPS location sharing
- **Voice Wake**: Always-on voice activation
- **Talk Mode**: Continuous conversation mode

## Pairing with Gateway

After installing, you need to pair with a gateway:

1. Start gateway: `tessa gateway --port 18789`
2. Open Tessa iOS app
3. Go to Settings
4. Select discovered gateway (or enter manually)
5. On gateway host: `tessa nodes pending`
6. Approve: `tessa nodes approve <requestId>`
7. Verify: `tessa nodes status`

See [iOS Platform Guide](/platforms/ios) for full pairing instructions.

## Related Documentation

- [iOS Platform Guide](/platforms/ios) - Using the iOS app
- [Gateway Pairing](/gateway/pairing) - Node pairing process
- [Gateway Discovery](/gateway/discovery) - Network discovery
- [Canvas](/platforms/mac/canvas) - Canvas features
