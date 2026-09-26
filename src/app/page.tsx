'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { RefreshProvider } from '@/lib/refresh-context';
import StatusBar from '@/components/layout/StatusBar';
import BottomNav, { NavId } from '@/components/layout/BottomNav';
import PullToRefresh from '@/components/ui/PullToRefresh';
import LoginView from '@/components/views/LoginView';
import DashboardView from '@/components/views/DashboardView';
import WorkView from '@/components/views/WorkView';
import FinanceView from '@/components/views/FinanceView';
import HealthView from '@/components/views/HealthView';
import StudyView from '@/components/views/StudyView';
import AccountView from '@/components/views/AccountView';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavId>('dashboard');

  if (isLoading) {
    return (
      <div
        style={{
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '3px solid var(--color-border-2)',
            borderTopColor: 'var(--color-accent)',
            animation: 'ptr-spin 0.75s linear infinite',
          }}
        />
        <style jsx global>{`
          @keyframes ptr-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <RefreshProvider>
      <StatusBar activeTab={activeTab} />

      <PullToRefresh id="main-content">
        {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
        {activeTab === 'work' && <WorkView />}
        {activeTab === 'finance' && (user.has_finance ? <FinanceView /> : <DashboardView onNavigate={setActiveTab} />)}
        {activeTab === 'health' && <HealthView />}
        {activeTab === 'study' && <StudyView />}
        {activeTab === 'account' && <AccountView />}
      </PullToRefresh>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </RefreshProvider>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
