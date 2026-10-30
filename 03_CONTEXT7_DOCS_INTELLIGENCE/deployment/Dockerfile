FROM node:20-alpine AS builder
WORKDIR /app
COPY mcp-server/package*.json ./
RUN npm install
COPY mcp-server/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

CMD ["node", "dist/index.js"]
