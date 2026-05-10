// Marketing page sections
const { useState: useS2, useEffect: useE2, useRef: useR2 } = React;

function useInView(options = {}) {
  const ref = useR2(null);
  const [seen, setSeen] = useS2(false);
  useE2(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.15, ...options });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen];
}

// ===================== NAV =====================
function Nav({ scrolled, productName }) {
  const [menuOpen, setMenuOpen] = useS2(false);
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 100,
      background: scrolled ? 'rgba(250, 250, 249, 0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'rgba(15,23,42,0.06)' : 'transparent'}`,
      transition: 'all 0.3s',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 68 }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <IconLogo size={30}/>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{productName}</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginLeft: 48 }}>
          {['產品', '原理', '定價', '安全', '資源'].map(t => (
            <a key={t} href={`#${t}`} style={{
              fontSize: 14, fontWeight: 500, color: '#1c1c24',
              textDecoration: 'none', opacity: 0.85,
              transition: 'opacity 0.2s',
            }} onMouseEnter={e => e.currentTarget.style.opacity = '1'}
               onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}>
              {t}
            </a>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="#" style={{ fontSize: 14, fontWeight: 500, color: '#1c1c24', textDecoration: 'none' }}>登入</a>
          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}>
            早鳥申請 <IconArrow size={14}/>
          </button>
        </div>
      </div>
    </nav>
  );
}

// ===================== HERO =====================
const HERO_HEADLINES = {
  'stock-metaphor': <>你的加密貨幣，<br/>也可以像<span className="grad-text">存股一樣</span>每天配息</>,
  'passive-income': <>放著就賺。<br/>每天<span className="grad-text">自動配息</span>入帳</>,
  'beat-fuly': <>比手動放貸，<br/><span className="grad-text">多賺 2 倍</span>以上的利息</>,
};
function Hero({ productName, onCtaClick, variant = 'stock-metaphor' }) {
  return (
    <section style={{ position: 'relative', paddingTop: 140, paddingBottom: 100, overflow: 'hidden' }}>
      {/* === Fluid Ribbon — nebula-swirl silk with depth & halo === */}
      <div className="fr-wrap">
        <FluidRibbon
          colors={['#A8B5FF', '#F9A8D4', '#FB7185', '#FB923C', '#F97316']}
          distort={0.22}      /* twist amount: how much colors rotate */
          bandSharp={0.05}    /* band edge sharpness */
          speed={0.018}       /* very slow — galactic rotation pace */
        />
      </div>
      {/* grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 75%)',
        pointerEvents: 'none',
      }}/>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Announcement pill */}
        <div className="reveal in" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 6px 6px 14px',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(15,23,42,0.06)',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 32,
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
          <span style={{ color: '#6b7280' }}>✨ 早鳥申請開放中</span>
          <span style={{ padding: '3px 10px', background: '#0a0a0f', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
            首月免費
          </span>
        </div>

        <h1 className="reveal in d1" style={{
          fontSize: 'clamp(40px, 6vw, 76px)',
          fontWeight: 800,
          letterSpacing: '-0.035em',
          lineHeight: 1.05,
          marginBottom: 24,
          maxWidth: 960,
        }}>
          {HERO_HEADLINES[variant] || HERO_HEADLINES['stock-metaphor']}
        </h1>

        <p className="reveal in d2" style={{
          fontSize: 'clamp(17px, 1.6vw, 21px)',
          color: '#4b5563',
          maxWidth: 620,
          marginBottom: 40,
          lineHeight: 1.55,
        }}>
          全自動放貸機器人，24 小時在 Bitfinex 上為你捕捉最高利率。
          <br/>不用懂技術、不用盯盤，<strong style={{ color: '#0a0a0f', fontWeight: 600 }}>台幣就能訂閱</strong>。
        </p>

        <div className="reveal in d3" style={{ display: 'flex', gap: 12, marginBottom: 56 }}>
          <button className="btn btn-primary" onClick={onCtaClick}>
            加入候補名單 <IconArrow size={16}/>
          </button>
          <button className="btn btn-ghost">
            <IconPlay size={14}/> 看 90 秒介紹
          </button>
        </div>

        {/* Stats strip */}
        <div className="reveal in d4" style={{
          display: 'flex', gap: 40, marginBottom: 80,
          flexWrap: 'wrap',
        }}>
          {[
            { v: 'FRR 動態', l: '跟隨官方利率' },
            { v: '5 層', l: '階梯式網格掛單' },
            { v: 'AES-256', l: 'API Key 加密' },
            { v: '24/7', l: '毫秒級執行' },
          ].map((s, i) => (
            <div key={i}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>{s.v}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Dashboard preview */}
        <div className="reveal in d5" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <DashboardPreview/>
        </div>
      </div>
    </section>
  );
}

// ===================== STEPS =====================
function Steps() {
  const [ref, seen] = useInView();
  const steps = [
    { icon: IconPlug, title: '連接 Bitfinex 帳號', desc: '透過 API Key 綁定，3 分鐘完成。權限只開放貸，不開提款。', tint: '#6366f1' },
    { icon: IconSliders, title: '選擇放貸策略', desc: '新手模板一鍵套用；進階者可自訂階梯層數與利率區間。', tint: '#8b5cf6' },
    { icon: IconCPU, title: '機器人自動執行', desc: '關掉電腦也能賺。利率變動時自動追單，市場波動時自動捕捉。', tint: '#ec4899' },
  ];
  return (
    <section id="產品" style={{ padding: '140px 0', position: 'relative' }} ref={ref}>
      <div className="container">
        <div style={{ maxWidth: 640, marginBottom: 64 }}>
          <div className={`eyebrow reveal ${seen ? 'in' : ''}`}>三步驟開始</div>
          <h2 className={`reveal ${seen ? 'in d1' : ''}`} style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20,
          }}>
            設定簡單到<br/>不像在操作自動化系統
          </h2>
          <p className={`reveal ${seen ? 'in d2' : ''}`} style={{ fontSize: 17, color: '#4b5563' }}>
            我們把設定流程拆成三步，每步不超過 2 分鐘。不需要讀任何部落客教學文。
          </p>
        </div>

        <div style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute',
            top: 36, left: '16%', right: '16%',
            height: 2,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
            opacity: seen ? 1 : 0,
            transition: 'opacity 1.2s 0.4s',
            zIndex: 0,
          }}/>
          {steps.map((s, i) => (
            <div key={i} className={`reveal ${seen ? `in d${i+1}` : ''}`} style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: '#fff',
                border: `1px solid rgba(15,23,42,0.06)`,
                boxShadow: `0 8px 30px -8px ${s.tint}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.tint, marginBottom: 20,
                position: 'relative',
              }}>
                <s.icon size={30} stroke={1.8}/>
                <div style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 26, height: 26, borderRadius: '50%',
                  background: s.tint, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }} className="mono">
                  {i + 1}
                </div>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================== WHY HIGHER =====================
function WhyHigher() {
  const [ref, seen] = useInView();
  const features = [
    {
      icon: IconChart, title: '智能追蹤市場利率',
      desc: '自動跟隨 Bitfinex Flash Return Rate 浮動，利率變高時立刻調整，不錯過任何成交機會。',
      tech: 'FRR Delta Var · FRR Delta Fix',
      tint: '#6366f1',
    },
    {
      icon: IconBolt, title: '預埋高利率，爆發時自動捕捉',
      desc: '市場劇烈波動、資金短缺時，預設的高利率訂單會自動成交，賺到一般人搶不到的暴利。',
      tech: 'Spike Catching · 階梯式網格',
      tint: '#ec4899',
    },
    {
      icon: IconCPU, title: '毫秒級執行，搶在別人前面',
      desc: 'Go 語言寫的交易引擎，24 小時不停偵測、不停調倉。你在睡覺時它也在工作。',
      tech: 'Go 1.26 · WebSocket 即時連線',
      tint: '#8b5cf6',
    },
  ];
  return (
    <section id="原理" style={{ padding: '140px 0', background: '#fff', position: 'relative' }} ref={ref}>
      {/* subtle mesh */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 400,
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div className="container" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 80px' }}>
          <div className={`eyebrow reveal ${seen ? 'in' : ''}`} style={{ justifyContent: 'center' }}>為什麼報酬更高</div>
          <h2 className={`reveal ${seen ? 'in d1' : ''}`} style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20,
          }}>
            手動掛單賺 <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>8%</span>
            ，<br/>交給機器人<span className="grad-text">賺 15-20%</span>
          </h2>
          <p className={`reveal ${seen ? 'in d2' : ''}`} style={{ fontSize: 17, color: '#4b5563' }}>
            三個技術核心，把手動放貸做不到的事做到極致。
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} className={`reveal ${seen ? `in d${i+1}` : ''}`} style={{
              padding: 32,
              borderRadius: 20,
              background: '#fafaf9',
              border: '1px solid rgba(15,23,42,0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 20px 40px -12px ${f.tint}25`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}>
              <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 160, height: 160, borderRadius: '50%',
                background: `radial-gradient(circle, ${f.tint}20 0%, transparent 70%)`,
              }}/>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `linear-gradient(135deg, ${f.tint}, ${f.tint}cc)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', marginBottom: 20,
                boxShadow: `0 8px 20px -6px ${f.tint}60`,
                position: 'relative',
              }}>
                <f.icon size={24}/>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.015em', position: 'relative' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14.5, color: '#4b5563', lineHeight: 1.65, marginBottom: 16, position: 'relative' }}>
                {f.desc}
              </p>
              <div className="mono" style={{
                fontSize: 11, color: f.tint, fontWeight: 600,
                padding: '6px 10px', background: `${f.tint}10`,
                borderRadius: 6, display: 'inline-block',
                position: 'relative',
              }}>
                {f.tech}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================== SECURITY =====================
function Security() {
  const [ref, seen] = useInView();
  const pillars = [
    { icon: IconKey, title: 'API 權限只開放貸', desc: '你在 Bitfinex 生成 Key 時，只勾選「Funding」權限；我們碰不到你的提款。', code: 'scope: funding_only' },
    { icon: IconLock, title: 'AES-256-GCM 加密儲存', desc: '你的 API Key 在資料庫是密文，連我們工程師都看不到明文。', code: 'AES-256 · GCM · Envelope' },
    { icon: IconWallet, title: '資金始終在你的帳號', desc: 'LendAuto 只是一個「幫你掛單」的工具。錢永遠在 Bitfinex，我們不經手。', code: 'custody: self' },
  ];
  return (
    <section id="安全" style={{ padding: '140px 0', position: 'relative' }} ref={ref}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 120 }}>
            <div className={`eyebrow reveal ${seen ? 'in' : ''}`}>安全機制</div>
            <h2 className={`reveal ${seen ? 'in d1' : ''}`} style={{
              fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24,
            }}>
              你的錢，<br/>我們從來<br/>沒碰過。
            </h2>
            <p className={`reveal ${seen ? 'in d2' : ''}`} style={{ fontSize: 17, color: '#4b5563', marginBottom: 28 }}>
              把自動化交給我們，把保管留給你自己。
              三層防護，從 API 權限、金鑰加密到資金託管，全部透明。
            </p>
            <div className={`reveal ${seen ? 'in d3' : ''}`} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              fontSize: 13, fontWeight: 500, color: '#047857',
              width: 'fit-content',
            }}>
              <IconShield size={18}/> 非託管式（Non-custodial）架構
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pillars.map((p, i) => (
              <div key={i} className={`reveal ${seen ? `in d${i+1}` : ''}`} style={{
                padding: 28,
                borderRadius: 18,
                background: '#fff',
                border: '1px solid rgba(15,23,42,0.06)',
                display: 'flex',
                gap: 20,
                alignItems: 'flex-start',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, #0a0a0f, #1c1c24)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <p.icon size={22}/>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.015em' }}>{p.title}</h3>
                  <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.6, marginBottom: 12 }}>{p.desc}</p>
                  <div className="mono" style={{
                    fontSize: 12, padding: '6px 10px',
                    background: 'rgba(15,23,42,0.04)',
                    borderRadius: 6,
                    display: 'inline-block',
                    color: '#4b5563',
                  }}>
                    {p.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===================== PRICING =====================
function Pricing() {
  const [ref, seen] = useInView();
  const plans = [
    {
      name: 'Starter', price: 'Free', sub: '永久免費',
      cap: '$5,000', strategies: '2 個',
      features: ['基本分析', '手動啟動', '單一策略範本', 'Email 支援'],
      cta: '免費開始',
    },
    {
      name: 'Pro', price: 'NT$899', sub: '/ 月',
      cap: '$100,000', strategies: '10 個',
      features: ['進階分析', '自動複利', '所有策略範本', 'Spike Catching', '優先支援'],
      cta: '訂閱 Pro',
      highlight: true,
    },
    {
      name: 'Elite', price: 'NT$2,999', sub: '/ 月',
      cap: '$1,000,000', strategies: '50 個',
      features: ['專屬伺服器', '子帳號 API', '自訂策略引擎', '一對一顧問', '24/7 電話支援'],
      cta: '聯絡我們',
    },
  ];
  return (
    <section id="定價" style={{ padding: '140px 0', background: '#fff', position: 'relative' }} ref={ref}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 60px' }}>
          <div className={`eyebrow reveal ${seen ? 'in' : ''}`} style={{ justifyContent: 'center' }}>簡單透明定價</div>
          <h2 className={`reveal ${seen ? 'in d1' : ''}`} style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20,
          }}>
            月訂閱，<span className="grad-text">台幣付款</span>
          </h2>
          <p className={`reveal ${seen ? 'in d2' : ''}`} style={{ fontSize: 17, color: '#4b5563' }}>
            不用先換成 USDT、不用懂鏈上轉帳。信用卡或超商代碼，跟訂 Netflix 一樣簡單。
          </p>
        </div>

        <div className={`reveal ${seen ? 'in d3' : ''}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 999, fontSize: 13, fontWeight: 600, color: '#047857',
          margin: '0 auto 40px', display: 'flex', width: 'fit-content', marginLeft: 'auto', marginRight: 'auto',
        }}>
          <IconTW size={14}/> 支援信用卡 · Line Pay · 超商代碼
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {plans.map((p, i) => (
            <div key={i} className={`reveal ${seen ? `in d${i+1}` : ''}`} style={{
              padding: 32,
              borderRadius: 22,
              background: p.highlight ? 'linear-gradient(180deg, #0a0a0f 0%, #1c1c24 100%)' : '#fafaf9',
              color: p.highlight ? '#fff' : '#0a0a0f',
              border: p.highlight ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(15,23,42,0.06)',
              position: 'relative',
              boxShadow: p.highlight ? '0 30px 60px -20px rgba(99, 102, 241, 0.4)' : 'none',
              transform: p.highlight ? 'scale(1.02)' : 'none',
            }}>
              {p.highlight && (
                <>
                  <div style={{
                    position: 'absolute', inset: 0,
                    borderRadius: 22,
                    background: 'radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.25), transparent 60%)',
                    pointerEvents: 'none',
                  }}/>
                  <div style={{
                    position: 'absolute', top: -12, right: 24,
                    padding: '4px 12px',
                    background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                    borderRadius: 999, letterSpacing: '0.04em',
                  }}>
                    最多人選
                  </div>
                </>
              )}
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.7, marginBottom: 8 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em' }}>{p.price}</span>
                  <span style={{ fontSize: 14, opacity: 0.7 }}>{p.sub}</span>
                </div>
                <div style={{
                  height: 1, margin: '24px 0',
                  background: p.highlight ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, opacity: 0.7 }}>資金上限</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{p.cap}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                  <span style={{ fontSize: 13, opacity: 0.7 }}>策略數</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{p.strategies}</span>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 14, padding: '7px 0',
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: p.highlight ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.12)',
                        color: p.highlight ? '#c4b5fd' : '#6366f1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <IconCheck size={11} stroke={3}/>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="btn" style={{
                  width: '100%', justifyContent: 'center',
                  background: p.highlight ? '#fff' : '#0a0a0f',
                  color: p.highlight ? '#0a0a0f' : '#fff',
                }}>
                  {p.cta} <IconArrow size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================== CTA + Footer =====================
function CtaFooter({ productName }) {
  const [ref, seen] = useInView();
  const [email, setEmail] = useS2('');
  const [submitted, setSubmitted] = useS2(false);
  const submit = (e) => { e.preventDefault(); if (email.includes('@')) setSubmitted(true); };
  return (
    <>
      <section style={{ padding: '100px 0 120px', position: 'relative', overflow: 'hidden' }} ref={ref}>
        <div className="container">
          <div className={`reveal ${seen ? 'in' : ''}`} style={{
            position: 'relative',
            padding: '72px 56px',
            borderRadius: 32,
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1c1c24 50%, #312e81 100%)',
            color: '#fff',
            overflow: 'hidden',
            textAlign: 'center',
          }}>
            {/* animated glow */}
            <div style={{
              position: 'absolute', top: '-30%', left: '20%',
              width: 600, height: 600, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5), transparent 65%)',
              filter: 'blur(60px)',
              animation: 'floatY 10s ease-in-out infinite',
            }}/>
            <div style={{
              position: 'absolute', bottom: '-40%', right: '10%',
              width: 500, height: 500, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4), transparent 65%)',
              filter: 'blur(60px)',
              animation: 'floatY 12s ease-in-out infinite 2s',
            }}/>
            <div style={{ position: 'relative' }}>
              <h2 style={{
                fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700,
                letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20,
              }}>
                準備好讓你的 USD<br/>開始工作了嗎？
              </h2>
              <p style={{ fontSize: 17, opacity: 0.75, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
                留下 Email 加入候補。正式上線時優先通知，並享<strong style={{ color: '#fff' }}>首月免費</strong>。
              </p>

              {!submitted ? (
                <form onSubmit={submit} style={{
                  display: 'flex', gap: 8,
                  maxWidth: 480, margin: '0 auto',
                  padding: 6,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.12)',
                }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{
                      flex: 1, padding: '14px 20px',
                      background: 'transparent',
                      border: 'none', outline: 'none',
                      color: '#fff', fontSize: 15,
                      fontFamily: 'inherit',
                    }}
                  />
                  <button type="submit" className="btn" style={{
                    background: '#fff', color: '#0a0a0f', fontWeight: 600,
                  }}>
                    加入候補 <IconArrow size={14}/>
                  </button>
                </form>
              ) : (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  padding: '14px 24px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 999,
                  fontSize: 15, fontWeight: 600,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IconCheck size={14} stroke={3}/>
                  </div>
                  已收到 {email}，開放時會第一個通知你 ✨
                </div>
              )}

              <div style={{
                marginTop: 32, display: 'flex', gap: 28,
                justifyContent: 'center', fontSize: 13, opacity: 0.6,
              }}>
                <span>✓ 零承諾</span>
                <span>✓ 隨時退訂</span>
                <span>✓ 不寄垃圾信</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '60px 0 48px', borderTop: '1px solid rgba(15,23,42,0.06)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <IconLogo size={28}/>
                <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>{productName}</span>
              </div>
              <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 320, lineHeight: 1.6 }}>
                為台灣打造的 Bitfinex 自動放貸機器人。讓你的加密貨幣，像存股一樣配息。
              </p>
            </div>
            {[
              { title: '產品', items: ['功能總覽', '定價方案', '安全機制', '更新日誌'] },
              { title: '資源', items: ['新手教學', 'FAQ', '部落格', 'API 文件'] },
              { title: '公司', items: ['關於我們', '聯絡我們', '隱私政策', '服務條款'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {col.title}
                </div>
                <ul style={{ listStyle: 'none' }}>
                  {col.items.map((it, j) => (
                    <li key={j} style={{ padding: '5px 0' }}>
                      <a href="#" style={{ fontSize: 14, color: '#4b5563', textDecoration: 'none' }}>{it}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 28, borderTop: '1px solid rgba(15,23,42,0.06)',
            fontSize: 13, color: '#9ca3af',
          }}>
            <div>© 2026 {productName}. Made in Taiwan 🇹🇼</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Twitter</a>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Discord</a>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

Object.assign(window, { Nav, Hero, Steps, WhyHigher, Security, Pricing, CtaFooter, useInView });
