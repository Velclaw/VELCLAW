#!/usr/bin/env bash
set -euo pipefail

# IBM Cloud VSI bootstrap for the canonical Velclaw self-hosted runtime.
# Secrets are injected by the provisioning layer; never commit credentials here.

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
printf '%s\n' \
  'Types: deb' \
  'URIs: https://download.docker.com/linux/debian' \
  'Suites: bookworm' \
  'Components: stable' \
  'Architectures: amd64' \
  'Signed-By: /etc/apt/keyrings/docker.asc' \
  > /etc/apt/sources.list.d/docker.sources
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

install -d -m 0755 /opt/velclaw
if [ ! -d /opt/velclaw/.git ]; then
  git clone https://github.com/Velclaw/Velclaw.git /opt/velclaw
else
  git -C /opt/velclaw fetch origin main
  git -C /opt/velclaw reset --hard origin/main
fi

cd /opt/velclaw
docker compose -f deploy/docker-compose.selfhosted.yml up -d --build

docker compose -f deploy/docker-compose.selfhosted.yml ps
