'use client';

import { LayoutGrid, Briefcase, TrendingUp, Heart, BookOpen } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'work',      label: 'Việc',      icon: Briefcase },
  { id: 'finance',   label: 'Tài chính', icon: TrendingUp },
  { id: 'health',    label: 'Sức khỏe', icon: Heart },
  { id: 'study',     label: 'Học tập',  icon: BookOpen },
] as const;

export type NavId = typeof NAV_ITEMS[number]['id'];

interface BottomNavProps {
  activeTab: NavId;
  onTabChange: (tab: NavId) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={() => onTabChange(item.id)}
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
      </div>
    </nav>
  );
}
