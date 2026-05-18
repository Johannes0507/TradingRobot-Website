import { useState } from 'react';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatus('error');
      setErrorMsg('請填寫名字');
      return;
    }
    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMsg('請輸入有效的 email 地址');
      return;
    }
    if (message.trim().length < 5) {
      setStatus('error');
      setErrorMsg('訊息至少 5 個字');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    // TODO: wire to Cloud Run Functions in GCP phase
    await new Promise((r) => setTimeout(r, 1200));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="p-5 rounded-xl bg-success/8 border border-success/20 text-sm text-success font-mono">
        已收到你的訊息，工作時段 24 小時內回覆。
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor="contact-name" className="sr-only">名字</label>
      <input
        id="contact-name"
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        placeholder="名字"
        autoComplete="name"
        required
        className="w-full px-4 py-3 rounded-md bg-bg border border-line-soft text-ink focus:outline-none focus:border-brand"
        aria-invalid={status === 'error'}
        aria-describedby="contact-status"
      />

      <label htmlFor="contact-email" className="sr-only">Email</label>
      <input
        id="contact-email"
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
        aria-describedby="contact-status"
      />

      <label htmlFor="contact-message" className="sr-only">想問什麼？</label>
      <textarea
        id="contact-message"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        placeholder="想問什麼？"
        rows={4}
        required
        className="w-full px-4 py-3 rounded-md bg-bg border border-line-soft text-ink focus:outline-none focus:border-brand resize-none"
        aria-invalid={status === 'error'}
        aria-describedby="contact-status"
      />

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full px-5 py-3 rounded-md bg-ink text-white font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
      >
        {status === 'submitting' ? '處理中…' : '送出'}
      </button>

      <div id="contact-status" role="status" aria-live="polite" className="min-h-[1.25rem] text-xs font-mono">
        {status === 'error' && <span className="text-danger">{errorMsg}</span>}
      </div>
    </form>
  );
}
