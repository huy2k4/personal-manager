'use client';

import { useEffect, useState } from 'react';

const DAY_NAMES = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const MONTH_NAMES = ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
  'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'];

export default function StatusBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const dayName = DAY_NAMES[now.getDay()];
  const dateStr = `${now.getDate()} ${MONTH_NAMES[now.getMonth()]}`;
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return (
    <div className="status-bar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-xs text-2">{dayName}, {dateStr}</div>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'var(--color-text-1)' }}>
            {hours}:{minutes}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span className="badge badge-accent text-xs">5 task hôm nay</span>
          <span className="text-xs text-3">3 chưa xong</span>
        </div>
      </div>
    </div>
  );
}
