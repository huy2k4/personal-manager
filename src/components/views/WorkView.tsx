'use client';

import { workProjects } from '@/lib/mock-data';
import WorkProjectCard from '@/components/cards/WorkProjectCard';

export default function WorkView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {workProjects.map((project) => (
        <WorkProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
