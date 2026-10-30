# Multi-stage Dockerfile for ReUI Component Registry & MCP Server
FROM node:20-alpine AS builder
WORKDIR /app
COPY ../mcp-server/package*.json ./mcp-server/
RUN cd mcp-server && npm install
COPY ../mcp-server ./mcp-server
RUN cd mcp-server && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/mcp-server/dist ./dist
COPY --from=builder /app/mcp-server/package*.json ./
RUN npm install --only=production

# Install static HTTP server for the registry endpoints (/r)
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "public", "-l", "3000"]
