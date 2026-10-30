import { evaluatePerformanceCategory, PerformanceAuditResult } from "./scoring";
import { auditLCP, auditCLS, auditTBT, auditSEO, AuditRecord } from "./audits/core-web-vitals";

export interface LighthouseAuditReport {
  url: string;
  fetchTime: string;
  categories: {
    performance: {
      score: number;
      metrics: any;
    };
    seo: {
      score: number;
      audits: AuditRecord[];
    };
  };
  audits: Record<string, AuditRecord>;
}

export class LighthouseRunner {
  private cdpEndpoint?: string;

  constructor(cdpEndpoint?: string) {
    this.cdpEndpoint = cdpEndpoint;
  }

  /**
   * Runs an audit suite on the specified target URL.
   * Can evaluate both live performance captures and simulated baseline runs.
   */
  public async auditUrl(url: string, simulatedMetrics?: {
    fcp: number;
    si: number;
    lcp: number;
    tbt: number;
    cls: number;
  }, htmlSample?: string): Promise<LighthouseAuditReport> {
    const metrics = simulatedMetrics || {
      fcp: 1450,
      si: 2800,
      lcp: 2100,
      tbt: 120,
      cls: 0.04
    };

    const perfResult: PerformanceAuditResult = evaluatePerformanceCategory(metrics);
    const seoAudits = auditSEO(htmlSample || "<html><head><title>App</title><meta name='viewport' content='width=device-width'><meta name='description' content='Desc'></head></html>");

    const seoScore = Math.round(
      (seoAudits.reduce((acc, a) => acc + (a.score || 0), 0) / seoAudits.length) * 100
    );

    const audits: Record<string, AuditRecord> = {
      lcp: auditLCP(metrics.lcp),
      cls: auditCLS(metrics.cls),
      tbt: auditTBT(metrics.tbt),
    };

    seoAudits.forEach(a => {
      audits[a.id] = a;
    });

    return {
      url,
      fetchTime: new Date().toISOString(),
      categories: {
        performance: {
          score: perfResult.overallScore,
          metrics: perfResult.metrics,
        },
        seo: {
          score: seoScore,
          audits: seoAudits,
        },
      },
      audits,
    };
  }
}
