'use client';

import { useState, useEffect, useCallback } from 'react';
import { workProjects as fallbackProjects } from '@/lib/mock-data';
import { fetchWorkProjects } from '@/lib/supabase/services';
import { useRefresh } from '@/lib/refresh-context';
import WorkProjectCard from '@/components/cards/WorkProjectCard';
import type { WorkProject } from '@/types';

const CACHE_KEY = 'work_projects_cache';

function loadCache(): WorkProject[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkProject[];
  } catch {
    return null;
  }
}

function saveCache(data: WorkProject[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export default function WorkView() {
  // Khởi tạo từ cache ngay lập tức → không bao giờ thấy trạng thái rỗng
  const [projects, setProjects] = useState<WorkProject[]>(() => {
    if (typeof window !== 'undefined') {
      return loadCache() ?? fallbackProjects;
    }
    return fallbackProjects;
  });

  const { registerRefreshHandler } = useRefresh();

  const loadData = useCallback(async () => {
    const data = await fetchWorkProjects();
    if (data && data.length > 0) {
      setProjects(data as WorkProject[]);
      saveCache(data as WorkProject[]);
    }
  }, []);

  useEffect(() => {
    loadData();
    return registerRefreshHandler('work-view', loadData);
  }, [loadData, registerRefreshHandler]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {projects.map((project) => (
        <WorkProjectCard
          key={`${project.id}-g${(project.glossary || []).length}`}
          project={project}
          onUpdate={loadData}
        />
      ))}
    </div>
  );
}
