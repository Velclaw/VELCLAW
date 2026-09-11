#!/usr/bin/env bash
set -euo pipefail

RUNNER_DIR="${VELCLAW_RUNNER_DIR:-/home/velclaw/actions-runner-velclaw}"
STATE_DIR="${VELCLAW_RUNNER_STATE_DIR:-$HOME/.velclaw-runner}"
LOG_FILE="${VELCLAW_RUNNER_LOG:-$STATE_DIR/runner.log}"
LOCK_DIR="$STATE_DIR/lock"
MAX_LOG_BYTES=262144

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
touch "$LOG_FILE"

trim_log() {
  local size
  size=$(wc -c <"$LOG_FILE" 2>/dev/null || echo 0)
  if [ "$size" -gt "$MAX_LOG_BYTES" ]; then
    tail -c "$MAX_LOG_BYTES" "$LOG_FILE" >"$LOG_FILE.tmp"
    mv "$LOG_FILE.tmp" "$LOG_FILE"
  fi
}

cleanup_transient_data() {
  proot-distro login ubuntu --user velclaw -- bash -lc '
    RUNNER_DIR="${VELCLAW_RUNNER_DIR:-/home/velclaw/actions-runner-velclaw}"
    WORK_DIR="$RUNNER_DIR/_work"
    if [ -d "$WORK_DIR" ]; then
      find "$WORK_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
    fi
    rm -rf "$RUNNER_DIR/_diag"/* 2>/dev/null || true
    rm -rf "$HOME/.cache"/* "$HOME/.npm"/* "$HOME/.pnpm-store"/* \
      "$HOME/.local/share/pnpm/store"/* 2>/dev/null || true
  ' >>"$LOG_FILE" 2>&1 || true
  trim_log
}

echo "Starting Velclaw GitHub Actions runner (ephemeral / low-storage mode)..." >>"$LOG_FILE"
trim_log

while true; do
  set +e
  proot-distro login ubuntu --user velclaw -- bash -lc '
    set -euo pipefail
    export DOTNET_GCHeapHardLimit="${DOTNET_GCHeapHardLimit:-67108864}"
    export DOTNET_EnableDiagnostics="${DOTNET_EnableDiagnostics:-0}"
    cd "${VELCLAW_RUNNER_DIR:-/home/velclaw/actions-runner-velclaw}"
    ./run.sh --once
  ' >>"$LOG_FILE" 2>&1
  status=$?
  set -e

  cleanup_transient_data

  if [ "$status" -eq 0 ]; then
    sleep 2
  else
    sleep 15
  fi
done
