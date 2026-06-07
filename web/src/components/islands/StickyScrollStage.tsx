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

    /* Scrolling DOWN (next step): front card drops away, the rest promote one slot
       forward, the dropped card returns to the back. */
    const cycleForward = (): gsap.core.Timeline => {
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
      return tl;
    };

    /* Scrolling UP (previous step): reverse of cycleForward — the back card rises
       to the front, the rest demote one slot back. */
    const cycleBackward = (): gsap.core.Timeline => {
      const back = order.pop()!;
      const elBack = cards[back];

      const tl = gsap.timeline();
      order.forEach((cardIdx, oldDepth) => {
        const el = cards[cardIdx];
        const slot = makeSlot(oldDepth + 1, total, cardDistance, verticalDistance);
        tl.set(el, { zIndex: slot.zIndex }, 0);
        tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, 0);
      });

      const frontSlot = makeSlot(0, total, cardDistance, verticalDistance);
      tl.set(elBack, { zIndex: total + 1 }, 0);
      tl.to(elBack, { x: frontSlot.x, y: frontSlot.y, z: frontSlot.z, duration: config.durMove, ease: config.ease }, 0);

      order.unshift(back);
      return tl;
    };

    /* Sequential queue: one swap animates at a time, chaining toward the latest
       target step.  Keeps the "flowing" cascade when scrolling through several
       steps, while never running two drops at once (which is what made a card
       briefly fly off-stage / disappear). */
    let activeStep = order[0];   // step (= card) index currently at the front
    let targetStep = activeStep; // latest requested step
    let running = false;

    const runQueue = () => {
      if (activeStep === targetStep) {
        running = false;
        return;
      }
      running = true;
      const dir = targetStep > activeStep ? 1 : -1;
      const tl = dir === 1 ? cycleForward() : cycleBackward();
      activeStep += dir;
      tl.eventCallback('onComplete', runQueue); // chain to the next step
    };

    const bringToFront = (targetIdx: number) => {
      targetStep = targetIdx;
      if (!running) runQueue();
    };

    /* Mark the first step active on load (before any scroll). */
    steps.forEach((s, j) => s.classList.toggle('is-active', j === 0));

    /* IO: detect which step is at viewport centre, swap to its matching card
       and mark that step active — couples the left text to the front card. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number((e.target as HTMLElement).dataset.frame);
          if (Number.isNaN(idx)) continue;
          bringToFront(idx);
          steps.forEach((s, j) => s.classList.toggle('is-active', j === idx));
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    steps.forEach((s) => io.observe(s));

    return () => io.disconnect();
  }, [stepSelector, cardSelector, cardDistance, verticalDistance, skewAmount, easing]);

  // Return an empty fragment (not null): @astrojs/react's SSR component-detection
  // re-probes null-returning components outside React's renderer, which trips a
  // harmless-but-noisy "Invalid hook call" warning on every server render.
  return <></>;
}
