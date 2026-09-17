#!/usr/bin/env bash
set -euo pipefail

# IBM Cloud VSI bootstrap for the canonical Velclaw self-hosted runtime.
# Secrets are injected by the provisioning layer; nothing is persisted in this script.

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git

. /etc/os-release
case "${ID}" in
  debian|ubuntu) ;;
  *) echo "Unsupported Linux distribution: ${ID}" >&2; exit 1 ;;
esac

ARCH="$(dpkg --print-architecture)"
case "${ARCH}" in
  amd64) ;;
  *) echo "Unsupported architecture: ${ARCH}; IBM runtime currently requires amd64" >&2; exit 1 ;;
esac

install -m 0755 -d /etc/apt/keyrings
curl -fsSL "https://download.docker.com/linux/${ID}/gpg" -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
printf '%s\n' \
  'Types: deb' \
  "URIs: https://download.docker.com/linux/${ID}" \
  "Suites: ${VERSION_CODENAME}" \
  'Components: stable' \
  "Architectures: ${ARCH}" \
  'Signed-By: /etc/apt/keyrings/docker.asc' \
  > /etc/apt/sources.list.d/docker.sources
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

install -d -o root -g root /opt/velclaw
if [ ! -d /opt/velclaw/.git ]; then
  git clone https://github.com/Velclaw/Velclaw.git /opt/velclaw
else
  git -C /opt/velclaw fetch origin main
  git -C /opt/velclaw checkout main
  git -C /opt/velclaw reset --hard origin/main
fi

cd /opt/velclaw
test -f deploy/docker-compose.selfhosted.yml

if [ ! -f deploy/.env ]; then
  echo 'deploy/.env is required before starting the Velclaw runtime' >&2
  echo 'Set POSTGRES_URL, VELCLAW_DEPLOY_API_TOKEN, VELCLAW_PUBLIC_DOMAIN, and VELCLAW_TLS_EMAIL.' >&2
  exit 1
fi

docker compose -f deploy/docker-compose.selfhosted.yml up -d --build
docker compose -f deploy/docker-compose.selfhosted.yml ps
