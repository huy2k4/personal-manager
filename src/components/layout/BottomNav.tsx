'use client';

import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'work',      label: 'Công việc', icon: '◷' },
  { id: 'finance',   label: 'Tài chính', icon: '◈' },
  { id: 'health',    label: 'Sức khỏe', icon: '◉' },
  { id: 'study',     label: 'Học tập',   icon: '◫' },
] as const;

type NavId = typeof NAV_ITEMS[number]['id'];

export default function BottomNav() {
  const [active, setActive] = useState<NavId>('dashboard');

  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          id={`nav-${item.id}`}
          className={`nav-item${active === item.id ? ' active' : ''}`}
          onClick={() => setActive(item.id)}
          aria-current={active === item.id ? 'page' : undefined}
          aria-label={item.label}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
