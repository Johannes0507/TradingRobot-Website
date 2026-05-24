/**
 * Counter — animates a number from 0 to target when scrolled into view.
 * Respects prefers-reduced-motion (skips animation, shows target value).
 * Uses easeOutCubic for premium feel.
 */
import { useEffect, useRef, useState } from 'react';

export interface CounterProps {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export default function Counter({
  to,
  decimals = 0,
  prefix = '',
  suffix = '',
  durationMs = 1400,
  className = '',
}: CounterProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(to);
      hasRun.current = true;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasRun.current) {
            hasRun.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / durationMs);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(to * eased);
              if (p < 1) requestAnimationFrame(tick);
              else setValue(to);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, durationMs]);

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={`counter ${className}`.trim()}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
