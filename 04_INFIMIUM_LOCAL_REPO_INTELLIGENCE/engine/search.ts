import { FileIndex, SymbolRecord } from "./indexer";

export interface SearchMatch {
  filePath: string;
  line: number;
  snippet: string;
  score: number;
  kind: string;
}

export class HybridCodeSearch {
  private indices: Map<string, FileIndex>;

  constructor(indices: Map<string, FileIndex>) {
    this.indices = indices;
  }

  public search(query: string, maxResults: number = 10): SearchMatch[] {
    const qLower = query.toLowerCase();
    const queryTokens = qLower.split(/\W+/).filter(Boolean);
    const matches: SearchMatch[] = [];

    for (const [filePath, fileIndex] of this.indices.entries()) {
      // 1. Search symbols first (higher relevance)
      for (const sym of fileIndex.symbols) {
        let score = 0;
        const symNameLower = sym.name.toLowerCase();

        if (symNameLower === qLower) {
          score += 100;
        } else if (symNameLower.includes(qLower)) {
          score += 50;
        }

        for (const token of queryTokens) {
          if (symNameLower.includes(token)) score += 15;
          if (sym.signature.toLowerCase().includes(token)) score += 5;
        }

        if (score > 0) {
          matches.push({
            filePath,
            line: sym.line,
            snippet: sym.signature,
            score,
            kind: `symbol:${sym.kind}`,
          });
        }
      }
    }

    // Sort descending by score
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, maxResults);
  }
}
