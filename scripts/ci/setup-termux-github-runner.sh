#!/usr/bin/env bash
set -euo pipefail

REPO="${VELCLAW_REPO:-Velclaw/Velclaw}"
RUNNER_VERSION="${VELCLAW_RUNNER_VERSION:-2.337.0}"
RUNNER_DIR="${VELCLAW_RUNNER_DIR:-$HOME/actions-runner-velclaw}"
RUNNER_NAME="${VELCLAW_RUNNER_NAME:-velclaw-termux-$(hostname | tr -cd '[:alnum:]-' | cut -c1-24)}"
LABELS="self-hosted,linux,ARM64,velclaw-termux"

if ! command -v proot-distro >/dev/null 2>&1; then
  echo "Installing proot-distro in Termux..."
  pkg update -y
  pkg install -y proot-distro
fi

if ! proot-distro login ubuntu -- true >/dev/null 2>&1; then
  echo "Installing Ubuntu ARM64 userland..."
  proot-distro install ubuntu
fi

GH_TOKEN_FROM_HOST="${GH_TOKEN:-}"
if [ -z "$GH_TOKEN_FROM_HOST" ] && command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  GH_TOKEN_FROM_HOST="$(gh auth token)"
fi

echo "Entering Ubuntu userland. The runner is installed there, not in the Android host filesystem."

GH_TOKEN="$GH_TOKEN_FROM_HOST" \
VELCLAW_REPO="$REPO" \
VELCLAW_RUNNER_VERSION="$RUNNER_VERSION" \
VELCLAW_RUNNER_DIR="$RUNNER_DIR" \
VELCLAW_RUNNER_NAME="$RUNNER_NAME" \
proot-distro login ubuntu -- bash -lc '
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

apt-get update
apt-get install -y ca-certificates curl git jq unzip tar gzip libc-bin libicu-dev libssl-dev libkrb5-3 zlib1g libgcc-s1 libstdc++6 libatomic1

if ! command -v gh >/dev/null 2>&1; then
  apt-get install -y gh
fi

if [ -z "${GH_TOKEN:-}" ] && command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  GH_TOKEN="$(gh auth token)"
  export GH_TOKEN
fi

if [ -z "${GH_TOKEN:-}" ]; then
  echo
  echo "GitHub CLI authentication is required once inside Ubuntu."
  echo "Run: gh auth login"
  echo "Use GitHub.com -> HTTPS -> browser authentication."
  echo "Then rerun this script."
  echo
  exit 20
fi

if ! command -v ldconfig >/dev/null 2>&1 || [ ! -x /sbin/ldconfig ]; then
  echo "ldconfig is unavailable after libc-bin installation."
  exit 22
fi

ldconfig -p >/dev/null 2>&1 || true

RUNNER_DIR="${VELCLAW_RUNNER_DIR:-$HOME/actions-runner-velclaw}"
REPO="${VELCLAW_REPO:-Velclaw/Velclaw}"
RUNNER_VERSION="${VELCLAW_RUNNER_VERSION:-2.337.0}"
RUNNER_NAME="${VELCLAW_RUNNER_NAME:-velclaw-termux-$(hostname | tr -cd "[:alnum:]-" | cut -c1-24)}"
LABELS="self-hosted,linux,ARM64,velclaw-termux"

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"
RUNNER_DIR="$(pwd -P)"

if [ ! -x ./run.sh ] || [ ! -x ./bin/Runner.Listener ]; then
  ARCHIVE="actions-runner-linux-arm64-${RUNNER_VERSION}.tar.gz"
  rm -f "$ARCHIVE"
  curl -fL --retry 3 -o "$ARCHIVE" "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${ARCHIVE}"
  tar -xzf "$ARCHIVE"
  rm -f "$ARCHIVE"
fi

test -x "$RUNNER_DIR/run.sh"
test -x "$RUNNER_DIR/bin/Runner.Listener"

# GH_TOKEN is already exported above. Keep this command simple: the previous
# nested quoted assignment caused bash -u to report "TOKEN: unbound variable".
TOKEN="$(gh api --method POST "/repos/${REPO}/actions/runners/registration-token" --jq .token)"
if [ -z "$TOKEN" ]; then
  echo "Could not obtain a runner registration token."
  exit 21
fi

"$RUNNER_DIR/config.sh" \
  --unattended \
  --replace \
  --url "https://github.com/${REPO}" \
  --token "$TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "$LABELS" \
  --work _work

trap '"$RUNNER_DIR/config.sh" remove --token "${TOKEN}" || true' EXIT

echo
echo "Velclaw self-hosted ARM64 runner is ONLINE."
printf "Name: %s\nLabels: %s\n\n" "$RUNNER_NAME" "$LABELS"
echo "Keep this process running while GitHub Actions uses the runner."
exec "$RUNNER_DIR/run.sh"
'
