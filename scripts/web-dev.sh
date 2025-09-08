#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../apps/web"

echo "Starting Next.js dev server ..."
pnpm dev -p 3000


