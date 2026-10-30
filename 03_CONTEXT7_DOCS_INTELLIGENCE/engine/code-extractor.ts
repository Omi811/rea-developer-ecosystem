/**
 * Context7 Code Example Extractor
 * Parses Markdown AST to extract and validate executable code blocks.
 */

export interface CodeBlockSnippet {
  language: string;
  code: string;
  lineCount: number;
  imports: string[];
  isAsync: boolean;
}

export class CodeExtractor {
  public extractCodeBlocks(markdown: string): CodeBlockSnippet[] {
    const snippets: CodeBlockSnippet[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const language = match[1] || "text";
      const code = match[2].trim();

      const imports: string[] = [];
      const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
      let impMatch;
      while ((impMatch = importRegex.exec(code)) !== null) {
        imports.push(impMatch[1]);
      }

      snippets.push({
        language,
        code,
        lineCount: code.split("\n").length,
        imports,
        isAsync: code.includes("async ") || code.includes("await "),
      });
    }

    return snippets;
  }
}
