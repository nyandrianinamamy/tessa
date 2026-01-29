---
summary: "Build and install Tessa macOS app locally"
---

# Building Tessa macOS App

This guide covers building and installing the Tessa macOS app for local development and personal use.

## Prerequisites

- macOS (Apple Silicon or Intel)
- Xcode Command Line Tools (`xcode-select --install`)
- Node.js ≥22
- pnpm (`npm install -g pnpm`)
- Swift 6.2+ (comes with Xcode)

## Quick Start

### Option 1: Simple Build and Install Script

```bash
# Build and install locally (debug, current architecture)
./scripts/build-and-install-mac.sh

# The app will be at: dist/Tessa.app
# Then open it: open dist/Tessa.app
```

### Option 2: Manual Build Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Build TypeScript
pnpm build

# 3. Build UI
pnpm ui:build

# 4. Package the macOS app
pnpm mac:package

# 5. Open the app
open dist/Tessa.app
```

## Build Modes

### Development Build (Debug)

Fast builds for local development and testing:

```bash
# Debug build, current architecture only (arm64 or x86_64)
./scripts/package-mac-app.sh

# Output: dist/Tessa.app
open dist/Tessa.app
```

### Release Build (Personal Use)

Optimized build for personal installation:

```bash
# Release build, current architecture
BUILD_CONFIG=release ./scripts/package-mac-app.sh

# Or universal binary (both arm64 and x86_64)
BUILD_CONFIG=release BUILD_ARCHS=all ./scripts/package-mac-app.sh
```

### Distribution Build (Signed & Notarized)

For public distribution with code signing and notarization:

```bash
# Set these environment variables first:
export BUNDLE_ID=bot.molt.mac
export APP_VERSION=2026.1.27-beta.1
export APP_BUILD=$(git rev-list --count HEAD)
export BUILD_CONFIG=release
export SIGN_IDENTITY="Developer ID Application: <Your Name> (<TEAMID>)"

# Build universal binary with notarization
./scripts/package-mac-dist.sh

# Output:
# - dist/Tessa.app (signed & notarized)
# - dist/Tessa-2026.1.27-beta.1.zip (for Sparkle updates)
# - dist/Tessa-2026.1.27-beta.1.dmg (for distribution)
```

## Build Scripts Overview

| Script | Purpose | Output |
|--------|---------|--------|
| [build-and-run-mac.sh](build-and-run-mac.sh) | Build debug and run in background | Debug binary (not .app bundle) |
| [package-mac-app.sh](package-mac-app.sh) | Package .app bundle | `dist/Tessa.app` |
| [package-mac-dist.sh](package-mac-dist.sh) | Build distribution artifacts | .app + .zip + .dmg |
| [restart-mac.sh](restart-mac.sh) | Restart running Mac app | N/A |

## Environment Variables

### Build Configuration

- `BUILD_CONFIG`: `debug` (default) or `release`
- `BUILD_ARCHS`: `$(uname -m)` (default), `arm64`, `x86_64`, or `all` (universal)
- `SKIP_TSC`: Set to `1` to skip TypeScript compilation
- `SKIP_UI_BUILD`: Set to `1` to skip UI build

### App Metadata

- `BUNDLE_ID`: Default is `bot.molt.mac.debug` (debug) or `bot.molt.mac` (release)
- `APP_VERSION`: Version string (from package.json if not set)
- `APP_BUILD`: Build number (git commit count if not set)

### Code Signing

- `SIGN_IDENTITY`: Developer ID Application certificate name
- `NOTARYTOOL_PROFILE`: Keychain profile for notarization (default: `tessa-notary`)
- `SKIP_NOTARIZE`: Set to `1` to skip notarization

## Installation

### Install to Applications folder

```bash
# After building
cp -R dist/Tessa.app /Applications/

# Or drag dist/Tessa.app to /Applications in Finder
```

### Run from dist/

```bash
# Run directly from dist/
open dist/Tessa.app

# Or from command line
./dist/Tessa.app/Contents/MacOS/Tessa
```

## Quick Rebuild

If you've already built once and only need to rebuild:

```bash
# Fast rebuild (skips deps install)
pnpm mac:package

# Or manually
./scripts/package-mac-app.sh
```

## Troubleshooting

### Swift Build Errors

```bash
# Clean build artifacts
rm -rf apps/macos/.build

# Rebuild
./scripts/package-mac-app.sh
```

### Code Signing Issues

For local development, you can skip signing:

```bash
# The script will auto-sign with ad-hoc signature if no identity is set
unset SIGN_IDENTITY
./scripts/package-mac-app.sh
```

### Missing Dependencies

```bash
# Re-install all dependencies
pnpm install --force

# Rebuild everything
pnpm build
pnpm ui:build
pnpm mac:package
```

## Architecture Notes

### Universal Binary (arm64 + x86_64)

To create a universal binary that runs on both Apple Silicon and Intel Macs:

```bash
BUILD_ARCHS=all ./scripts/package-mac-app.sh
```

This builds for both architectures and uses `lipo` to create a fat binary.

### Single Architecture

Build only for your current architecture (faster):

```bash
# Auto-detects current arch (arm64 or x86_64)
./scripts/package-mac-app.sh

# Or explicitly set
BUILD_ARCHS=arm64 ./scripts/package-mac-app.sh
```

## Related Documentation

- [Release Checklist](release.md) - Full release process with Sparkle updates
- [macOS Platform Guide](/platforms/macos) - Using the macOS app
- [Canvas](/platforms/mac/canvas) - Canvas features
