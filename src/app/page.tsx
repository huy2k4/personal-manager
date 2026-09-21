'use client';

import { useState } from 'react';
import StatusBar from '@/components/layout/StatusBar';
import BottomNav, { NavId } from '@/components/layout/BottomNav';
import DashboardView from '@/components/views/DashboardView';
import WorkView from '@/components/views/WorkView';
import FinanceView from '@/components/views/FinanceView';
import HealthView from '@/components/views/HealthView';
import StudyView from '@/components/views/StudyView';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<NavId>('dashboard');

  return (
    <>
      <StatusBar activeTab={activeTab} />

      <main className="page-scroll" id="main-content">
        {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
        {activeTab === 'work' && <WorkView />}
        {activeTab === 'finance' && <FinanceView />}
        {activeTab === 'health' && <HealthView />}
        {activeTab === 'study' && <StudyView />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}
