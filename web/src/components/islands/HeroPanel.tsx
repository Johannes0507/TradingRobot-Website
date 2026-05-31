/**
 * HeroPanel — Single holographic card with 3D tilt + cursor glare
 *
 * Direct port of v2 Lumen Stripe Study's "Issue cards in minutes" pattern,
 * re-themed for Bitfinex funding context. The premium feel comes from:
 *   1. Single big card (not a stack) — confident composition
 *   2. Mouse-driven 3D rotation up to ~16-18 deg on each axis
 *   3. A 320px specular highlight that follows the cursor, blended with
 *      mix-blend-mode: overlay so it picks up the holographic gradient
 *   4. A warm cream→peach→pink→lavender card gradient — distinct from
 *      the cool page palette so the card pops as the focal point
 *   5. Live rate animation so the hero isn't a static screenshot
 */
import { useEffect, useRef, useState } from 'react';

export default function HeroPanel() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rate, setRate] = useState(8.42);

  /* Live rate drift */
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      const delta = (Math.random() - 0.5) * 0.16;
      setRate((r) => {
        const next = r + delta;
        return Math.max(6.5, Math.min(11.5, next));
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  /* 3D tilt + cursor glare. */
  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -14;
      const ry = (px - 0.5) * 16;
      card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      const cr = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - cr.left}px`);
      card.style.setProperty('--my', `${e.clientY - cr.top}px`);
    };
    const onLeave = () => {
      card.style.transform = '';
    };
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
    return () => {
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="hero-stage" ref={stageRef}>
      {/* Background shapes */}
      <div className="hero-stage-bg" aria-hidden="true">
        <i className="b1" />
      </div>

      {/* Holographic card */}
      <div className="hero-card" ref={cardRef}>
        <div className="hero-card-face">
          <div className="hero-card-top">
            <span className="hero-card-brand">LendAuto</span>
            <span className="hero-card-tag">FUNDING · USD</span>
          </div>

          <div className="hero-card-chip" aria-hidden="true" />

          <div>
            <div className="hero-card-rate">
              <span className="hero-card-rate-num">{rate.toFixed(2)}</span>
              <span className="hero-card-rate-unit">% APR</span>
            </div>
            <div className="hero-card-num">BFX ···· ···· 9024</div>
            <div className="hero-card-foot">
              <div className="hero-card-foot-col">
                <span className="hero-card-tag">BOT</span>
                <span className="hero-card-foot-val">AUTO · QUOTE</span>
              </div>
              <div className="hero-card-foot-col">
                <span className="hero-card-tag">REFRESH</span>
                <span className="hero-card-foot-val">30 s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating live ticker */}
      <aside className="hero-live-card" aria-label="即時報價狀態">
        <div className="hero-live-row">
          <span>
            <span className="hero-live-dot" aria-hidden="true" />
            機器人狀態
          </span>
          <span className="hero-live-val hero-live-ok">運行中</span>
        </div>
        <div className="hero-live-row">
          <span>下一次評估</span>
          <span className="hero-live-val">12 s</span>
        </div>
        <div className="hero-live-row">
          <span>已成交</span>
          <span className="hero-live-val">142 筆</span>
        </div>
      </aside>
    </div>
  );
}
