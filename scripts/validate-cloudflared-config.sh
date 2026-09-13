#!/usr/bin/env bash
set -euo pipefail

CONFIG="${1:-$HOME/.cloudflared/config.yml}"
TUNNEL="${VELCLAW_CLOUDFLARED_TUNNEL:-velclaw-runtime}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared is not installed" >&2
  exit 1
fi

if [ ! -f "$CONFIG" ]; then
  echo "Cloudflare config not found: $CONFIG" >&2
  echo "On Termux run ./scripts/setup-cloudflared-termux.sh first." >&2
  exit 1
fi

cloudflared tunnel ingress validate --config "$CONFIG"
for host in velclaw.cfd deploy.velclaw.cfd hub.velclaw.cfd dashboard.velclaw.cfd; do
  cloudflared tunnel ingress rule --config "$CONFIG" "https://${host}"
done

cloudflared tunnel info "$TUNNEL"

echo "Cloudflare Tunnel ingress configuration is valid and the tunnel is queryable."
