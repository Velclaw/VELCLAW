#!/usr/bin/env bash
set -euo pipefail

REPO="${VELCLAW_REPO:-Velclaw/Velclaw}"
RUNNER_VERSION="${VELCLAW_RUNNER_VERSION:-2.337.0}"
RUNNER_DIR="${VELCLAW_RUNNER_DIR:-/home/velclaw/actions-runner-velclaw}"
RUNNER_NAME="${VELCLAW_RUNNER_NAME:-velclaw-termux-$(hostname | tr -cd '[:alnum:]-' | cut -c1-24)}"
LABELS="self-hosted,linux,ARM64,velclaw-termux"
TOKEN_FILE="/home/velclaw/.config/velclaw-gh-token"

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

echo "Preparing Ubuntu userland. The runner will run as a non-root user."

# Runner configuration refuses root. PRoot presents uid 0 by default, so create
# a dedicated unprivileged account first, then enter Ubuntu as that account.
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

if ! id -u velclaw >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash velclaw
fi

mkdir -p /home/velclaw/.config
chown -R velclaw:velclaw /home/velclaw

# The user previously authenticated GitHub CLI inside Ubuntu as root. Reuse that
# token for the unprivileged runner instead of forcing a second browser login.
if [ -z "${GH_TOKEN:-}" ] && command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  GH_TOKEN="$(gh auth token)"
fi
if [ -n "${GH_TOKEN:-}" ]; then
  umask 077
  printf '%s\n' "$GH_TOKEN" > /home/velclaw/.config/velclaw-gh-token
  chown velclaw:velclaw /home/velclaw/.config/velclaw-gh-token
  chmod 600 /home/velclaw/.config/velclaw-gh-token
fi

if ! command -v ldconfig >/dev/null 2>&1 || [ ! -x /sbin/ldconfig ]; then
  echo "ldconfig is unavailable after libc-bin installation."
  exit 22
fi
'

# Run all runner operations as the dedicated non-root user. Preserve the token
# and repository settings without asking the GitHub runner to run as root.
GH_TOKEN="$GH_TOKEN_FROM_HOST" \
VELCLAW_REPO="$REPO" \
VELCLAW_RUNNER_VERSION="$RUNNER_VERSION" \
VELCLAW_RUNNER_DIR="$RUNNER_DIR" \
VELCLAW_RUNNER_NAME="$RUNNER_NAME" \
proot-distro login ubuntu --user velclaw -- bash -lc '
set -euo pipefail
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

TOKEN_FILE="/home/velclaw/.config/velclaw-gh-token"
if [ -z "${GH_TOKEN:-}" ] && [ -r "$TOKEN_FILE" ]; then
  GH_TOKEN="$(cat "$TOKEN_FILE")"
  export GH_TOKEN
  rm -f "$TOKEN_FILE"
fi

if [ -z "${GH_TOKEN:-}" ] && command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  GH_TOKEN="$(gh auth token)"
  export GH_TOKEN
fi

if [ -z "${GH_TOKEN:-}" ]; then
  echo "GitHub authentication token is unavailable inside Ubuntu."
  echo "Authenticate GitHub CLI in Ubuntu, then rerun this script."
  echo "Run as root in Ubuntu: gh auth login"
  exit 20
fi

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

TOKEN="$(GH_TOKEN="$GH_TOKEN" gh api --method POST "/repos/${REPO}/actions/runners/registration-token" --jq .token)"
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

# Removal is best-effort on Ctrl-C/termination. Escape the variable so the
# trap expands only inside this already non-root shell.
trap '\''"$RUNNER_DIR/config.sh" remove --token "${TOKEN}" || true'\'' EXIT

echo
echo "Velclaw self-hosted ARM64 runner is ONLINE."
printf "Name: %s\nLabels: %s\nUser: %s\n\n" "$RUNNER_NAME" "$LABELS" "$(id -un)"
echo "Keep this process running while GitHub Actions uses the runner."
exec "$RUNNER_DIR/run.sh"
'
