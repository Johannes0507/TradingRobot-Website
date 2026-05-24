/**
 * StickyScrollStage — right-side sticky visual frames that cross-fade
 * based on which left-side step is currently centred in the viewport.
 *
 * Reliability fix: instead of intersectionRatio > 0.4 (fragile when steps
 * are taller than viewport), we shrink the IO root to a 1px horizontal
 * line at viewport centre via rootMargin '-50% 0px -50% 0px'. Whichever
 * step crosses that line wins — deterministic, smooth, and frame-stable.
 *
 * The content is rendered via Astro markup; this island only orchestrates
 * the `.is-active` class on `.ss-frame` elements.
 */
import { useEffect, useRef } from 'react';

export interface StickyScrollStageProps {
  stepSelector?: string;
  frameSelector?: string;
}

export default function StickyScrollStage({
  stepSelector = '.ss-step',
  frameSelector = '.ss-frame',
}: StickyScrollStageProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const steps = Array.from(
      document.querySelectorAll<HTMLElement>(stepSelector)
    );
    const frames = Array.from(
      document.querySelectorAll<HTMLElement>(frameSelector)
    );

    if (steps.length === 0 || frames.length === 0) return;

    let activeIdx = -1;
    const setActive = (idx: number) => {
      if (idx === activeIdx) return;
      activeIdx = idx;
      frames.forEach((f, i) => f.classList.toggle('is-active', i === idx));
    };

    /* Show first frame on initial load */
    setActive(0);

    /* rootMargin shrinks the root to a 1px horizontal line at viewport
       centre — whichever step is crossing that line is "active". */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number((e.target as HTMLElement).dataset.frame);
          if (Number.isNaN(idx)) continue;
          setActive(idx);
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    steps.forEach((s) => io.observe(s));

    return () => io.disconnect();
  }, [stepSelector, frameSelector]);

  return null;
}
