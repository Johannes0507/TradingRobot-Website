/**
 * StickyScrollStage — 3D card-swap stage driven by left-column scroll position.
 *
 * Visual signature (inspired by reactbits.dev CardSwap):
 *  - Cards stacked diagonally (offset x/y/z) with a subtle skewY tilt
 *  - When scroll changes active step, the active card promotes to the front
 *    while previous cards drop down + cycle to the back, using GSAP elastic
 *    easing for that "organic bounce" feel.
 *  - Unlike pure auto-cycle, swap is triggered by scroll — preserves the
 *    left-text → right-visual narrative pairing.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface StickyScrollStageProps {
  stepSelector?: string;
  cardSelector?: string;
  /** Horizontal offset per stack depth (px) */
  cardDistance?: number;
  /** Vertical lift per stack depth (px) */
  verticalDistance?: number;
  /** Tilt of every card (deg) */
  skewAmount?: number;
  /** GSAP easing — 'elastic' for bouncy, 'smooth' for restrained */
  easing?: 'elastic' | 'smooth';
}

type Slot = { x: number; y: number; z: number; zIndex: number };

const makeSlot = (depth: number, total: number, distX: number, distY: number): Slot => ({
  x: depth * distX,
  y: -depth * distY,
  z: -depth * distX * 1.5,
  zIndex: total - depth,
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });

export default function StickyScrollStage({
  stepSelector = '.ss-step',
  cardSelector = '.swap-card',
  cardDistance = 52,
  verticalDistance = 56,
  skewAmount = 5,
  easing = 'elastic',
}: StickyScrollStageProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const steps = Array.from(document.querySelectorAll<HTMLElement>(stepSelector));
    const cards = Array.from(document.querySelectorAll<HTMLElement>(cardSelector));
    if (steps.length === 0 || cards.length === 0) return;

    const total = cards.length;

    /* Order tracks which card index sits at each depth slot (0 = front). */
    const order = Array.from({ length: total }, (_, i) => i);

    /* Place all cards at their initial slots immediately, no animation. */
    cards.forEach((el, depth) => placeNow(el, makeSlot(depth, total, cardDistance, verticalDistance), skewAmount));

    const config =
      easing === 'elastic'
        ? { ease: 'elastic.out(0.6, 0.9)', durDrop: 1.4, durMove: 1.4, durReturn: 1.4, promoteOverlap: 0.85, returnDelay: 0.05 }
        : { ease: 'power2.inOut', durDrop: 0.55, durMove: 0.55, durReturn: 0.55, promoteOverlap: 0.45, returnDelay: 0.15 };

    /* Cycle the front of the stack: front card drops down, others promote forward,
       the dropped card cycles to the back slot.  Animates `times` swaps in sequence
       so a 2-step jump from step 0 → step 2 still feels natural. */
    const cycleForward = (times: number) => {
      for (let n = 0; n < times; n++) {
        const front = order.shift()!;
        const elFront = cards[front];

        const tl = gsap.timeline();
        tl.to(elFront, { y: '+=500', duration: config.durDrop, ease: config.ease });
        tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);

        order.forEach((cardIdx, newDepth) => {
          const el = cards[cardIdx];
          const slot = makeSlot(newDepth, total, cardDistance, verticalDistance);
          tl.set(el, { zIndex: slot.zIndex }, 'promote');
          tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, `promote+=${newDepth * 0.12}`);
        });

        const backSlot = makeSlot(total - 1, total, cardDistance, verticalDistance);
        tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
        tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, 'return');
        tl.to(elFront, { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease }, 'return');

        order.push(front);
      }
    };

    /* Bring a specific card index to the front by cycling forward until it lands. */
    let activeCardIdx = order[0];
    const bringToFront = (targetIdx: number) => {
      if (targetIdx === activeCardIdx) return;
      const currentPos = order.indexOf(targetIdx);
      if (currentPos < 0) return;
      cycleForward(currentPos);
      activeCardIdx = targetIdx;
    };

    /* IO: detect which step is at viewport centre, swap to its matching card. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number((e.target as HTMLElement).dataset.frame);
          if (Number.isNaN(idx)) continue;
          bringToFront(idx);
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    steps.forEach((s) => io.observe(s));

    return () => io.disconnect();
  }, [stepSelector, cardSelector, cardDistance, verticalDistance, skewAmount, easing]);

  return null;
}
