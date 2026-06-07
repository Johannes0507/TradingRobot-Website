/**
 * Centralized CTA URL builder.
 *
 * All "go to v2 product app" links flow through here so we can:
 *   - Switch app domain in one place (dev/staging/prod)
 *   - Tag UTM parameters per source for analytics
 *   - Preserve referral codes / coupons consistently
 *
 * Strategy decision (2026-05-10): subscription happens in app.lendauto.com,
 * marketing site only redirects via these helpers. See B-pattern in design notes.
 */

const APP_BASE = import.meta.env.PUBLIC_APP_BASE_URL ?? 'https://app.lendauto.com';

export type CtaSource =
  | 'nav'
  | 'hero'
  | 'pricing-starter'
  | 'pricing-pro'
  | 'pricing-elite'
  | 'cta-footer'
  | 'guide-bitfinex-setup'
  | 'blog-post';

interface CtaOptions {
  source: CtaSource;
  plan?: 'starter' | 'pro' | 'elite';
  coupon?: string;
}

function withParams(path: string, params: Record<string, string | undefined>) {
  const url = new URL(path, APP_BASE);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v);
  }
  return url.toString();
}

/** Subscription CTA — primary "start using wen control" action. */
export function subscribeUrl(opts: CtaOptions): string {
  return withParams('/subscribe', {
    plan: opts.plan,
    coupon: opts.coupon,
    utm_source: 'lendauto-com',
    utm_medium: 'web',
    utm_campaign: opts.source,
  });
}

/** Login CTA — for returning users. */
export function loginUrl(source: CtaSource): string {
  return withParams('/login', {
    utm_source: 'lendauto-com',
    utm_medium: 'web',
    utm_campaign: source,
  });
}

/** Dashboard deep-link — for "continue where you left off" patterns. */
export function dashboardUrl(source: CtaSource): string {
  return withParams('/dashboard', {
    utm_source: 'lendauto-com',
    utm_medium: 'web',
    utm_campaign: source,
  });
}
