'use client';

import GymCard from '@/components/cards/GymCard';

export default function HealthView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <GymCard />
    </div>
  );
}
