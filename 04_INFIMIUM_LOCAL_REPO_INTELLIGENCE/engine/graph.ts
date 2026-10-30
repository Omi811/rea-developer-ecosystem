import { FileIndex } from "./indexer";
import * as path from "path";

export interface GraphNode {
  id: string; // File path or Symbol ID
  type: "file" | "symbol";
  outEdges: string[]; // Targets imported or called
  inEdges: string[];  // Callers or importing files
}

export class DependencyGraph {
  private nodes: Map<string, GraphNode> = new Map();

  public buildFromIndices(indices: Map<string, FileIndex>) {
    // 1. Initialize nodes for all files
    for (const [filePath] of indices.entries()) {
      this.ensureNode(filePath, "file");
    }

    // 2. Resolve imports into directed edges
    for (const [filePath, fileIndex] of indices.entries()) {
      const sourceNode = this.ensureNode(filePath, "file");

      for (const rawImport of fileIndex.imports) {
        if (rawImport.startsWith(".")) {
          // Resolve relative path
          const dir = path.dirname(filePath);
          const resolved = path.resolve(dir, rawImport);
          // Try extensions
          const candidates = [
            resolved,
            `${resolved}.ts`,
            `${resolved}.tsx`,
            `${resolved}.js`,
            path.join(resolved, "index.ts"),
            path.join(resolved, "index.js"),
          ];

          for (const cand of candidates) {
            if (indices.has(cand)) {
              const targetNode = this.ensureNode(cand, "file");
              sourceNode.outEdges.push(cand);
              targetNode.inEdges.push(filePath);
              break;
            }
          }
        }
      }
    }
  }

  private ensureNode(id: string, type: "file" | "symbol"): GraphNode {
    let node = this.nodes.get(id);
    if (!node) {
      node = { id, type, outEdges: [], inEdges: [] };
      this.nodes.set(id, node);
    }
    return node;
  }

  public getDependencies(id: string): string[] {
    return this.nodes.get(id)?.outEdges || [];
  }

  public getDependents(id: string): string[] {
    return this.nodes.get(id)?.inEdges || [];
  }

  public detectCycles(): string[][] {
    const visited = new Set<string>();
    const stack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (curr: string, currentPath: string[]) => {
      visited.add(curr);
      stack.add(curr);
      currentPath.push(curr);

      const node = this.nodes.get(curr);
      if (node) {
        for (const neighbor of node.outEdges) {
          if (!visited.has(neighbor)) {
            dfs(neighbor, [...currentPath]);
          } else if (stack.has(neighbor)) {
            const cycleStartIdx = currentPath.indexOf(neighbor);
            cycles.push(currentPath.slice(cycleStartIdx).concat(neighbor));
          }
        }
      }

      stack.delete(curr);
    };

    for (const nodeKey of this.nodes.keys()) {
      if (!visited.has(nodeKey)) {
        dfs(nodeKey, []);
      }
    }

    return cycles;
  }
}
