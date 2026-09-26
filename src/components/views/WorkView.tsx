'use client';

import { useState, useEffect, useCallback } from 'react';
import { workProjects as fallbackProjects } from '@/lib/mock-data';
import { fetchWorkProjects } from '@/lib/supabase/services';
import { useRefresh } from '@/lib/refresh-context';
import WorkProjectCard from '@/components/cards/WorkProjectCard';
import type { WorkProject } from '@/types';

export default function WorkView() {
  const [projects, setProjects] = useState<WorkProject[]>(fallbackProjects);
  const { registerRefreshHandler } = useRefresh();

  const loadData = useCallback(async () => {
    const data = await fetchWorkProjects();
    if (data && data.length > 0) {
      setProjects(data as WorkProject[]);
    }
  }, []);

  useEffect(() => {
    loadData();
    return registerRefreshHandler('work-view', loadData);
  }, [loadData, registerRefreshHandler]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {projects.map((project) => (
        <WorkProjectCard key={project.id} project={project} onUpdate={loadData} />
      ))}
    </div>
  );
}
