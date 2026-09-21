import { TrendingUp, TrendingDown } from 'lucide-react';
import { cryptoAssets } from '@/lib/mock-data';

function formatUSD(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function CryptoCard() {
  const totalValue = cryptoAssets.reduce((s, a) => s + a.value, 0);
  const totalChange = cryptoAssets.reduce((s, a) => s + (a.value * a.change24h) / 100, 0);
  const isPositive = totalChange >= 0;

  return (
    <div className="card bento-full">
      <div className="card-header">
        <span className="card-title">
          <TrendingUp size={14} strokeWidth={2} />
          Crypto
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {isPositive
            ? <TrendingUp size={12} color="var(--color-success)" strokeWidth={2} />
            : <TrendingDown size={12} color="var(--color-danger)" strokeWidth={2} />
          }
          <span
            className="text-xs font-semibold"
            style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}
          >
            {isPositive ? '+' : ''}{formatUSD(totalChange)} 24h
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="metric-number">{formatUSD(totalValue)}</div>
        <div className="metric-label">Tổng portfolio</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {cryptoAssets.map((asset) => {
          const pos = asset.change24h >= 0;
          return (
            <div
              key={asset.symbol}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--color-text-2)',
                  letterSpacing: '-0.02em',
                }}>
                  {asset.symbol}
                </span>
                <div>
                  <div className="text-sm font-medium text-1">{asset.name}</div>
                  <div className="text-xs text-3">{asset.amount} {asset.symbol}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="text-sm font-semibold text-1">{formatUSD(asset.value)}</div>
                <div
                  className="text-xs font-medium"
                  style={{ color: pos ? 'var(--color-success)' : 'var(--color-danger)' }}
                >
                  {pos ? '+' : ''}{asset.change24h}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
