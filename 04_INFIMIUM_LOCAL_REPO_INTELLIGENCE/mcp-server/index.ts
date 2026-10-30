#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

// In-memory mock storage for local repo demonstration
interface SymbolRef {
  name: string;
  kind: string;
  filePath: string;
  line: number;
}

const LOCAL_WORKSPACE_SYMBOLS: SymbolRef[] = [
  { name: "AuthSessionManager", kind: "class", filePath: "src/auth/session.ts", line: 12 },
  { name: "verifyToken", kind: "function", filePath: "src/auth/jwt.ts", line: 45 },
  { name: "PaymentWebhookHandler", kind: "function", filePath: "src/billing/webhook.ts", line: 20 },
  { name: "dbConnectionPool", kind: "variable", filePath: "src/database/pool.ts", line: 8 },
];

const LOCAL_DECISIONS = [
  {
    id: "adr_001",
    timestamp: "2026-10-15T10:00:00Z",
    title: "Enforce Local-First Architecture",
    decision: "All code indexing and memory storage must run strictly on localhost without cloud egress.",
    status: "accepted"
  },
  {
    id: "adr_002",
    timestamp: "2026-10-20T14:30:00Z",
    title: "Standardize on MCP 2024-11-05 Specification",
    decision: "All agent tool interfaces must communicate over standard JSON-RPC stdio protocol.",
    status: "accepted"
  }
];

const server = new Server(
  {
    name: "infimium-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_codebase",
        description: "Perform local hybrid search across codebase symbols, functions, and classes",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query or symbol name" },
            kind: { type: "string", description: "Filter by kind ('function', 'class', 'interface')" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_symbol_graph",
        description: "Retrieve dependency graph, callers, and callees for a symbol",
        inputSchema: {
          type: "object",
          properties: {
            symbolName: { type: "string", description: "Name of the target symbol" },
          },
          required: ["symbolName"],
        },
      },
      {
        name: "read_project_memory",
        description: "Read persistent architectural decisions (ADRs) and codebase invariants",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "record_project_decision",
        description: "Record a new architectural decision or invariant into local persistent memory",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            decision: { type: "string" },
          },
          required: ["title", "decision"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "search_codebase") {
    const q = ((args?.query as string) || "").toLowerCase();
    const kind = args?.kind as string;

    const matches = LOCAL_WORKSPACE_SYMBOLS.filter((s) => {
      const matchQ = s.name.toLowerCase().includes(q) || s.filePath.toLowerCase().includes(q);
      const matchK = !kind || s.kind.toLowerCase() === kind.toLowerCase();
      return matchQ && matchK;
    });

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ matches, count: matches.length }, null, 2)
      }]
    };
  }

  if (name === "get_symbol_graph") {
    const symbolName = args?.symbolName as string;
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          symbol: symbolName,
          incomingCalls: [
            { caller: "handleIncomingRequest", file: "src/server/router.ts", line: 55 }
          ],
          outgoingCalls: [
            { callee: "crypto.timingSafeEqual", file: "node:crypto" }
          ],
          dependencies: ["src/auth/jwt.ts", "src/database/pool.ts"]
        }, null, 2)
      }]
    };
  }

  if (name === "read_project_memory") {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          decisions: LOCAL_DECISIONS,
          invariants: [
            "Strict local data sovereignty (zero cloud code transmission)",
            "All mutations must be accompanied by integration tests",
            "TypeScript strict mode is required for all new files"
          ]
        }, null, 2)
      }]
    };
  }

  if (name === "record_project_decision") {
    const title = args?.title as string;
    const decision = args?.decision as string;
    const newRecord = {
      id: `adr_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      decision,
      status: "accepted"
    };
    LOCAL_DECISIONS.push(newRecord);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ message: "Decision recorded successfully", record: newRecord }, null, 2)
      }]
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Infimium MCP server listening on stdio");
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
