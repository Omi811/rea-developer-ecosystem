FROM node:20-bullseye-slim

# Install Chromium and required fonts for headless rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    procps \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app
COPY mcp-server/package*.json ./
RUN npm install
COPY mcp-server/ ./
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/index.js"]
