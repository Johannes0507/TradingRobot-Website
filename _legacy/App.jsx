const { useState: useSA, useEffect: useEA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "productName": "LendAuto",
  "accent": "indigo",
  "heroVariant": "stock-metaphor"
}/*EDITMODE-END*/;

const ACCENTS = {
  indigo:  { a1: '#6366f1', a2: '#8b5cf6', a3: '#ec4899' },
  cyan:    { a1: '#0ea5e9', a2: '#06b6d4', a3: '#14b8a6' },
  sunset:  { a1: '#f59e0b', a2: '#ec4899', a3: '#8b5cf6' },
  emerald: { a1: '#10b981', a2: '#06b6d4', a3: '#6366f1' },
};

const HERO_VARIANTS = {
  'stock-metaphor': { h1: ['你的加密貨幣，', '也可以像', '存股一樣', '每天配息'] },
  'passive-income': { h1: ['放著就賺，', '每天自動', '配息入帳', ''] },
  'beat-fuly':      { h1: ['比手動放貸', '多賺', '2 倍以上', '的利息'] },
};

function App() {
  const [tweaks, setTweaks] = useSA(TWEAK_DEFAULTS);
  const [editMode, setEditMode] = useSA(false);
  const [scrolled, setScrolled] = useSA(false);

  // Apply accent CSS vars
  useEA(() => {
    const a = ACCENTS[tweaks.accent] || ACCENTS.indigo;
    document.documentElement.style.setProperty('--a1', a.a1);
    document.documentElement.style.setProperty('--a2', a.a2);
    document.documentElement.style.setProperty('--a3', a.a3);
  }, [tweaks.accent]);

  // Nav scroll state only — sections handle their own reveal via useInView
  useEA(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Edit mode protocol
  useEA(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setEditMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const updateTweak = (key, val) => {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
  };

  const scrollToCta = () => {
    document.querySelector('footer')?.previousElementSibling?.scrollIntoView
      && document.querySelectorAll('section').forEach(s => {});
    window.scrollTo({ top: document.body.scrollHeight - 900, behavior: 'smooth' });
  };

  return (
    <>
      <Nav scrolled={scrolled} productName={tweaks.productName}/>
      <Hero productName={tweaks.productName} onCtaClick={scrollToCta} variant={tweaks.heroVariant}/>
      <Steps/>
      <WhyHigher/>
      <Security/>
      <Pricing/>
      <CtaFooter productName={tweaks.productName}/>

      {editMode && (
        <div className="tweaks on">
          <h4>Tweaks</h4>

          <label>產品名稱</label>
          <div className="tweak-row">
            {['LendAuto', 'AutoYield', 'YieldPilot', '幣息'].map(n => (
              <div key={n}
                className={`tweak-chip ${tweaks.productName === n ? 'on' : ''}`}
                onClick={() => updateTweak('productName', n)}>
                {n}
              </div>
            ))}
          </div>

          <label>主色調</label>
          <div className="tweak-row">
            {Object.entries(ACCENTS).map(([k, v]) => (
              <div key={k}
                className={`tweak-swatch ${tweaks.accent === k ? 'on' : ''}`}
                style={{ background: `linear-gradient(135deg, ${v.a1}, ${v.a2}, ${v.a3})` }}
                onClick={() => updateTweak('accent', k)}
                title={k}/>
            ))}
          </div>

          <label>Hero 標語版本</label>
          <div className="tweak-row">
            {[
              ['stock-metaphor', '存股橋梁'],
              ['passive-income', '被動收入'],
              ['beat-fuly', '對比手動'],
            ].map(([k, lbl]) => (
              <div key={k}
                className={`tweak-chip ${tweaks.heroVariant === k ? 'on' : ''}`}
                onClick={() => updateTweak('heroVariant', k)}>
                {lbl}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
