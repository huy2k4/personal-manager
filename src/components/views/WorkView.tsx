'use client';

import TodayCard from '@/components/cards/TodayCard';
import FreelanceCard from '@/components/cards/FreelanceCard';
import TeachCard from '@/components/cards/TeachCard';

export default function WorkView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* 1. Công việc hôm nay */}
      <TodayCard />

      {/* 2. Hợp đồng Freelance */}
      <FreelanceCard />

      {/* 3. Lịch dạy học Scratch */}
      <TeachCard />
    </div>
  );
}
