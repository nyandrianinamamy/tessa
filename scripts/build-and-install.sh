#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required. Install it first: https://pnpm.io/installation" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is required (>= 22)." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$NODE_MAJOR" -lt 22 ]]; then
  echo "node >= 22 is required. Current: $(node -v)" >&2
  exit 1
fi

echo "Installing dependencies..."
pnpm install

echo "Building core..."
pnpm build

echo "Building UI assets..."
pnpm ui:build

echo "Linking CLI globally..."
pnpm link --global

echo "Done. Run 'openclaw --help' to verify the global install." 
