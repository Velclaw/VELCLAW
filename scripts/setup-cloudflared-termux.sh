#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

TUNNEL_NAME="velclaw-runtime"
TUNNEL_ID="21a89f01-11be-404f-8793-8938eab56f5e"
DOMAIN="velclaw.cfd"
PORT="${VELCLAW_PORT:-3000}"
CONFIG_DIR="${HOME}/.cloudflared"
CONFIG="${CONFIG_DIR}/config.yml"
CREDS="${CONFIG_DIR}/${TUNNEL_ID}.json"
LOG="${HOME}/velclaw-cloudflared.log"

command -v cloudflared >/dev/null 2>&1 || { echo "cloudflared is not installed" >&2; exit 1; }
[ -f "$CREDS" ] || { echo "Missing tunnel credentials: $CREDS" >&2; exit 1; }

mkdir -p "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR"

cat > "$CONFIG" <<EOF
# Generated for Velclaw on Termux. Do not commit this file.
tunnel: ${TUNNEL_ID}
credentials-file: ${CREDS}

originRequest:
  connectTimeout: 30s
  keepAliveTimeout: 30s
  keepAliveConnections: 100

ingress:
  - hostname: ${DOMAIN}
    service: http://127.0.0.1:${PORT}
  - hostname: "*.${DOMAIN}"
    service: http://127.0.0.1:${PORT}
  - service: http_status:404
EOF
chmod 600 "$CONFIG"

cloudflared tunnel ingress validate --config "$CONFIG"

# Ensure the apex and wildcard hostnames resolve through this tunnel.
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"
cloudflared tunnel route dns "$TUNNEL_NAME" "*.${DOMAIN}"

if ! curl -fsS --max-time 5 "http://127.0.0.1:${PORT}/api/health" >/dev/null; then
  echo "WARNING: Velclaw is not responding on http://127.0.0.1:${PORT}/api/health" >&2
  echo "Start the Velclaw runtime before expecting public HTTP traffic." >&2
fi

pkill -f "cloudflared tunnel run ${TUNNEL_NAME}" 2>/dev/null || true
sleep 1
nohup cloudflared --config "$CONFIG" tunnel run "$TUNNEL_NAME" > "$LOG" 2>&1 &

sleep 6
cloudflared tunnel info "$TUNNEL_NAME"

echo
echo "Velclaw Cloudflare Tunnel is configured."
echo "Config: $CONFIG"
echo "Log:    $LOG"
echo "Public: https://${DOMAIN}"
echo "Wild:   https://*.${DOMAIN}"
