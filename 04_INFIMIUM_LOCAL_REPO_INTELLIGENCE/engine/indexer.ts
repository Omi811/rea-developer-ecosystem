import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export interface SymbolRecord {
  name: string;
  kind: "function" | "class" | "interface" | "type" | "variable";
  filePath: string;
  line: number;
  signature: string;
}

export interface FileIndex {
  filePath: string;
  hash: string;
  imports: string[];
  exports: string[];
  symbols: SymbolRecord[];
}

export class CodebaseIndexer {
  private rootDir: string;
  private fileIndices: Map<string, FileIndex> = new Map();

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  public indexAll(): Map<string, FileIndex> {
    this.walk(this.rootDir);
    return this.fileIndices;
  }

  private walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this.walk(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        this.indexFile(fullPath);
      }
    }
  }

  public indexFile(filePath: string): FileIndex {
    const content = fs.readFileSync(filePath, "utf-8");
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    const lines = content.split("\n");

    const imports: string[] = [];
    const exports: string[] = [];
    const symbols: SymbolRecord[] = [];

    // Extract imports
    const importRegex = /import\s+(?:.*?from\s+)?['"](.*?)['"]/g;
    let impMatch;
    while ((impMatch = importRegex.exec(content)) !== null) {
      imports.push(impMatch[1]);
    }

    // Extract functions, classes, interfaces
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const fnMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/);
      if (fnMatch) {
        symbols.push({
          name: fnMatch[1],
          kind: "function",
          filePath,
          line: lineNum,
          signature: line.trim(),
        });
      }

      const classMatch = line.match(/(?:export\s+)?class\s+([A-Za-z0-9_$]+)/);
      if (classMatch) {
        symbols.push({
          name: classMatch[1],
          kind: "class",
          filePath,
          line: lineNum,
          signature: line.trim(),
        });
      }

      const ifaceMatch = line.match(/(?:export\s+)?interface\s+([A-Za-z0-9_$]+)/);
      if (ifaceMatch) {
        symbols.push({
          name: ifaceMatch[1],
          kind: "interface",
          filePath,
          line: lineNum,
          signature: line.trim(),
        });
      }

      const typeMatch = line.match(/(?:export\s+)?type\s+([A-Za-z0-9_$]+)\s*=/);
      if (typeMatch) {
        symbols.push({
          name: typeMatch[1],
          kind: "type",
          filePath,
          line: lineNum,
          signature: line.trim(),
        });
      }
    });

    const index: FileIndex = {
      filePath,
      hash,
      imports,
      exports,
      symbols,
    };

    this.fileIndices.set(filePath, index);
    return index;
  }

  public getIndex(): Map<string, FileIndex> {
    return this.fileIndices;
  }
}
