#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

// Embedded seed catalog for ReUI components and blocks
interface RegistryItem {
  name: string;
  type: string;
  description: string;
  category: string;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{
    path: string;
    content: string;
    type: string;
    target?: string;
  }>;
}

const SEED_COMPONENTS: Record<string, RegistryItem> = {
  "data-grid": {
    name: "data-grid",
    type: "registry:block",
    description: "Enterprise virtualized data grid with multi-column sorting, row filtering, pagination, and export.",
    category: "data-display",
    dependencies: ["@tanstack/react-table", "lucide-react"],
    registryDependencies: ["button", "dropdown-menu", "input", "badge"],
    files: [
      {
        path: "components/ui/data-grid.tsx",
        type: "registry:ui",
        content: `import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface DataGridProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataGrid<TData, TValue>({ columns, data }: DataGridProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border p-4 shadow-sm bg-card text-card-foreground">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="h-10 px-4 text-left font-medium text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}`
      }
    ]
  },
  "analytics-chart-block": {
    name: "analytics-chart-block",
    type: "registry:block",
    description: "Pro responsive multi-metric analytics trend card featuring area gradients and time-range filtering.",
    category: "charts",
    dependencies: ["recharts", "lucide-react"],
    registryDependencies: ["card", "button", "tabs"],
    files: [
      {
        path: "components/blocks/analytics-chart-block.tsx",
        type: "registry:block",
        content: `import * as React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const sampleData = [
  { date: "Jan", revenue: 4200, users: 2400 },
  { date: "Feb", revenue: 5300, users: 2900 },
  { date: "Mar", revenue: 6800, users: 3800 },
  { date: "Apr", revenue: 8400, users: 4900 },
  { date: "May", revenue: 10200, users: 5600 },
];

export function AnalyticsChartBlock() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Growth & Performance Analytics</CardTitle>
        <CardDescription>Monthly recurring revenue and active user volume</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sampleData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}`
      }
    ]
  }
};

const server = new Server(
  {
    name: "reui-mcp-server",
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
        name: "list_categories",
        description: "List all component and block categories available in the ReUI registry",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_components",
        description: "Search for UI components or blocks by keyword or category",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search keyword (e.g., 'table', 'grid', 'chart', 'modal')" },
            category: { type: "string", description: "Category filter (e.g., 'data-display', 'charts')" },
          },
        },
      },
      {
        name: "get_component",
        description: "Retrieve full component metadata, dependencies, and source files",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Exact component or block name" },
          },
          required: ["name"],
        },
      },
      {
        name: "generate_install_command",
        description: "Generate the CLI command to add a component or block to a client project",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Component or block name" },
            registryUrl: { type: "string", description: "Custom registry host URL (defaults to http://localhost:3000/r)" },
          },
          required: ["name"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "list_categories") {
    const categories = Array.from(new Set(Object.values(SEED_COMPONENTS).map((c) => c.category)));
    return {
      content: [{ type: "text", text: JSON.stringify({ categories, count: categories.length }, null, 2) }],
    };
  }

  if (name === "search_components") {
    const q = ((args?.query as string) || "").toLowerCase();
    const cat = (args?.category as string) || "";

    const matches = Object.values(SEED_COMPONENTS).filter((c) => {
      const matchQ = !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const matchCat = !cat || c.category.toLowerCase() === cat.toLowerCase();
      return matchQ && matchCat;
    });

    return {
      content: [{
        type: "text",
        text: JSON.stringify(
          matches.map((m) => ({
            name: m.name,
            type: m.type,
            category: m.category,
            description: m.description,
            dependencies: m.dependencies,
          })),
          null,
          2
        ),
      }],
    };
  }

  if (name === "get_component") {
    const componentName = args?.name as string;
    const item = SEED_COMPONENTS[componentName];
    if (!item) {
      return {
        isError: true,
        content: [{ type: "text", text: `Component "${componentName}" not found in ReUI registry.` }],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
    };
  }

  if (name === "generate_install_command") {
    const componentName = args?.name as string;
    const registryUrl = (args?.registryUrl as string) || "http://localhost:3000/r";
    const command = `npx shadcn@latest add "${registryUrl}/${componentName}.json"`;
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          component: componentName,
          command,
          usageNote: "Run this command inside your Next.js/Vite project configured with shadcn/ui."
        }, null, 2),
      }],
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ReUI MCP server listening on stdio");
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
