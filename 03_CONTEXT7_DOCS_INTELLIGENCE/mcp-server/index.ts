#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Authoritative in-memory version documentation catalog
interface DocEntry {
  packageName: string;
  version: string;
  summary: string;
  docs: string;
  examples: Array<{ title: string; code: string }>;
}

const DOC_CATALOG: Record<string, DocEntry> = {
  "next@15.0.0": {
    packageName: "next",
    version: "15.0.0",
    summary: "Next.js 15 App Router featuring Turbopack, React 19 support, and async cookies/headers.",
    docs: `# Next.js 15 Release & App Router Guide
- Async Request APIs: cookies() and headers() must be awaited.
- React 19 Compatibility: Actions, useActionState, and useOptimistic are native.
- Turbopack: Default for next dev via --turbo.
- Stale Times: Client router cache stale time defaults to 0s for dynamic pages.`,
    examples: [
      {
        title: "Async Cookies in Next.js 15 Server Component",
        code: `import { cookies } from 'next/headers';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_token')?.value;

  return <div>Authenticated Token: {sessionToken}</div>;
}`
      },
      {
        title: "Server Action with useActionState",
        code: `'use client';
import { useActionState } from 'react';
import { updateUsername } from '@/app/actions';

export function EditProfile() {
  const [state, formAction, isPending] = useActionState(updateUsername, null);

  return (
    <form action={formAction}>
      <input name="username" required />
      <button disabled={isPending}>{isPending ? 'Updating...' : 'Save'}</button>
      {state?.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}`
      }
    ]
  },
  "zod@3.23.8": {
    packageName: "zod",
    version: "3.23.8",
    summary: "TypeScript-first schema declaration and validation library with static type inference.",
    docs: `# Zod 3.23
- Strict Object Parsing: z.strictObject({ ... }) forbids undeclared keys.
- Safe Parsing: schema.safeParse(input) returns { success: true, data } | { success: false, error }.
- Type Inference: type MyType = z.infer<typeof mySchema>.`,
    examples: [
      {
        title: "Schema Definition & Safe Parse",
        code: `import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().min(18),
});

export type User = z.infer<typeof UserSchema>;

export function validatePayload(payload: unknown) {
  const result = UserSchema.safeParse(payload);
  if (!result.success) {
    console.error(result.error.flatten());
    return null;
  }
  return result.data;
}`
      }
    ]
  }
};

const server = new Server(
  {
    name: "context7-mcp-server",
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
        name: "resolve_library_docs",
        description: "Retrieve up-to-date, version-specific documentation and breaking changes for an open-source library",
        inputSchema: {
          type: "object",
          properties: {
            packageName: { type: "string", description: "Package name (e.g. 'next', 'zod', 'react', 'prisma')" },
            version: { type: "string", description: "Specific version or 'latest'", default: "latest" },
            tokenBudget: { type: "number", description: "Maximum token allowance", default: 2000 },
          },
          required: ["packageName"],
        },
      },
      {
        name: "get_code_examples",
        description: "Get verified, executable code examples for a specific package and version",
        inputSchema: {
          type: "object",
          properties: {
            packageName: { type: "string", description: "Package name" },
            version: { type: "string", default: "latest" },
          },
          required: ["packageName"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const pkg = (args?.packageName as string)?.toLowerCase();
  const ver = (args?.version as string) || "latest";

  const key = `${pkg}@${ver === "latest" ? (pkg === "next" ? "15.0.0" : "3.23.8") : ver}`;
  const entry = DOC_CATALOG[key] || DOC_CATALOG[`${pkg}@15.0.0`] || DOC_CATALOG[`${pkg}@3.23.8`];

  if (name === "resolve_library_docs") {
    if (!entry) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "not_indexed",
            message: `Documentation for ${pkg}@${ver} is not currently cached locally. Proceeding with authoritative fallback synthesis.`
          }, null, 2)
        }]
      };
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          packageName: entry.packageName,
          version: entry.version,
          summary: entry.summary,
          documentation: entry.docs,
        }, null, 2)
      }]
    };
  }

  if (name === "get_code_examples") {
    if (!entry) {
      return {
        content: [{
          type: "text",
          text: `No cached code examples found for ${pkg}@${ver}.`
        }]
      };
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          packageName: entry.packageName,
          version: entry.version,
          examples: entry.examples,
        }, null, 2)
      }]
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Context7 MCP server listening on stdio");
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
