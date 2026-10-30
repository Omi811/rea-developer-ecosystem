/**
 * Google Lighthouse Scoring Engine Reverse Engineering
 * Reconstructs the exact log-normal distribution scoring curves used by Lighthouse.
 */

export interface MetricCalibration {
  p10: number;    // Value at score 0.90
  median: number; // Value at score 0.50
  weight: number; // Contribution to overall performance category
}

export const LIGHTHOUSE_METRIC_CALIBRATIONS: Record<string, MetricCalibration> = {
  fcp: { p10: 1800, median: 3000, weight: 0.10 },
  si:  { p10: 3387, median: 5800, weight: 0.10 },
  lcp: { p10: 2500, median: 4000, weight: 0.25 },
  tbt: { p10: 200,  median: 600,  weight: 0.30 },
  cls: { p10: 0.10, median: 0.25, weight: 0.25 },
};

/**
 * High-precision approximation of the Gauss Error Function erf(x)
 * Chebyshev fitting approximation (Abramowitz and Stegun 7.1.26)
 */
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p  = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Complementary error function erfc(x) = 1 - erf(x)
 */
function erfc(x: number): number {
  return 1.0 - erf(x);
}

/**
 * Calculates a 0.0 - 1.0 Lighthouse score from a raw metric value using a log-normal distribution.
 */
export function calculateLogNormalScore(value: number, p10: number, median: number): number {
  if (value <= 0) return 1.0;

  // mu is the natural log of median
  const mu = Math.log(median);

  // Z-score for 90th percentile is Phi^-1(0.90) ≈ 1.2815515655
  // Since lower metric values yield higher scores:
  const sigma = (Math.log(p10) - mu) / -1.2815515655;

  if (sigma <= 0) {
    throw new Error("Invalid calibration parameters: p10 must be less than median.");
  }

  // Standard log-normal CDF evaluated at value
  const z = (Math.log(value) - mu) / (sigma * Math.SQRT2);
  const score = 0.5 * erfc(z);

  // Clamp strictly between 0 and 1, round to 2 decimal places
  return Math.min(1.0, Math.max(0.0, Math.round(score * 100) / 100));
}

export interface MetricScoreResult {
  metric: string;
  value: number;
  score: number;
  weight: number;
  rating: "good" | "needs-improvement" | "poor";
}

export interface PerformanceAuditResult {
  overallScore: number;
  metrics: Record<string, MetricScoreResult>;
}

/**
 * Computes individual metric scores and total weighted category score.
 */
export function evaluatePerformanceCategory(rawMetrics: {
  fcp: number;
  si: number;
  lcp: number;
  tbt: number;
  cls: number;
}): PerformanceAuditResult {
  const metrics: Record<string, MetricScoreResult> = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const [key, calib] of Object.entries(LIGHTHOUSE_METRIC_CALIBRATIONS)) {
    const val = rawMetrics[key as keyof typeof rawMetrics];
    const score = calculateLogNormalScore(val, calib.p10, calib.median);
    const rating: "good" | "needs-improvement" | "poor" =
      score >= 0.90 ? "good" : score >= 0.50 ? "needs-improvement" : "poor";

    metrics[key] = {
      metric: key.toUpperCase(),
      value: val,
      score,
      weight: calib.weight,
      rating,
    };

    totalWeightedScore += score * calib.weight;
    totalWeight += calib.weight;
  }

  const overallScore = Math.round((totalWeightedScore / totalWeight) * 100);

  return {
    overallScore,
    metrics,
  };
}
