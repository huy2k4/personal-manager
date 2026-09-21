'use client';

import { useState } from 'react';
import { LayoutGrid, Briefcase, TrendingUp, Heart, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'work',      label: 'Việc',      icon: Briefcase },
  { id: 'finance',   label: 'Tài chính', icon: TrendingUp },
  { id: 'health',    label: 'Sức khỏe', icon: Heart },
  { id: 'study',     label: 'Học tập',  icon: BookOpen },
] as const;

type NavId = typeof NAV_ITEMS[number]['id'];

export default function BottomNav() {
  const [active, setActive] = useState<NavId>('dashboard');

  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item${isActive ? ' active' : ''}`}
            onClick={() => setActive(item.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
