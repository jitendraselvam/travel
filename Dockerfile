FROM node:22-bookworm-slim
WORKDIR /app
COPY --chown=node:node server.mjs seed.json plans.json food-v2.json secret-v3.json ./
COPY --chown=node:node public ./public
RUN mkdir -p /app/data && chown node:node /app/data
USER node
ENV NODE_ENV=production PORT=8080 DATA_DIR=/app/data
EXPOSE 8080
CMD ["node", "server.mjs"]
