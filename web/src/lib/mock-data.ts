/**
 * Centralized mock data for the LendAuto marketing site.
 *
 * Future GCP phase: this file will be replaced by a build-time generator
 * (Cloud Build pulling Bitfinex public API + LendAuto v2 stats endpoint).
 * The export *shape* below is the contract — keep field names stable.
 *
 * As-of date should reflect when the mock numbers were last sanity-checked.
 */

export const META = {
  asOf: '2026-05-18T00:00:00Z',
  source: 'Bitfinex Public API (mock during dev)',
} as const;

// ---------------------------------------------------------------------------
// Bitfinex funding market — pure market data (NOT LendAuto performance)
// ---------------------------------------------------------------------------

export const MARKET_DATA = {
  fusd30dAvgApr: 8.42,
  fust30dAvgApr: 6.18,

  // 30-day rolling extremes
  fusd30dHighApr: 38.40,
  fusd30dHighDate: '2026-04-22',
  fusd30dLowApr: 2.10,
  fusd30dLowDate: '2026-05-03',

  // Signed delta vs prior 30 days
  fusdVsPrevDelta: 0.30,
  fustVsPrevDelta: -0.10,

  // 30 daily-avg APR points for sparkline (oldest → newest)
  fusd30dDaily: [
    6.8, 7.1, 7.4, 8.0, 9.2, 12.4, 18.7, 38.4, 24.1, 14.2,
    10.3, 8.7, 7.9, 7.2, 6.9, 7.0, 7.3, 7.6, 8.1, 8.4,
    8.8, 9.3, 9.7, 10.2, 9.8, 9.1, 8.6, 8.2, 8.5, 8.42,
  ] as readonly number[],
} as const;

// ---------------------------------------------------------------------------
// Hero KPI strip
// ---------------------------------------------------------------------------

export const HERO_KPIS = {
  fusd30dAvgApr: MARKET_DATA.fusd30dAvgApr,
  rateRefreshSec: 30,
} as const;

// ---------------------------------------------------------------------------
// ROI calculator parameters
// ---------------------------------------------------------------------------

export const ROI_PARAMS = {
  apr: MARKET_DATA.fusd30dAvgApr / 100, // 0.0842
  proPriceTwd: 899,
  twdPerUsd: 30,
  proPriceUsd: 28, // displayed integer; 899 / 30 ≈ 29.97
  scenarios: [1000, 10000, 50000] as const,
} as const;

// ---------------------------------------------------------------------------
// Pure calculation helpers (used by RoiBlock + RoiCalculator island)
// ---------------------------------------------------------------------------

export function monthlyGross(capitalUsd: number, apr: number): number {
  return (capitalUsd * apr) / 12;
}

export function monthlyNet(capitalUsd: number, apr: number, monthlyFeeUsd: number): number {
  return monthlyGross(capitalUsd, apr) - monthlyFeeUsd;
}

export function breakevenCapital(apr: number, monthlyFeeUsd: number): number {
  return (monthlyFeeUsd * 12) / apr;
}
