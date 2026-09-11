# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

FROM base AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 velclaw \
  && useradd --system --uid 1001 --gid 1001 --create-home velclaw

COPY --from=builder --chown=velclaw:velclaw /app/.next ./.next
COPY --from=builder --chown=velclaw:velclaw /app/node_modules ./node_modules
COPY --from=builder --chown=velclaw:velclaw /app/public ./public
COPY --from=builder --chown=velclaw:velclaw /app/package.json ./package.json
COPY --from=builder --chown=velclaw:velclaw /app/pnpm-lock.yaml ./pnpm-lock.yaml

USER velclaw
EXPOSE 3000

CMD ["pnpm", "start"]
