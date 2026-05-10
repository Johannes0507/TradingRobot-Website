/**
 * CopyButton — one-click copy to clipboard with success feedback.
 * Used inside MDX guides for things like IP whitelist values, API endpoints, etc.
 */
import { useState } from 'react';

export interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = '複製' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[CopyButton] clipboard failed:', err);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'var(--color-line-soft)',
        border: '1px solid var(--color-line)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        margin: '1rem 0',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9em',
      }}
    >
      <code style={{ flex: 1, color: 'var(--color-ink)', wordBreak: 'break-all' }}>
        {text}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          padding: '0.4rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          background: copied ? 'var(--color-success)' : 'var(--color-ink)',
          color: 'white',
          border: 'none',
          fontSize: '0.85em',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        {copied ? '✓ 已複製' : label}
      </button>
    </div>
  );
}
