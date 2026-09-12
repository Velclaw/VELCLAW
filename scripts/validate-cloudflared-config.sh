#!/usr/bin/env bash
set -euo pipefail

CONFIG="${1:-$HOME/.cloudflared/config.yml}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared is not installed" >&2
  exit 1
fi

if [ ! -f "$CONFIG" ]; then
  echo "Cloudflare config not found: $CONFIG" >&2
  echo "Copy deploy/cloudflared/config.yml.example to $CONFIG and keep the credentials JSON outside Git." >&2
  exit 1
fi

cloudflared tunnel ingress validate --config "$CONFIG"
cloudflared tunnel ingress rule --config "$CONFIG" https://velclaw.cfd
cloudflared tunnel ingress rule --config "$CONFIG" https://deploy.velclaw.cfd
cloudflared tunnel ingress rule --config "$CONFIG" https://hub.velclaw.cfd

echo "Cloudflare Tunnel ingress configuration is valid."
