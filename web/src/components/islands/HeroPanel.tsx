/**
 * HeroPanel — Card stack visualization
 *
 * Inspired by Stripe Issuing / Lumen Light's "Issue cards in minutes" pattern:
 * three rotated cards (-8°, 0°, +8°) with gradient fills, slightly translated
 * vertically. On hover, the centre card lifts; the side cards fan out further.
 *
 * Adapted for LendAuto context: each card represents a quoting strategy
 * tier (fUSD, fUST, 高頻調整 strategy).
 */
import { useEffect, useRef, useState } from 'react';

interface CardData {
  tier: string;
  label: string;
  num: string;
  rate: string;
  cls: 'c1' | 'c2' | 'c3';
}

const CARDS: CardData[] = [
  { tier: 'fUSD',    label: 'TIER · BASE',     num: 'AUTO ···· ···· 4242', rate: '+ 8.42%', cls: 'c1' },
  { tier: 'fUSD',    label: 'TIER · PRO',      num: 'AUTO ···· ···· 9024', rate: '+12.18%', cls: 'c2' },
  { tier: 'fUST',    label: 'TIER · SPIKE',    num: 'AUTO ···· ···· 0042', rate: '+34.20%', cls: 'c3' },
];

export default function HeroPanel() {
  const [hovered, setHovered] = useState(false);
  const [liveRate, setLiveRate] = useState(8.42);
  const [liveCheck, setLiveCheck] = useState('剛剛');

  /* Subtle live-rate drift for the sub-card */
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      const delta = (Math.random() - 0.5) * 0.18;
      setLiveRate((r) => Math.max(2, Math.min(18, r + delta)));
      setLiveCheck('1 秒前');
      window.setTimeout(() => setLiveCheck('剛剛'), 800);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-panel-wrap">
      <div
        className={`hero-cardstack ${hovered ? 'is-hover' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {CARDS.map((c) => (
          <div key={c.cls} className={`hero-ccard hero-${c.cls}`}>
            <div className="hero-ccard-top">
              <span className="hero-ccard-mark" aria-hidden="true" />
              <span className="hero-ccard-tier">{c.tier}</span>
            </div>
            <div className="hero-ccard-bot">
              <div className="hero-ccard-lbl">{c.label}</div>
              <div className="hero-ccard-row">
                <span className="hero-ccard-num">{c.num}</span>
                <span className="hero-ccard-rate">{c.rate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="hero-live-card" aria-label="即時利率資訊">
        <div className="hero-live-row">
          <span><span className="hero-live-dot" aria-hidden="true" />fUSD 利率</span>
          <span className="hero-live-val">{liveRate.toFixed(2)}%</span>
        </div>
        <div className="hero-live-row">
          <span>機器人狀態</span>
          <span className="hero-live-val hero-live-ok">運行中</span>
        </div>
        <div className="hero-live-row">
          <span>最後檢查</span>
          <span className="hero-live-val">{liveCheck}</span>
        </div>
      </aside>
    </div>
  );
}
