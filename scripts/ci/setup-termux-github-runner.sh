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

if ! proot-distro list 2>/dev/null | grep -q '^ubuntu'; then
  echo "Ubuntu image is not available in the local proot-distro catalog."
  echo "Run: proot-distro install ubuntu"
  exit 1
fi

if ! proot-distro list 2>/dev/null | grep -Eq '^ubuntu[[:space:]]+installed'; then
  echo "Installing Ubuntu ARM64 userland..."
  proot-distro install ubuntu
fi

echo "Entering Ubuntu userland. The runner is installed there, not in the Android host filesystem."

proot-distro login ubuntu -- bash -lc '
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git jq unzip tar gzip libicu-dev libssl-dev libkrb5-3 zlib1g libgcc-s1 libstdc++6 libatomic1

if ! command -v gh >/dev/null 2>&1; then
  apt-get install -y gh
fi

if ! gh auth status >/dev/null 2>&1; then
  echo
  echo "GitHub CLI authentication is required once inside Ubuntu."
  echo "Run: gh auth login"
  echo "Use GitHub.com -> HTTPS -> browser authentication."
  echo
  exit 20
fi

RUNNER_DIR="${VELCLAW_RUNNER_DIR:-$HOME/actions-runner-velclaw}"
REPO="${VELCLAW_REPO:-Velclaw/Velclaw}"
RUNNER_VERSION="${VELCLAW_RUNNER_VERSION:-2.337.0}"
RUNNER_NAME="${VELCLAW_RUNNER_NAME:-velclaw-termux-$(hostname | tr -cd "[:alnum:]-" | cut -c1-24)}"
LABELS="self-hosted,linux,ARM64,velclaw-termux"

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

if [ ! -x ./run.sh ]; then
  ARCHIVE="actions-runner-linux-arm64-${RUNNER_VERSION}.tar.gz"
  curl -fL --retry 3 -o "$ARCHIVE" "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${ARCHIVE}"
  tar -xzf "$ARCHIVE"
  rm -f "$ARCHIVE"
fi

./bin/installdependencies.sh || true

TOKEN="$(gh api --method POST "/repos/${REPO}/actions/runners/registration-token" --jq .token)"
if [ -z "$TOKEN" ]; then
  echo "Could not obtain a runner registration token."
  exit 21
fi

./config.sh \
  --unattended \
  --replace \
  --url "https://github.com/${REPO}" \
  --token "$TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "$LABELS" \
  --work _work

trap '\''./config.sh remove --token "${TOKEN}" || true'\'' EXIT

echo
printf "Velclaw self-hosted ARM64 runner is ONLINE.\n"
printf "Name: %s\nLabels: %s\n\n" "$RUNNER_NAME" "$LABELS"
echo "Keep this process running while GitHub Actions uses the runner."
exec ./run.sh
'
