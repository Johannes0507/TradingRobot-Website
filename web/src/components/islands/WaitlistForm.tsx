import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lendauto.waitlist.subscribed';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) {
        setAlreadySubscribed(true);
      }
    } catch {
      // ignore localStorage errors (private mode, etc.)
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMsg('請輸入有效的 email 地址');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    // TODO: wire to Cloud Run Functions in GCP phase
    await new Promise((r) => setTimeout(r, 1200));
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setStatus('success');
  };

  if (alreadySubscribed && status !== 'success') {
    return (
      <div className="p-5 rounded-xl bg-success/8 border border-success/20 text-sm text-success font-mono">
        你已經在候補名單中，有更新會通知你。
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="p-5 rounded-xl bg-success/8 border border-success/20 text-sm text-success font-mono">
        已記下你的 email。有重大更新會通知你，不發行銷信。
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor="waitlist-email" className="sr-only">
        Email
      </label>
      <input
        id="waitlist-email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        placeholder="your@email.com"
        autoComplete="email"
        required
        className="w-full px-4 py-3 rounded-md bg-bg border border-line-soft text-ink focus:outline-none focus:border-brand"
        aria-invalid={status === 'error'}
        aria-describedby="waitlist-status"
      />

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full px-5 py-3 rounded-md bg-ink text-white font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
      >
        {status === 'submitting' ? '處理中…' : '加入候補名單'}
      </button>

      <div id="waitlist-status" role="status" aria-live="polite" className="min-h-[1.25rem] text-xs font-mono">
        {status === 'error' && <span className="text-danger">{errorMsg}</span>}
      </div>
    </form>
  );
}
