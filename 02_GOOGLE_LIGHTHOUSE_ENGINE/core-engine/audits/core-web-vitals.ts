/**
 * Core Web Vitals & Quality Audits Implementation
 */

export interface AuditRecord {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue: string;
  scoreDisplayMode: "numeric" | "binary" | "informative";
  details?: any;
}

export function auditLCP(lcpMs: number): AuditRecord {
  const score = lcpMs <= 2500 ? 1 : lcpMs <= 4000 ? 0.5 : 0;
  return {
    id: "largest-contentful-paint",
    title: "Largest Contentful Paint",
    description: "Marks the point in the page load timeline when the page's main content has likely loaded.",
    score,
    displayValue: `${(lcpMs / 1000).toFixed(2)} s`,
    scoreDisplayMode: "numeric",
    details: { thresholdMs: 2500 }
  };
}

export function auditCLS(clsScore: number): AuditRecord {
  const score = clsScore <= 0.1 ? 1 : clsScore <= 0.25 ? 0.5 : 0;
  return {
    id: "cumulative-layout-shift",
    title: "Cumulative Layout Shift",
    description: "Measures the movement of visible elements within the viewport.",
    score,
    displayValue: clsScore.toFixed(3),
    scoreDisplayMode: "numeric",
    details: { threshold: 0.10 }
  };
}

export function auditTBT(tbtMs: number): AuditRecord {
  const score = tbtMs <= 200 ? 1 : tbtMs <= 600 ? 0.5 : 0;
  return {
    id: "total-blocking-time",
    title: "Total Blocking Time",
    description: "Sum of all time periods between FCP and Time to Interactive when task length exceeded 50ms.",
    score,
    displayValue: `${Math.round(tbtMs)} ms`,
    scoreDisplayMode: "numeric",
    details: { thresholdMs: 200 }
  };
}

export function auditSEO(html: string): AuditRecord[] {
  const audits: AuditRecord[] = [];

  // Document Title
  const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(html);
  audits.push({
    id: "document-title",
    title: "Document has a <title> element",
    description: "The title gives screen reader users and search engines an overview of the page.",
    score: hasTitle ? 1 : 0,
    displayValue: hasTitle ? "Passed" : "Missing title element",
    scoreDisplayMode: "binary"
  });

  // Meta Description
  const hasMetaDesc = /<meta[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html);
  audits.push({
    id: "meta-description",
    title: "Document has a meta description",
    description: "Meta descriptions are used in search results to summarize page content.",
    score: hasMetaDesc ? 1 : 0,
    displayValue: hasMetaDesc ? "Passed" : "Missing meta description",
    scoreDisplayMode: "binary"
  });

  // Viewport Meta Tag
  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
  audits.push({
    id: "viewport",
    title: "Has a <meta name=\"viewport\"> tag with width or initial-scale",
    description: "A configured viewport optimizes your app for mobile screen sizes.",
    score: hasViewport ? 1 : 0,
    displayValue: hasViewport ? "Passed" : "No viewport tag detected",
    scoreDisplayMode: "binary"
  });

  return audits;
}
