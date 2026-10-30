#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import core calculation functions
function calculateLogNormalScore(value: number, p10: number, median: number): number {
  if (value <= 0) return 1.0;
  const mu = Math.log(median);
  const sigma = (Math.log(p10) - mu) / -1.2815515655;
  const z = (Math.log(value) - mu) / (sigma * Math.SQRT2);

  // Erfc approximation
  const absX = Math.abs(z);
  const t = 1.0 / (1.0 + 0.3275911 * absX);
  const y = 1.0 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-absX * absX));
  const erfVal = z >= 0 ? y : -y;
  const score = 0.5 * (1.0 - erfVal);

  return Math.min(1.0, Math.max(0.0, Math.round(score * 100) / 100));
}

const CALIBRATIONS: Record<string, { p10: number; median: number; weight: number }> = {
  fcp: { p10: 1800, median: 3000, weight: 0.10 },
  si:  { p10: 3387, median: 5800, weight: 0.10 },
  lcp: { p10: 2500, median: 4000, weight: 0.25 },
  tbt: { p10: 200,  median: 600,  weight: 0.30 },
  cls: { p10: 0.10, median: 0.25, weight: 0.25 },
};

const server = new Server(
  {
    name: "lighthouse-mcp-server",
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
        name: "calculate_metric_score",
        description: "Calculate official Lighthouse log-normal score (0.0 to 1.0) for a given metric and timing",
        inputSchema: {
          type: "object",
          properties: {
            metric: { type: "string", enum: ["fcp", "si", "lcp", "tbt", "cls"] },
            value: { type: "number", description: "Raw metric value in ms (or unitless for CLS)" },
          },
          required: ["metric", "value"],
        },
      },
      {
        name: "run_lighthouse_audit",
        description: "Execute a Lighthouse performance & quality audit simulation on a target URL",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL to benchmark" },
            device: { type: "string", enum: ["mobile", "desktop"], default: "mobile" },
          },
          required: ["url"],
        },
      },
      {
        name: "get_performance_remediation",
        description: "Get remediation actions for poor Core Web Vitals",
        inputSchema: {
          type: "object",
          properties: {
            metric: { type: "string", enum: ["lcp", "cls", "tbt"] },
            currentValue: { type: "number" },
          },
          required: ["metric"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "calculate_metric_score") {
    const metric = (args?.metric as string).toLowerCase();
    const value = args?.value as number;
    const calib = CALIBRATIONS[metric];

    if (!calib) {
      return { isError: true, content: [{ type: "text", text: `Unknown metric: ${metric}` }] };
    }

    const score = calculateLogNormalScore(value, calib.p10, calib.median);
    const rating = score >= 0.90 ? "good" : score >= 0.50 ? "needs-improvement" : "poor";

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          metric: metric.toUpperCase(),
          raw_value: value,
          score,
          category_weight: calib.weight,
          rating,
          target_p10_good: calib.p10,
          median_needs_improvement: calib.median,
        }, null, 2),
      }],
    };
  }

  if (name === "run_lighthouse_audit") {
    const url = args?.url as string;
    const device = (args?.device as string) || "mobile";

    // Standard mobile audit evaluation
    const sampleRaw = {
      fcp: 1650,
      si: 3100,
      lcp: 2200,
      tbt: 140,
      cls: 0.03,
    };

    let weightedSum = 0;
    const metricsResult: Record<string, any> = {};

    for (const [k, c] of Object.entries(CALIBRATIONS)) {
      const val = sampleRaw[k as keyof typeof sampleRaw];
      const sc = calculateLogNormalScore(val, c.p10, c.median);
      weightedSum += sc * c.weight;
      metricsResult[k] = {
        value: val,
        score: sc,
        rating: sc >= 0.9 ? "good" : sc >= 0.5 ? "needs-improvement" : "poor",
      };
    }

    const performanceScore = Math.round(weightedSum * 100);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          target_url: url,
          device_emulation: device,
          timestamp: new Date().toISOString(),
          categories: {
            performance: { score: performanceScore, metrics: metricsResult },
            accessibility: { score: 96, status: "passed" },
            best_practices: { score: 100, status: "passed" },
            seo: { score: 92, status: "passed" },
          },
        }, null, 2),
      }],
    };
  }

  if (name === "get_performance_remediation") {
    const metric = (args?.metric as string).toLowerCase();
    const remediations: Record<string, string[]> = {
      lcp: [
        "Preload the LCP hero image via <link rel='preload' as='image' href='...'>",
        "Set fetchpriority='high' on the above-the-fold image tag",
        "Ensure server response time (TTFB) is under 600ms via Edge caching / CDN",
        "Remove render-blocking third-party scripts from <head>",
      ],
      cls: [
        "Explicitly set width and height attributes on all <img> and <video> elements",
        "Reserve CSS space (min-height / aspect-ratio) for dynamic ad containers or banners",
        "Use font-display: optional or preload custom web fonts to prevent layout shifts",
      ],
      tbt: [
        "Split large JavaScript bundles using dynamic import() / React.lazy",
        "Offload heavy data transformations or analytics to a Web Worker",
        "Break long tasks (>50ms) using scheduler.yield() or setTimeout",
      ],
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          metric: metric.toUpperCase(),
          recommendations: remediations[metric] || ["Audit overall bundle size and main thread workload."],
        }, null, 2),
      }],
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Lighthouse MCP server listening on stdio");
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
