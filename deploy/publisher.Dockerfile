FROM node:22-alpine
RUN apk add --no-cache git docker-cli
WORKDIR /workspace
COPY runtime-publisher.mjs ./runtime-publisher.mjs
USER node
ENTRYPOINT ["node", "runtime-publisher.mjs"]
