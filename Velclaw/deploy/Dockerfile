FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# The worker only needs the postgres driver and its own runtime dependencies.
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
COPY deploy/runner.mjs ./runner.mjs

RUN useradd --create-home --uid 10001 velclaw \
  && mkdir -p /work \
  && chown -R velclaw:velclaw /app /work
USER velclaw
ENV VELCLAW_DEPLOY_WORKDIR=/work
CMD ["node", "runner.mjs"]
