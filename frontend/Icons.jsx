// Line icons — minimal, stripe-style
const Icon = ({ d, size = 20, stroke = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

const IconArrow = (p) => <Icon {...p} d={<><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>} />;
const IconBolt = (p) => <Icon {...p} d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />;
const IconLock = (p) => <Icon {...p} d={<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></>} />;
const IconShield = (p) => <Icon {...p} d={<><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></>} />;
const IconKey = (p) => <Icon {...p} d={<><circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2M15 7l3 3M19 5l2 2"/></>} />;
const IconWallet = (p) => <Icon {...p} d={<><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="15" r="1.2" fill="currentColor"/></>} />;
const IconChart = (p) => <Icon {...p} d={<><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/></>} />;
const IconCPU = (p) => <Icon {...p} d={<><rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></>} />;
const IconPlug = (p) => <Icon {...p} d={<><path d="M9 2v6M15 2v6"/><path d="M7 8h10v4a5 5 0 0 1-10 0V8Z"/><path d="M12 17v5"/></>} />;
const IconSliders = (p) => <Icon {...p} d={<><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h14M18 18h2"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></>} />;
const IconPlay = (p) => <Icon {...p} d="M6 4v16l14-8L6 4Z" />;
const IconCheck = (p) => <Icon {...p} d="m5 12 5 5L20 7" />;
const IconSpark = (p) => <Icon {...p} d={<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2.8 2.8M14.7 14.7l2.8 2.8M6.5 17.5l2.8-2.8M14.7 9.3l2.8-2.8"/></>} />;
const IconGlobe = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>} />;
const IconTW = (p) => <Icon {...p} d={<><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h10M7 14h6"/></>} />;
const IconMenu = (p) => <Icon {...p} d={<><path d="M4 7h16M4 12h16M4 17h16"/></>} />;
const IconX = (p) => <Icon {...p} d="M6 6l12 12M18 6 6 18" />;
const IconLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6366f1"/>
        <stop offset="0.5" stopColor="#8b5cf6"/>
        <stop offset="1" stopColor="#ec4899"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#lg)"/>
    <path d="M10 10v12M10 22h8M16 10v12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
  </svg>
);

Object.assign(window, {
  IconArrow, IconBolt, IconLock, IconShield, IconKey, IconWallet,
  IconChart, IconCPU, IconPlug, IconSliders, IconPlay, IconCheck,
  IconSpark, IconGlobe, IconTW, IconMenu, IconX, IconLogo
});
