import { Briefcase } from 'lucide-react';
import { contracts } from '@/lib/mock-data';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

const STATUS_VARIANT = {
  active:  'accent',
  review:  'warn',
  overdue: 'danger',
} as const;

const STATUS_LABEL = {
  active:  'Đang làm',
  review:  'Review',
  overdue: 'Quá hạn',
} as const;

function formatVND(amount: number) {
  return (amount / 1_000_000).toFixed(0) + 'M';
}

function daysLeft(deadline: string) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return 'Quá hạn';
  if (diff === 0) return 'Hôm nay';
  return `${diff}d còn`;
}

export default function FreelanceCard() {
  const totalEarned = contracts.reduce((s, c) => s + c.earned, 0);

  return (
    <div className="card bento-full">
      <div className="card-header">
        <span className="card-title">
          <Briefcase size={14} strokeWidth={2} />
          Freelance
        </span>
        <span className="text-xs font-semibold text-1">{formatVND(totalEarned)} earned</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {contracts.map((c) => (
          <div key={c.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <span className="text-sm font-semibold text-1">{c.project}</span>
                <span className="text-xs text-2" style={{ marginLeft: 6 }}>{c.client}</span>
              </div>
              <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Badge>
            </div>
            <ProgressBar value={c.progress} showLabel label={`${formatVND(c.earned)} / ${formatVND(c.total)}`} />
            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <span className="text-xs text-3">{daysLeft(c.deadline)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
