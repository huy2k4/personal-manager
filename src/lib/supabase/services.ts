import { supabase } from './client';
import type { Database } from './types';
import { workProjects as fallbackProjects, todayTasks as fallbackTasks, contracts as fallbackContracts } from '@/lib/mock-data';

export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type ContractRow = Database['public']['Tables']['contracts']['Row'];
export type WorkProjectRow = Database['public']['Tables']['work_projects']['Row'];

/**
 * Fetch all tasks (with fallback to empty array if not connected)
 */
export async function fetchTasks() {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return fallbackTasks;
    }
    return data;
  } catch {
    return fallbackTasks;
  }
}

/**
 * Toggle task done state
 */
export async function toggleTaskDone(taskId: string, done: boolean) {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ done })
      .eq('id', taskId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch Work Projects, Schedules, Guides & Glossary from Supabase
 */
export async function fetchWorkProjects() {
  try {
    const { data: projects, error: projError } = await supabase
      .from('work_projects')
      .select('*');

    if (projError || !projects || projects.length === 0) {
      return fallbackProjects;
    }

    const { data: schedules } = await supabase
      .from('project_schedules')
      .select('*');

    const { data: guides } = await supabase
      .from('project_guides')
      .select('*');

    const { data: glossary } = await supabase
      .from('project_glossary')
      .select('*');

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline || '',
      type: p.type,
      accentColor: p.accent_color,
      logoUrl: p.logo_url,
      schedules: (schedules || [])
        .filter((s) => s.project_id === p.id)
        .map((s) => ({
          id: s.id,
          title: s.title,
          time: s.time,
          date: s.date,
          done: s.done,
          note: s.note,
        })),
      guides: (guides || [])
        .filter((g) => g.project_id === p.id)
        .map((g) => ({
          id: g.id,
          question: g.question,
          answer: g.answer,
        })),
      glossary: (glossary || [])
        .filter((gl) => gl.project_id === p.id)
        .map((gl) => ({
          id: gl.id,
          term: gl.term,
          definition: gl.definition,
        })),
    }));
  } catch {
    return fallbackProjects;
  }
}

/**
 * Fetch Contracts (Freelance projects)
 */
export async function fetchContracts() {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('deadline', { ascending: true });

    if (error || !data) {
      return fallbackContracts;
    }
    return data;
  } catch {
    return fallbackContracts;
  }
}

