'use client';

import { TrendingUp, Wallet, ArrowUpRight, DollarSign } from 'lucide-react';
import CryptoChartCard from '@/components/cards/CryptoChartCard';
import { contracts, cryptoAssets } from '@/lib/mock-data';
import ProgressBar from '@/components/ui/ProgressBar';

export default function FinanceView() {
  const totalFreelanceEarned = contracts.reduce((s, c) => s + c.earned, 0);
  const totalFreelanceGoal = contracts.reduce((s, c) => s + c.total, 0);
  const remainingReceivable = totalFreelanceGoal - totalFreelanceEarned;

  const totalCryptoUSD = cryptoAssets.reduce((s, a) => s + a.value, 0);
  const cryptoInVND = totalCryptoUSD * 25400; // ~25.4k VND/USD

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Thống kê dòng tiền & tổng tài sản */}
      <div className="card bento-full">
        <div className="card-header">
          <span className="card-title">
            <Wallet size={14} strokeWidth={2} />
            Dòng tiền & Thu nhập
          </span>
          <span className="badge badge-success">
            <ArrowUpRight size={11} /> Đang tăng
          </span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div className="text-xs text-3" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tổng tài sản ước tính
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)', marginTop: 2 }}>
            {((totalFreelanceEarned + cryptoInVND) / 1_000_000).toFixed(1)}M VND
          </div>
          <div className="text-xs text-2" style={{ marginTop: 2 }}>
            Crypto: ${(totalCryptoUSD).toLocaleString()} (~{(cryptoInVND / 1_000_000).toFixed(1)}M) + Freelance đã nhận: {(totalFreelanceEarned / 1_000_000).toFixed(1)}M
          </div>
        </div>

        <div className="divider" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="text-xs font-semibold text-1">Tiến độ thu tiền Freelance</span>
              <span className="text-xs text-2">
                {(totalFreelanceEarned / 1_000_000).toFixed(1)}M / {(totalFreelanceGoal / 1_000_000).toFixed(0)}M VND
              </span>
            </div>
            <ProgressBar value={Math.round((totalFreelanceEarned / totalFreelanceGoal) * 100)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-2)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div className="text-xs text-3">Còn lại phải thu</div>
              <div className="text-sm font-semibold text-1">{(remainingReceivable / 1_000_000).toFixed(1)}M VND</div>
            </div>
            <span className="badge badge-accent">2 hợp đồng</span>
          </div>
        </div>
      </div>

      {/* Crypto H1 Real-time Chart */}
      <CryptoChartCard />
    </div>
  );
}
