/**
 * Callout — info / warn / danger box for MDX guides.
 * Lightweight React component, can be `client:visible` since it's mostly static.
 */
import type { ReactNode } from 'react';

export interface CalloutProps {
  type?: 'info' | 'warn' | 'danger' | 'success';
  children?: ReactNode;
}

/* Use design tokens via color-mix for tinted backgrounds.
   Each variant derives bg/border from a single token, no hard-coded hex. */
const styles = {
  info: {
    bg: 'color-mix(in srgb, var(--color-brand) 5%, transparent)',
    border: 'color-mix(in srgb, var(--color-brand) 25%, transparent)',
    icon: 'ℹ',
    color: 'var(--color-brand)',
  },
  warn: {
    bg: 'color-mix(in srgb, var(--color-warn) 7%, transparent)',
    border: 'color-mix(in srgb, var(--color-warn) 30%, transparent)',
    icon: '⚠',
    color: 'color-mix(in srgb, var(--color-warn) 80%, var(--color-ink))',
  },
  danger: {
    bg: 'color-mix(in srgb, var(--color-danger) 7%, transparent)',
    border: 'color-mix(in srgb, var(--color-danger) 30%, transparent)',
    icon: '✕',
    color: 'color-mix(in srgb, var(--color-danger) 80%, var(--color-ink))',
  },
  success: {
    bg: 'color-mix(in srgb, var(--color-success) 7%, transparent)',
    border: 'color-mix(in srgb, var(--color-success) 30%, transparent)',
    icon: '✓',
    color: 'color-mix(in srgb, var(--color-success) 80%, var(--color-ink))',
  },
};

export function Callout({ type = 'info', children }: CalloutProps) {
  const s = styles[type];
  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        margin: '1.5rem 0',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          color: s.color,
          fontWeight: 700,
          fontSize: '1.1em',
          lineHeight: 1.5,
          flexShrink: 0,
        }}
      >
        {s.icon}
      </span>
      <div style={{ flex: 1, color: 'var(--color-ink)', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}
