/**
 * Callout — info / warn / danger box for MDX guides.
 * Lightweight React component, can be `client:visible` since it's mostly static.
 */
import type { ReactNode } from 'react';

export interface CalloutProps {
  type?: 'info' | 'warn' | 'danger' | 'success';
  children?: ReactNode;
}

const styles = {
  info: {
    bg: 'rgb(99 91 255 / 0.05)',
    border: 'rgb(99 91 255 / 0.25)',
    icon: 'ℹ',
    color: '#635bff',
  },
  warn: {
    bg: 'rgb(245 158 11 / 0.07)',
    border: 'rgb(245 158 11 / 0.30)',
    icon: '⚠',
    color: '#b45309',
  },
  danger: {
    bg: 'rgb(239 68 68 / 0.07)',
    border: 'rgb(239 68 68 / 0.30)',
    icon: '✕',
    color: '#b91c1c',
  },
  success: {
    bg: 'rgb(16 185 129 / 0.07)',
    border: 'rgb(16 185 129 / 0.30)',
    icon: '✓',
    color: '#047857',
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
