'use client';

import React from 'react';
import { LayoutGrid, Briefcase, TrendingUp, Heart, BookOpen, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export const ALL_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'work',      label: 'Việc',      icon: Briefcase },
  { id: 'finance',   label: 'Tài chính', icon: TrendingUp },
  { id: 'health',    label: 'Sức khỏe',  icon: Heart },
  { id: 'study',     label: 'Học tập',   icon: BookOpen },
  { id: 'account',   label: 'Tài khoản', icon: User },
] as const;

export type NavId = typeof ALL_NAV_ITEMS[number]['id'];

interface BottomNavProps {
  activeTab: NavId;
  onTabChange: (tab: NavId) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { user } = useAuth();
  const hasFinance = user?.has_finance ?? true;

  // Filter items: exclude finance if user.has_finance is false
  const visibleItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.id === 'finance') {
      return hasFinance;
    }
    return true;
  });

  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      <div className="bottom-nav-inner">
        {visibleItems.map((item) => {
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
              style={{
                minWidth: 0,
                padding: '4px 2px',
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              <span style={{ fontSize: 10, letterSpacing: '-0.01em' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
