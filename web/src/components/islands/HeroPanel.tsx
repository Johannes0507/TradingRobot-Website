/**
 * HeroPanel — Right-side visual for the hero
 *
 * Composition (inspired by Lumen/Stripe hero):
 *   1. Code card — shows the LendAuto bot's funding quote logic in pseudo-code
 *      auto-rotating language tabs (TypeScript / Python / Go)
 *   2. Floating sub-card — live Bitfinex fUSD rate + bot status (overlaps)
 *
 * All animations respect prefers-reduced-motion.
 */
import { useEffect, useRef, useState } from 'react';

type Lang = 'ts' | 'py' | 'go';

const SAMPLES: Record<Lang, { label: string; lines: Array<Array<[string, string]>> }> = {
  ts: {
    label: 'lendauto.ts',
    lines: [
      [['// 每 30 秒重評估市場利率', 'com']],
      [['const', 'key'], [' rate = ', ''], ['await', 'key'], [' bitfinex.', ''], ['funding', 'prop'], ['.', ''], ['quote', 'fn'], ['({', '']],
      [['  ', ''], ['symbol', 'prop'], [': ', ''], ["'fUSD'", 'str'], [',', '']],
      [['  ', ''], ['amount', 'prop'], [': ', ''], ['portfolio.tier(user)', 'fn'], [',', '']],
      [['  ', ''], ['period', 'prop'], [': ', ''], ['2', 'num'], [' ', ''], ['// days', 'com']],
      [['});', '']],
      [['', '']],
      [['if', 'key'], [' (rate.', ''], ['apr', 'prop'], [' > ', ''], ['threshold', 'prop'], [') {', '']],
      [['  ', ''], ['await', 'key'], [' bitfinex.funding.', ''], ['submit', 'fn'], ['(rate);', '']],
      [['}', '']],
    ],
  },
  py: {
    label: 'lendauto.py',
    lines: [
      [['# 每 30 秒重評估市場利率', 'com']],
      [['rate = bitfinex.funding.', ''], ['quote', 'fn'], ['(', '']],
      [['    ', ''], ['symbol', 'prop'], ['=', ''], ["'fUSD'", 'str'], [',', '']],
      [['    ', ''], ['amount', 'prop'], ['=portfolio.', ''], ['tier', 'fn'], ['(user),', '']],
      [['    ', ''], ['period', 'prop'], ['=', ''], ['2', 'num'], [',  ', ''], ['# days', 'com']],
      [[')', '']],
      [['', '']],
      [['if', 'key'], [' rate.apr > threshold:', '']],
      [['    bitfinex.funding.', ''], ['submit', 'fn'], ['(rate)', '']],
    ],
  },
  go: {
    label: 'lendauto.go',
    lines: [
      [['// 每 30 秒重評估市場利率', 'com']],
      [['rate, err := bf.Funding.', ''], ['Quote', 'fn'], ['(&bf.Q{', '']],
      [['  ', ''], ['Symbol', 'prop'], [':  ', ''], ['"fUSD"', 'str'], [',', '']],
      [['  ', ''], ['Amount', 'prop'], [':  portfolio.', ''], ['Tier', 'fn'], ['(user),', '']],
      [['  ', ''], ['Period', 'prop'], [':  ', ''], ['2', 'num'], [',  ', ''], ['// days', 'com']],
      [['})', '']],
      [['', '']],
      [['if', 'key'], [' rate.APR > threshold {', '']],
      [['  bf.Funding.', ''], ['Submit', 'fn'], ['(rate)', '']],
      [['}', '']],
    ],
  },
};

function escape(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

export default function HeroPanel() {
  const [lang, setLang] = useState<Lang>('ts');
  const codeRef = useRef<HTMLDivElement>(null);
  const [liveRate, setLiveRate] = useState(8.42);
  const [liveCheck, setLiveCheck] = useState('剛剛');

  /* Animate code lines in on language change */
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const body = codeRef.current;
    if (!body) return;
    const lines = body.querySelectorAll('.code-line');
    if (reduce) {
      lines.forEach((l) => l.classList.add('in'));
      return;
    }
    lines.forEach((l) => l.classList.remove('in'));
    const timers: number[] = [];
    lines.forEach((l, i) => {
      const t = window.setTimeout(() => l.classList.add('in'), i * 60 + 80);
      timers.push(t);
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, [lang]);

  /* Auto-rotate language every 9 s */
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const order: Lang[] = ['ts', 'py', 'go'];
    const id = window.setInterval(() => {
      setLang((cur) => order[(order.indexOf(cur) + 1) % order.length]);
    }, 9000);
    return () => clearInterval(id);
  }, []);

  /* Subtle live-rate drift for the sub-card (cosmetic; mock data) */
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

  const sample = SAMPLES[lang];

  return (
    <div className="hero-panel-wrap">
      <div className="hero-code-card">
        <div className="hero-code-head">
          <div className="hero-code-dots"><i /><i /><i /></div>
          <div className="hero-code-tabs">
            {(['ts', 'py', 'go'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                className={`hero-code-tab ${l === lang ? 'is-active' : ''}`}
                onClick={() => setLang(l)}
                aria-label={`切換到 ${SAMPLES[l].label}`}
              >
                {SAMPLES[l].label}
              </button>
            ))}
          </div>
          <div style={{ width: 48 }} />
        </div>
        <div className="hero-code-body" ref={codeRef} aria-live="polite">
          {sample.lines.map((row, i) => (
            <span key={`${lang}-${i}`} className="code-line">
              {row.map(([txt, cls], j) => (
                <span key={j} className={cls ? `tok-${cls}` : undefined}
                  dangerouslySetInnerHTML={{ __html: escape(txt) }}
                />
              ))}
            </span>
          ))}
        </div>
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
