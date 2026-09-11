#!/usr/bin/env bash
set -euo pipefail

RUNNER_DIR="${VELCLAW_RUNNER_DIR:-/home/velclaw/actions-runner-velclaw}"

if ! command -v proot-distro >/dev/null 2>&1; then
  echo "proot-distro is required. Run scripts/ci/setup-termux-github-runner.sh first."
  exit 1
fi

if ! proot-distro login ubuntu --user velclaw -- bash -lc "test -x '$RUNNER_DIR/run.sh'" >/dev/null 2>&1; then
  echo "GitHub runner is not configured at $RUNNER_DIR. Run scripts/ci/setup-termux-github-runner.sh first."
  exit 1
fi

echo "Starting Velclaw GitHub Actions runner in background..."
exec proot-distro login ubuntu --user velclaw -- bash -lc "cd '$RUNNER_DIR' && exec ./run.sh"
