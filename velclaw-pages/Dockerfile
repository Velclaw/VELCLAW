FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server.js ./
COPY index.html workspace.html app.js style.css data.json ./
COPY assets ./assets
COPY api ./api
COPY lib ./lib
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
