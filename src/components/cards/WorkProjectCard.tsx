'use client';

import React, { useState, useRef } from 'react';
import {
  Calendar,
  HelpCircle,
  BookMarked,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
} from 'lucide-react';
import type { WorkProject, ProjectSchedule, ProjectGuide, ProjectGlossary } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface WorkProjectCardProps {
  project: WorkProject;
  onUpdate?: () => void;
}

type SubTab = 'schedule' | 'guides' | 'glossary';

export default function WorkProjectCard({ project, onUpdate }: WorkProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<SubTab>('schedule');
  const [editTab, setEditTab] = useState<SubTab>('schedule');

  // Front state
  const [schedules, setSchedules] = useState<ProjectSchedule[]>(project.schedules || []);
  const [guides, setGuides] = useState<ProjectGuide[]>(project.guides || []);
  const [glossary, setGlossary] = useState<ProjectGlossary[]>(project.glossary || []);

  const [openGuideId, setOpenGuideId] = useState<string | null>(
    project.guides && project.guides.length > 0 ? project.guides[0].id : null
  );
  const [openTermId, setOpenTermId] = useState<string | null>(null);

  // Form Inputs for Back face
  const [schedTitle, setSchedTitle] = useState('');
  const [schedTime, setSchedTime] = useState('09:00');
  const [schedDate, setSchedDate] = useState('26/09');
  const [schedNote, setSchedNote] = useState('');

  const [guideQuestion, setGuideQuestion] = useState('');
  const [guideAnswer, setGuideAnswer] = useState('');

  const [termName, setTermName] = useState('');
  const [termDef, setTermDef] = useState('');

  // Mobile double-tap detection
  const lastTapRef = useRef<number>(0);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      setIsFlipped((prev) => !prev);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return;
    }
    setIsFlipped((prev) => !prev);
  };

  // Toggle Done in Supabase
  const toggleSchedule = async (id: string) => {
    const updated = schedules.map((s) => (s.id === id ? { ...s, done: !s.done } : s));
    setSchedules(updated);

    try {
      const target = updated.find((s) => s.id === id);
      if (target) {
        await supabase
          .from('project_schedules')
          .update({ done: target.done })
          .eq('id', id);
      }
    } catch {
      // Ignore
    }
  };

  // Add Schedule
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle.trim()) return;

    const newItem: ProjectSchedule = {
      id: `sch-${Date.now()}`,
      title: schedTitle.trim(),
      time: schedTime,
      date: schedDate,
      done: false,
      note: schedNote.trim() || undefined,
    };

    setSchedules((prev) => [...prev, newItem]);
    setSchedTitle('');
    setSchedNote('');

    try {
      await supabase.from('project_schedules').insert({
        project_id: project.id,
        title: newItem.title,
        time: newItem.time,
        date: newItem.date,
        done: false,
        note: newItem.note,
      });
      if (onUpdate) onUpdate();
    } catch {
      // Ignore
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    try {
      await supabase.from('project_schedules').delete().eq('id', id);
      if (onUpdate) onUpdate();
    } catch {
      // Ignore
    }
  };

  // Add Guide
  const handleAddGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideQuestion.trim() || !guideAnswer.trim()) return;

    const newGuide: ProjectGuide = {
      id: `gd-${Date.now()}`,
      question: guideQuestion.trim(),
      answer: guideAnswer.trim(),
    };

    setGuides((prev) => [...prev, newGuide]);
    setGuideQuestion('');
    setGuideAnswer('');

    try {
      await supabase.from('project_guides').insert({
        project_id: project.id,
        question: newGuide.question,
        answer: newGuide.answer,
      });
      if (onUpdate) onUpdate();
    } catch {
      // Ignore
    }
  };

  // Delete Guide
  const handleDeleteGuide = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGuides((prev) => prev.filter((g) => g.id !== id));
    try {
      await supabase.from('project_guides').delete().eq('id', id);
      if (onUpdate) onUpdate();
    } catch {
      // Ignore
    }
  };

  // Add Term
  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termName.trim() || !termDef.trim()) return;

    const newTerm: ProjectGlossary = {
      id: `gl-${Date.now()}`,
      term: termName.trim(),
      definition: termDef.trim(),
    };

    setGlossary((prev) => [...prev, newTerm]);
    setTermName('');
    setTermDef('');

    try {
      await supabase.from('project_glossary').insert({
        project_id: project.id,
        term: newTerm.term,
        definition: newTerm.definition,
      });
      if (onUpdate) onUpdate();
    } catch {
      // Ignore
    }
  };

  // Delete Term
  const handleDeleteTerm = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGlossary((prev) => prev.filter((g) => g.id !== id));
    try {
      await supabase.from('project_glossary').delete().eq('id', id);
      if (onUpdate) onUpdate();
    } catch {
      // Ignore
    }
  };

  const doneCount = schedules.filter((s) => s.done).length;

  return (
    <div
      style={{
        perspective: 1200,
        width: '100%',
        userSelect: 'none',
      }}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ══════════════════════════════════════════════════════════
            FRONT SIDE (Regular View)
            ══════════════════════════════════════════════════════════ */}
        <div
          className="card bento-full"
          style={{
            position: isFlipped ? 'absolute' : 'relative',
            top: 0,
            left: 0,
            right: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            minHeight: 200,
            cursor: 'default',
            pointerEvents: isFlipped ? 'none' : 'auto',
          }}
        >
          {/* Header (Same on both sides) */}
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {project.logoUrl ? (
                <img
                  src={project.logoUrl}
                  alt={project.name}
                  style={{
                    height: 20,
                    width: 'auto',
                    maxWidth: 110,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)' }}>
                  {project.name}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="text-xs text-3">
                {doneCount}/{schedules.length} xong
              </span>
            </div>
          </div>

          {/* 3 Sub Tabs */}
          <div className="project-tabs" style={{ marginBottom: 12 }}>
            <button
              className={`project-tab-btn${activeTab === 'schedule' ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('schedule'); }}
            >
              <Calendar size={13} />
              <span>Lịch trình ({schedules.length})</span>
            </button>

            <button
              className={`project-tab-btn${activeTab === 'guides' ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('guides'); }}
            >
              <HelpCircle size={13} />
              <span>Hướng dẫn ({guides.length})</span>
            </button>

            <button
              className={`project-tab-btn${activeTab === 'glossary' ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('glossary'); }}
            >
              <BookMarked size={13} />
              <span>Thuật ngữ ({glossary.length})</span>
            </button>
          </div>

          {/* Tab 1: Schedules */}
          {activeTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {schedules.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 12, color: 'var(--color-text-3)' }}>
                  Chưa có lịch trình. Nhấn đúp vào card để thêm việc mới!
                </div>
              ) : (
                schedules.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSchedule(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '7px 9px',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                          <Clock size={11} color="var(--color-text-3)" />
                          <span style={{ fontSize: 10.5, color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums' }}>
                            {item.date} &bull; {item.time}
                          </span>
                        </div>
                      </div>
                      {item.note && (
                        <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2 }}>
                          {item.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Guides */}
          {activeTab === 'guides' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {guides.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 12, color: 'var(--color-text-3)' }}>
                  Chưa có tài liệu hướng dẫn. Nhấn đúp vào card để thêm!
                </div>
              ) : (
                guides.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setOpenGuideId(openGuideId === g.id ? null : g.id)}
                    style={{
                      padding: '9px 11px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border-2)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--color-text-1)', marginBottom: openGuideId === g.id ? 6 : 0 }}>
                      {g.question}
                    </div>
                    {openGuideId === g.id && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.5, borderTop: '1px dashed var(--color-border)', paddingTop: 6 }}>
                        {g.answer}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Glossary */}
          {activeTab === 'glossary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {glossary.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 12, color: 'var(--color-text-3)' }}>
                  Chưa có thuật ngữ. Nhấn đúp vào card để thêm!
                </div>
              ) : (
                glossary.map((term) => (
                  <div
                    key={term.id}
                    onClick={() => setOpenTermId(openTermId === term.id ? null : term.id)}
                    style={{
                      padding: '9px 11px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border-2)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-accent)' }}>
                        {term.term}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-2)', marginTop: 3, lineHeight: 1.4 }}>
                      {term.definition}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            BACK SIDE (Inline Flip Form for Direct Input)
            ══════════════════════════════════════════════════════════ */}
        <div
          className="card bento-full"
          style={{
            position: isFlipped ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 340,
            background: 'var(--color-surface)',
            border: '2px solid var(--color-accent)',
            boxShadow: '0 8px 30px rgba(37, 99, 235, 0.15)',
            zIndex: 10,
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          {/* Back Header (Exact same Title / Logo as Front) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '1px solid var(--color-border-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {project.logoUrl ? (
                <img
                  src={project.logoUrl}
                  alt={project.name}
                  style={{
                    height: 20,
                    width: 'auto',
                    maxWidth: 110,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)' }}>
                  {project.name}
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              Save
            </button>
          </div>

          {/* Edit Tabs (Clean text with NO + signs) */}
          <div className="project-tabs" style={{ marginBottom: 12 }}>
            <button
              className={`project-tab-btn${editTab === 'schedule' ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setEditTab('schedule'); }}
            >
              <span>Lịch trình</span>
            </button>
            <button
              className={`project-tab-btn${editTab === 'guides' ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setEditTab('guides'); }}
            >
              <span>Hướng dẫn</span>
            </button>
            <button
              className={`project-tab-btn${editTab === 'glossary' ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setEditTab('glossary'); }}
            >
              <span>Thuật ngữ</span>
            </button>
          </div>

          {/* Back Tab 1: Add/Manage Schedule */}
          {editTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <form onSubmit={handleAddSchedule} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Tiêu đề công việc cần làm..."
                  value={schedTitle}
                  onChange={(e) => setSchedTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Giờ (VD: 09:00)"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    style={{
                      padding: '7px 9px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface-2)',
                      fontSize: 12,
                      color: 'var(--color-text-1)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Ngày (VD: 26/09)"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    style={{
                      padding: '7px 9px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface-2)',
                      fontSize: 12,
                      color: 'var(--color-text-1)',
                    }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Ghi chú chi tiết (nếu có)..."
                  value={schedNote}
                  onChange={(e) => setSchedNote(e.target.value)}
                  style={{
                    padding: '7px 9px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span>Thêm Lịch trình</span>
                </button>
              </form>

              {/* List of current schedules with delete option */}
              {schedules.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Lịch hiện tại ({schedules.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 130, overflowY: 'auto' }}>
                    {schedules.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          fontSize: 11.5,
                        }}
                      >
                        <span style={{ color: 'var(--color-text-1)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.title} ({s.date})
                        </span>
                        <button
                          onClick={(e) => handleDeleteSchedule(s.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-danger)',
                            padding: 2,
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Back Tab 2: Add/Manage Guides */}
          {editTab === 'guides' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <form onSubmit={handleAddGuide} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Tiêu đề câu hỏi / Hướng dẫn..."
                  value={guideQuestion}
                  onChange={(e) => setGuideQuestion(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                  }}
                />
                <textarea
                  placeholder="Nội dung giải thích / quy trình hướng dẫn..."
                  value={guideAnswer}
                  onChange={(e) => setGuideAnswer(e.target.value)}
                  rows={3}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                    resize: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span>Thêm Hướng dẫn</span>
                </button>
              </form>

              {/* List of current guides */}
              {guides.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Hướng dẫn hiện có ({guides.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 110, overflowY: 'auto' }}>
                    {guides.map((g) => (
                      <div
                        key={g.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          fontSize: 11.5,
                        }}
                      >
                        <span style={{ color: 'var(--color-text-1)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {g.question}
                        </span>
                        <button
                          onClick={(e) => handleDeleteGuide(g.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-danger)',
                            padding: 2,
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Back Tab 3: Add/Manage Glossary */}
          {editTab === 'glossary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <form onSubmit={handleAddTerm} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Thuật ngữ (VD: EDI, Reefer)..."
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Định nghĩa thuật ngữ..."
                  value={termDef}
                  onChange={(e) => setTermDef(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span>Thêm Thuật ngữ</span>
                </button>
              </form>

              {/* List of current terms */}
              {glossary.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Thuật ngữ hiện có ({glossary.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 110, overflowY: 'auto' }}>
                    {glossary.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          fontSize: 11.5,
                        }}
                      >
                        <span style={{ color: 'var(--color-text-1)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.term}
                        </span>
                        <button
                          onClick={(e) => handleDeleteTerm(t.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-danger)',
                            padding: 2,
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
