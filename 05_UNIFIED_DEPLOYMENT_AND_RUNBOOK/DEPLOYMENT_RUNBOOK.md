# Production Deployment & Operations Runbook
**Stack:** ReUI Registry + Google Lighthouse + Context7 + Infimium Local Intelligence

---

## 1. Quickstart: 1-Click Launch with Docker

### Prerequisites
- Docker Engine 24.0+ & Docker Compose v2.20+
- Node.js 20+ (for local CLI / direct MCP stdio invocation)
- 4GB+ available RAM (for Headless Chrome and Redis)

```bash
# Navigate to the orchestration directory
cd "G:\Deployment Help\05_UNIFIED_DEPLOYMENT_AND_RUNBOOK"

# Copy environment template
cp .env.example .env

# Launch the entire multi-service mesh
docker compose -f docker-compose.all.yml up -d
```

### Verifying Service Health
```bash
# Check running containers
docker compose -f docker-compose.all.yml ps

# Test ReUI Registry Endpoint
curl -s http://localhost:3001/r/index.json | jq .

# Test Context7 Redis Connection
docker exec -it context7-redis redis-cli ping
```

---

## 2. Registering MCP Servers in AI Coding Clients

Configure your AI assistant to communicate directly with all four reverse-engineered services via the Model Context Protocol (MCP).

### 2.1 Claude Desktop & Claude Code
Add to `claude_desktop_config.json` (Windows: `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "reui": {
      "command": "node",
      "args": ["G:\\Deployment Help\\01_REUI_COMPONENT_REGISTRY\\mcp-server\\dist\\index.js"]
    },
    "lighthouse": {
      "command": "node",
      "args": ["G:\\Deployment Help\\02_GOOGLE_LIGHTHOUSE_ENGINE\\mcp-server\\dist\\index.js"]
    },
    "context7": {
      "command": "node",
      "args": ["G:\\Deployment Help\\03_CONTEXT7_DOCS_INTELLIGENCE\\mcp-server\\dist\\index.js"]
    },
    "infimium": {
      "command": "node",
      "args": ["G:\\Deployment Help\\04_INFIMIUM_LOCAL_REPO_INTELLIGENCE\\mcp-server\\dist\\index.js"]
    }
  }
}
```

### 2.2 Cursor IDE
Add to `.cursor/mcp.json` in your project root or `%USERPROFILE%\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "reui": {
      "command": "node",
      "args": ["G:\\Deployment Help\\01_REUI_COMPONENT_REGISTRY\\mcp-server\\dist\\index.js"]
    },
    "lighthouse": {
      "command": "node",
      "args": ["G:\\Deployment Help\\02_GOOGLE_LIGHTHOUSE_ENGINE\\mcp-server\\dist\\index.js"]
    },
    "context7": {
      "command": "node",
      "args": ["G:\\Deployment Help\\03_CONTEXT7_DOCS_INTELLIGENCE\\mcp-server\\dist\\index.js"]
    },
    "infimium": {
      "command": "node",
      "args": ["G:\\Deployment Help\\04_INFIMIUM_LOCAL_REPO_INTELLIGENCE\\mcp-server\\dist\\index.js"]
    }
  }
}
```

### 2.3 Antigravity & Gemini CLI
Add to `C:\Users\OM\.gemini\config\mcp_config.json`:

```json
{
  "mcpServers": {
    "reui": {
      "command": "node",
      "args": ["G:\\Deployment Help\\01_REUI_COMPONENT_REGISTRY\\mcp-server\\dist\\index.js"]
    },
    "lighthouse": {
      "command": "node",
      "args": ["G:\\Deployment Help\\02_GOOGLE_LIGHTHOUSE_ENGINE\\mcp-server\\dist\\index.js"]
    },
    "context7": {
      "command": "node",
      "args": ["G:\\Deployment Help\\03_CONTEXT7_DOCS_INTELLIGENCE\\mcp-server\\dist\\index.js"]
    },
    "infimium": {
      "command": "node",
      "args": ["G:\\Deployment Help\\04_INFIMIUM_LOCAL_REPO_INTELLIGENCE\\mcp-server\\dist\\index.js"]
    }
  }
}
```

---

## 3. Operational Troubleshooting

| Symptom | Probable Cause | Remediation |
| :--- | :--- | :--- |
| **Lighthouse headless crash in Docker** | Insufficient shared memory (`/dev/shm`) | Ensure `shm_size: "2gb"` is present in `docker-compose.yml` |
| **MCP stdio timeout on launch** | Missing compiled JavaScript | Run `npm run build` inside each service's `mcp-server/` directory |
| **ReUI component styling mismatch** | Missing Tailwind CSS HSL variables | Ensure `:root` in `globals.css` declares the required ReUI HSL variables |
| **Infimium memory not persisting** | Storage volume not mounted | Verify write permissions on `STORAGE_DIR` or the mapped Docker volume |
