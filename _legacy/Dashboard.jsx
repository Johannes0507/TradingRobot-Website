// Animated Dashboard preview — Stripe-style floating cards with live data
const { useState, useEffect, useRef } = React;

function useLiveFRR() {
  const [frr, setFrr] = useState(17.24);
  useEffect(() => {
    const id = setInterval(() => {
      setFrr(prev => {
        const delta = (Math.random() - 0.48) * 0.15;
        return Math.max(14.5, Math.min(21.2, prev + delta));
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);
  return frr;
}

function useCountUp(target, duration = 2400, start = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

// Sparkline SVG with animated draw-in
function Sparkline({ data, color = '#6366f1', width = 240, height = 60, fillOpacity = 0.12 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const fill = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={fillOpacity * 2}/>
          <stop offset="1" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg-${color.slice(1)})`} />
      <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="4" fill="#fff" stroke={color} strokeWidth="2"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="8" fill={color} opacity="0.2">
        <animate attributeName="r" values="4;10;4" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

// Order book ladder visualization
function OrderLadder() {
  const levels = [
    { rate: 21.8, amount: 500, type: 'spike', filled: false },
    { rate: 19.5, amount: 800, type: 'grid', filled: false },
    { rate: 18.2, amount: 1200, type: 'grid', filled: true },
    { rate: 17.4, amount: 1500, type: 'frr', filled: true },
    { rate: 16.8, amount: 1000, type: 'grid', filled: true },
  ];
  const colors = { spike: '#ec4899', grid: '#6366f1', frr: '#06b6d4' };
  const [hot, setHot] = useState(-1);
  useEffect(() => {
    const id = setInterval(() => {
      setHot(Math.floor(Math.random() * levels.length));
      setTimeout(() => setHot(-1), 600);
    }, 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {levels.map((l, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px',
          borderRadius: 8,
          background: hot === i ? `${colors[l.type]}14` : 'rgba(15,23,42,0.02)',
          border: `1px solid ${hot === i ? colors[l.type] + '40' : 'transparent'}`,
          transition: 'all 0.3s',
          fontSize: 12,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors[l.type], flexShrink: 0 }}/>
          <div className="mono" style={{ fontWeight: 600, color: '#0a0a0f', minWidth: 56 }}>{l.rate.toFixed(1)}%</div>
          <div style={{ flex: 1, height: 4, background: 'rgba(15,23,42,0.06)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(l.amount / 1500) * 100}%`,
              background: `linear-gradient(90deg, ${colors[l.type]}, ${colors[l.type]}aa)`,
              borderRadius: 999,
            }}/>
          </div>
          <div className="mono" style={{ fontSize: 11, color: '#6b7280', minWidth: 50, textAlign: 'right' }}>
            ${l.amount.toLocaleString()}
          </div>
          {l.filled ? (
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconCheck size={10} stroke={3}/>
            </div>
          ) : (
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px dashed #9ca3af', flexShrink: 0 }}/>
          )}
        </div>
      ))}
    </div>
  );
}

function DashboardPreview({ hover = false }) {
  const frr = useLiveFRR();
  const balance = useCountUp(24683.42, 2600);
  const earned = useCountUp(4127.88, 2800);

  // Historical sparkline data
  const sparkData = [12, 14, 13, 15, 17, 16, 18, 17, 19, 18, 20, 19, 22, 24, 23, 25];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 720,
      aspectRatio: '16 / 10',
      perspective: 2000,
    }}>
      {/* Main dashboard */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#fff',
        borderRadius: 20,
        border: '1px solid rgba(15, 23, 42, 0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 30px 80px -20px rgba(15, 23, 42, 0.25), 0 12px 30px -10px rgba(99, 102, 241, 0.15)',
        overflow: 'hidden',
        transform: hover ? 'rotateX(0deg) rotateY(0deg)' : 'rotateX(2deg) rotateY(-3deg)',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* App chrome */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid rgba(15, 23, 42, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(250, 250, 249, 0.6)',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }}/>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }}/>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }}/>
          </div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#9ca3af' }} className="mono">
            app.lendauto.tw / dashboard
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)' }}/>
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Live</span>
          </div>
        </div>

        {/* Content grid */}
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14, height: 'calc(100% - 45px)' }}>
          {/* Left: balance + chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              padding: 18,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0a0a0f 0%, #1c1c24 100%)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: -30, right: -30,
                width: 140, height: 140,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}/>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                總資產 · USD
              </div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>↑ +$127.40</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>今日</span>
              </div>
            </div>

            <div style={{
              flex: 1,
              padding: 14,
              borderRadius: 14,
              border: '1px solid rgba(15, 23, 42, 0.06)',
              background: '#fafaf9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  FRR 年化
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ec4899' }}>
                    <svg width="5" height="5"><animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/></svg>
                  </div>
                  <span className="mono" style={{ fontSize: 10, color: '#6b7280' }}>live</span>
                </div>
              </div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#0a0a0f', letterSpacing: '-0.02em' }}>
                {frr.toFixed(2)}<span style={{ fontSize: 14, color: '#6b7280' }}>%</span>
              </div>
              <div style={{ marginTop: 6, marginLeft: -4 }}>
                <Sparkline data={sparkData} color="#8b5cf6" width={240} height={48}/>
              </div>
            </div>
          </div>

          {/* Right: order ladder */}
          <div style={{
            padding: 14,
            borderRadius: 14,
            border: '1px solid rgba(15, 23, 42, 0.06)',
            background: '#fafaf9',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                階梯掛單 · Ladder
              </div>
              <div style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: 999, fontWeight: 600 }}>
                5 層
              </div>
            </div>
            <OrderLadder/>
            <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 8 }}>
                <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 600 }}>累計收益</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0f' }}>
                  +${earned.toFixed(2)}
                </div>
              </div>
              <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: 8 }}>
                <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 600 }}>運行天數</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0f' }}>
                  94 天
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating card 1: Spike catch notification */}
      <div style={{
        position: 'absolute',
        top: '8%',
        right: '-8%',
        background: '#fff',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 20px 40px -10px rgba(236, 72, 153, 0.25), 0 4px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(15,23,42,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        animation: 'floatY 6s ease-in-out infinite',
        zIndex: 2,
        minWidth: 220,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', flexShrink: 0,
        }}>
          <IconBolt size={18}/>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Spike 捕捉</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0f' }}>
            21.8% 掛單成交 ⚡
          </div>
        </div>
      </div>

      {/* Floating card 2: Earnings today */}
      <div style={{
        position: 'absolute',
        bottom: '-6%',
        left: '-6%',
        background: '#fff',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.25), 0 4px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(15,23,42,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        animation: 'floatY 7s ease-in-out infinite 1s',
        zIndex: 2,
        minWidth: 200,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', flexShrink: 0,
        }}>
          <IconSpark size={18}/>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>今日配息</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0f' }}>
            +$11.73 <span style={{ color: '#10b981' }}>→ 錢包</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { DashboardPreview, Sparkline, useLiveFRR, useCountUp });
