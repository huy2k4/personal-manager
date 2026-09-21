'use client';

import LanguageCard from '@/components/cards/LanguageCard';
import ProjectCard from '@/components/cards/ProjectCard';

export default function StudyView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* 1. Học ngoại ngữ */}
      <LanguageCard />

      {/* 2. Đồ án trường đại học */}
      <ProjectCard />
    </div>
  );
}
