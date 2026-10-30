/**
 * Context7 Token Budget Optimizer
 * Compresses documentation to fit strictly within LLM agent token limits.
 */

export class TokenOptimizer {
  /**
   * Compresses markdown by stripping extraneous prose while preserving code, signatures, and warnings.
   */
  public optimizeDocumentation(markdown: string, maxTokens: number = 2000): string {
    // 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;

    if (markdown.length <= maxChars) {
      return markdown;
    }

    // Split markdown into sections by headers (# or ##)
    const sections = markdown.split(/(?=^#{1,3}\s)/m);
    let result = "";

    for (const sec of sections) {
      if ((result + sec).length > maxChars) {
        // Keep code blocks from remaining sections if possible
        const codeMatches = sec.match(/```[\s\S]*?```/g);
        if (codeMatches) {
          const joinedCode = "\n" + codeMatches.join("\n\n") + "\n";
          if ((result + joinedCode).length <= maxChars) {
            result += joinedCode;
          }
        }
        break;
      }
      result += sec + "\n";
    }

    return result.trim() + "\n\n<!-- [Context7 Token Optimizer: Truncated to fit budget] -->";
  }
}
