FROM node:22-alpine
WORKDIR /app
COPY kubernetes-publisher-v2.mjs ./kubernetes-publisher.mjs
USER 1000:1000
ENTRYPOINT ["node", "kubernetes-publisher.mjs"]
