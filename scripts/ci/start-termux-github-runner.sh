#!/usr/bin/env bash
set -euo pipefail

RUNNER_DIR="${VELCLAW_RUNNER_DIR:-/home/velclaw/actions-runner-velclaw}"
STATE_DIR="${VELCLAW_RUNNER_STATE_DIR:-$HOME/.velclaw-runner}"
LOG_FILE="${VELCLAW_RUNNER_LOG:-$STATE_DIR/runner.log}"
LOCK_DIR="$STATE_DIR/lock"

if ! command -v proot-distro >/dev/null 2>&1; then
  echo "proot-distro is required. Run scripts/ci/setup-termux-github-runner.sh first."
  exit 1
fi

if ! proot-distro login ubuntu --user velclaw -- bash -lc "test -x '$RUNNER_DIR/run.sh'" >/dev/null 2>&1; then
  echo "GitHub runner is not configured at $RUNNER_DIR. Run scripts/ci/setup-termux-github-runner.sh first."
  exit 1
fi

mkdir -p "$STATE_DIR"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Velclaw GitHub runner is already running."
  exit 0
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT INT TERM

mkdir -p "$(dirname "$LOG_FILE")"
echo "Starting Velclaw GitHub Actions runner (ephemeral workspace mode)..."
echo "Logs: $LOG_FILE"

# --once makes the runner return after each job. The wrapper then removes the
# job workspace before waiting for the next job, preventing project data from
# accumulating on the phone.
while true; do
  set +e
  proot-distro login ubuntu --user velclaw -- bash -lc '
    cd "${VELCLAW_RUNNER_DIR:-/home/velclaw/actions-runner-velclaw}"
    ./run.sh --once
  ' >>"$LOG_FILE" 2>&1
  status=$?
  set -e

  proot-distro login ubuntu --user velclaw -- bash -lc '
    RUNNER_DIR="${VELCLAW_RUNNER_DIR:-/home/velclaw/actions-runner-velclaw}"
    WORK_DIR="$RUNNER_DIR/_work"
    if [ -d "$WORK_DIR" ]; then
      find "$WORK_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
    fi
    rm -rf "$RUNNER_DIR/_diag"/* 2>/dev/null || true
  ' >>"$LOG_FILE" 2>&1 || true

  if [ "$status" -eq 0 ]; then
    sleep 2
  else
    sleep 15
  fi
done
