#!/usr/bin/env bash
set -euo pipefail

printf '\n== Velclaw validation ==\n'
pnpm install --frozen-lockfile
pnpm type-check
pnpm lint
pnpm build

if pnpm exec playwright --version >/dev/null 2>&1; then
  pnpm exec playwright test
else
  printf '\nPlaywright is not installed; skipping E2E runner.\n'
fi

printf '\nVelclaw static validation completed. Run the application and execute a real task/PR flow for environment validation.\n'
