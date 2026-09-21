'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import type { NavId } from '@/components/layout/BottomNav';

const DAY_NAMES = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const MONTH_NAMES = [
  'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
  'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12',
];

const TAB_TITLES: Record<NavId, { label: string; sub: string }> = {
  dashboard: { label: 'Dashboard', sub: 'Thống kê & Cảnh báo' },
  work:      { label: 'Việc',      sub: 'Công việc & Giảng dạy' },
  finance:   { label: 'Tài chính', sub: 'Dòng tiền & Đầu tư' },
  health:    { label: 'Sức khỏe', sub: 'Gym & Dinh dưỡng' },
  study:     { label: 'Học tập',  sub: 'Ngoại ngữ & Đồ án' },
};

interface StatusBarProps {
  activeTab?: NavId;
}

export default function StatusBar({ activeTab = 'dashboard' }: StatusBarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const dayName = DAY_NAMES[now.getDay()];
  const dateStr = `${now.getDate()} ${MONTH_NAMES[now.getMonth()]}`;
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const tabInfo = TAB_TITLES[activeTab];

  return (
    <div className="status-bar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-xs text-2">{dayName}, {dateStr}</div>
          <div style={{
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-1)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {hours}:{minutes}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span className="badge badge-accent">{tabInfo.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} color="var(--color-text-3)" />
            <span className="text-xs text-3">{tabInfo.sub}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
