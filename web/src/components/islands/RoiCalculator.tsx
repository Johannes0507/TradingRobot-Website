import { useState } from 'react';

// NOTE: kept inline (not imported from mock-data.ts) to avoid pulling the
// entire mock-data module into the client bundle. Keep in sync with
// ROI_PARAMS.apr and ROI_PARAMS.proPriceUsd in web/src/lib/mock-data.ts.
const APR = 0.0842;
const PRO_FEE_USD = 28;

function monthlyGross(capital: number) {
  return (capital * APR) / 12;
}

function monthlyNet(capital: number) {
  return monthlyGross(capital) - PRO_FEE_USD;
}

function fmtUsd(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? '−' : '';
  return `${sign}$${Math.abs(rounded).toLocaleString('en-US')}`;
}

export default function RoiCalculator() {
  const [open, setOpen] = useState(false);
  const [capital, setCapital] = useState<number>(5000);

  const gross = monthlyGross(capital);
  const net = monthlyNet(capital);
  const netPositive = net >= 0;

  return (
    <div className="rounded-2xl border border-line-soft bg-bg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-bg-soft transition-colors"
      >
        <span className="text-sm font-medium text-ink">想試你自己的數字？</span>
        <span
          className="text-mute font-mono text-xs transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="p-6 border-t border-line-soft grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <label
              htmlFor="roi-capital"
              className="block text-xs font-mono text-mute uppercase tracking-wider mb-2"
            >
              資金（USD）
            </label>
            <input
              id="roi-capital"
              type="number"
              min={0}
              step={100}
              value={Number.isFinite(capital) ? capital : 0}
              onChange={(e) => {
                const v = Number.parseFloat(e.target.value);
                setCapital(Number.isFinite(v) ? Math.max(0, v) : 0);
              }}
              className="w-full px-4 py-3 rounded-md bg-bg-soft border border-line-soft font-mono text-xl text-ink focus:outline-none focus:border-brand"
            />
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-mute uppercase tracking-wider mb-2">
              月淨配息
            </div>
            <div
              className={`font-mono text-3xl font-bold tracking-tight ${
                netPositive ? 'text-success' : 'text-danger'
              }`}
            >
              {fmtUsd(net)}
            </div>
            <div className="text-xs text-mute font-mono mt-1">
              毛 {fmtUsd(gross)} − 訂閱 ${PRO_FEE_USD}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
