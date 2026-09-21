'use client';

import { useState } from 'react';
import {
  Calendar,
  HelpCircle,
  BookMarked,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  Briefcase,
} from 'lucide-react';
import type { WorkProject, ProjectSchedule } from '@/types';
import Badge from '@/components/ui/Badge';

interface WorkProjectCardProps {
  project: WorkProject;
}

type SubTab = 'schedule' | 'guides' | 'glossary';

export default function WorkProjectCard({ project }: WorkProjectCardProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('schedule');
  const [schedules, setSchedules] = useState<ProjectSchedule[]>(project.schedules);
  const [openGuideId, setOpenGuideId] = useState<string | null>(
    project.guides && project.guides.length > 0 ? project.guides[0].id : null
  );
  const [openTermId, setOpenTermId] = useState<string | null>(null);

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  const toggleGuide = (id: string) => {
    setOpenGuideId((prev) => (prev === id ? null : id));
  };

  const toggleTerm = (id: string) => {
    setOpenTermId((prev) => (prev === id ? null : id));
  };

  const doneCount = schedules.filter((s) => s.done).length;
  const hasGuides = Boolean(project.guides && project.guides.length > 0);
  const hasGlossary = Boolean(project.glossary && project.glossary.length > 0);

  return (
    <div className="card bento-full">
      {/* ─── Header Card ─── */}
      <div className="card-header" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: project.accentColor ?? 'var(--color-accent)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)' }}>
                {project.name}
              </span>
              <Badge variant={project.type === 'primary' ? 'accent' : 'neutral'}>
                {project.tagline}
              </Badge>
            </div>
          </div>
        </div>

        <span className="text-xs text-3">
          {doneCount}/{schedules.length} xong
        </span>
      </div>

      {/* ─── 3 Sub Tabs: Lịch trình, Hướng dẫn, Thuật ngữ ─── */}
      <div className="project-tabs">
        <button
          className={`project-tab-btn${activeTab === 'schedule' ? ' active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <Calendar size={13} />
          <span>Lịch trình ({schedules.length})</span>
        </button>

        {hasGuides && (
          <button
            className={`project-tab-btn${activeTab === 'guides' ? ' active' : ''}`}
            onClick={() => setActiveTab('guides')}
          >
            <HelpCircle size={13} />
            <span>Hướng dẫn ({project.guides?.length})</span>
          </button>
        )}

        {hasGlossary && (
          <button
            className={`project-tab-btn${activeTab === 'glossary' ? ' active' : ''}`}
            onClick={() => setActiveTab('glossary')}
          >
            <BookMarked size={13} />
            <span>Thuật ngữ ({project.glossary?.length})</span>
          </button>
        )}
      </div>

      {/* ─── Tab Content: 1. Lịch trình ─── */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {schedules.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleSchedule(item.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: item.done ? 'var(--color-surface-2)' : 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <div style={{ marginTop: 2 }}>
                {item.done ? (
                  <CheckCircle2 size={16} color="var(--color-success)" strokeWidth={2} />
                ) : (
                  <Circle size={16} color="var(--color-border)" strokeWidth={1.5} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: item.done ? 'var(--color-text-3)' : 'var(--color-text-1)',
                      textDecoration: item.done ? 'line-through' : 'none',
                    }}
                  >
                    {item.title}
                  </span>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 11,
                      color: 'var(--color-text-3)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Clock size={10} />
                    <span>{item.time ? `${item.time} ${item.date}` : item.date}</span>
                  </div>
                </div>

                {item.note && (
                  <p className="text-xs text-3" style={{ marginTop: 2, fontStyle: 'italic' }}>
                    {item.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Tab Content: 2. Hướng dẫn (Accordion Vấn đề & Trả lời) ─── */}
      {activeTab === 'guides' && project.guides && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {project.guides.map((guide) => {
            const isOpen = openGuideId === guide.id;
            return (
              <div key={guide.id} className="accordion-item">
                <button className="accordion-trigger" onClick={() => toggleGuide(guide.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HelpCircle size={13} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13 }}>{guide.question}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={15} color="var(--color-text-3)" />
                  ) : (
                    <ChevronDown size={15} color="var(--color-text-3)" />
                  )}
                </button>
                {isOpen && (
                  <div className="accordion-content">
                    {guide.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Tab Content: 3. Thuật ngữ (Glossary) ─── */}
      {activeTab === 'glossary' && project.glossary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {project.glossary.map((item) => {
            const isOpen = openTermId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => toggleTerm(item.id)}
                className="accordion-item"
                style={{ cursor: 'pointer' }}
              >
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="term-badge">{item.term}</span>
                    <span className="text-xs text-3">Định nghĩa</span>
                  </div>
                  <p
                    className="text-xs text-2"
                    style={{
                      marginTop: 6,
                      lineHeight: 1.5,
                      color: 'var(--color-text-1)',
                    }}
                  >
                    {item.definition}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
