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
  AlertCircle,
  Pencil,
  Check,
  X,
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

  // Form Inputs for Back face (Schedule)
  const [schedTitle, setSchedTitle] = useState('');
  const [schedNote, setSchedNote] = useState('');
  const [dateDigits, setDateDigits] = useState(''); // Empty -> displays _ _ / _ _ / 2026
  const [schedTime, setSchedTime] = useState('09:00');
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const nativeDateRef = useRef<HTMLInputElement>(null);

  // Form Inputs for Back face (Guides & Glossary)
  const [guideQuestion, setGuideQuestion] = useState('');
  const [guideAnswer, setGuideAnswer] = useState('');

  const [termName, setTermName] = useState('');
  const [termDef, setTermDef] = useState('');
  const termNameRef = useRef<HTMLInputElement>(null);
  const termDefRef = useRef<HTMLInputElement>(null);

  // Inline edit state for glossary
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editTermName, setEditTermName] = useState('');
  const [editTermDef, setEditTermDef] = useState('');
  const [glossaryError, setGlossaryError] = useState<string | null>(null);

  // Mobile double-tap detection with touch distance & duration tolerance
  const touchStartRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const lastTouchFlipTimeRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        time: Date.now(),
        x: touch.clientX,
        y: touch.clientY,
      };
    }
  };

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

    if (!touchStartRef.current) return;
    const start = touchStartRef.current;
    const endTouch = e.changedTouches[0];
    if (!endTouch) return;

    const moveDist = Math.hypot(endTouch.clientX - start.x, endTouch.clientY - start.y);
    const duration = Date.now() - start.time;

    // Filter out scroll/swipe gestures: must move < 20px and be released within 400ms
    if (moveDist < 20 && duration < 400) {
      const now = Date.now();
      const lastTap = lastTapRef.current;

      if (lastTap) {
        const timeDiff = now - lastTap.time;
        const tapDist = Math.hypot(endTouch.clientX - lastTap.x, endTouch.clientY - lastTap.y);

        // Valid double tap window: 40ms to 600ms and within 50px
        if (timeDiff >= 40 && timeDiff <= 600 && tapDist < 50) {
          lastTouchFlipTimeRef.current = Date.now();
          setIsFlipped((prev) => {
            const next = !prev;
            if (next) {
              setEditTab(activeTab);
            } else {
              setActiveTab(editTab);
            }
            return next;
          });
          lastTapRef.current = null;
          touchStartRef.current = null;
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(12);
          }
          return;
        }
      }

      lastTapRef.current = {
        time: now,
        x: endTouch.clientX,
        y: endTouch.clientY,
      };
    } else {
      // Finger moved -> user was scrolling -> clear tap reference
      lastTapRef.current = null;
      touchStartRef.current = null;
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Prevent synthetic dblclick from flipping back right after a touch double-tap
    if (Date.now() - lastTouchFlipTimeRef.current < 800) {
      return;
    }

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
    setIsFlipped((prev) => {
      const next = !prev;
      if (next) {
        setEditTab(activeTab);
      } else {
        setActiveTab(editTab);
      }
      return next;
    });
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

  const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    setDateDigits(raw);
    setFormError(null);
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "YYYY-MM-DD"
    if (!val) return;
    const [y, m, d] = val.split('-');
    setDateDigits(`${d}${m}${y.slice(-2)}`);
    setFormError(null);
  };

  const openNativePicker = () => {
    if (nativeDateRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          nativeDateRef.current.showPicker();
        } catch {
          nativeDateRef.current.focus();
        }
      } else {
        nativeDateRef.current.focus();
      }
    }
  };

  // Add Schedule with Validation
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!schedTitle.trim()) {
      setFormError('Vui lòng nhập tiêu đề công việc');
      return;
    }

    if (dateDigits.length < 4) {
      setFormError('Vui lòng nhập đủ ngày & tháng (ví dụ 1309)');
      return;
    }

    const d = parseInt(dateDigits.slice(0, 2), 10);
    const m = parseInt(dateDigits.slice(2, 4), 10);
    const y = dateDigits.length >= 6 ? parseInt(`20${dateDigits.slice(4, 6)}`, 10) : 2026;

    if (isNaN(d) || d < 1 || d > 31) {
      setFormError('Ngày không hợp lệ (01 - 31)');
      return;
    }
    if (isNaN(m) || m < 1 || m > 12) {
      setFormError('Tháng không hợp lệ (01 - 12)');
      return;
    }

    if ([4, 6, 9, 11].includes(m) && d > 30) {
      setFormError(`Tháng ${m} chỉ có tối đa 30 ngày`);
      return;
    }
    if (m === 2) {
      const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      if (d > (isLeap ? 29 : 28)) {
        setFormError(`Tháng 2/${y} chỉ có tối đa ${isLeap ? 29 : 28} ngày`);
        return;
      }
    }

    const formattedDate = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
    const formattedTime = schedTime || '09:00';

    const newItem: ProjectSchedule = {
      id: `sch-${Date.now()}`,
      title: schedTitle.trim(),
      time: formattedTime,
      date: formattedDate,
      done: false,
      note: schedNote.trim() || undefined,
    };

    setSchedules((prev) => [...prev, newItem]);
    setSchedTitle('');
    setSchedNote('');
    setDateDigits('');

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

  // Add Term — lấy UUID thực từ Supabase sau khi insert
  const handleAddTerm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!termName.trim() || !termDef.trim()) return;
    setGlossaryError(null);

    const optimisticId = `gl-temp-${Date.now()}`;
    const optimisticTerm: ProjectGlossary = {
      id: optimisticId,
      term: termName.trim(),
      definition: termDef.trim(),
    };

    setGlossary((prev) => [...prev, optimisticTerm]);
    setTermName('');
    setTermDef('');
    // Focus back to title input
    setTimeout(() => termNameRef.current?.focus(), 0);

    try {
      const { data, error } = await supabase
        .from('project_glossary')
        .insert({
          project_id: project.id,
          term: optimisticTerm.term,
          definition: optimisticTerm.definition,
        })
        .select()
        .single();

      if (error || !data) {
        // Rollback optimistic update
        setGlossary((prev) => prev.filter((g) => g.id !== optimisticId));
        setGlossaryError('Lưu thất bại: ' + (error?.message || 'Lỗi không xác định'));
        return;
      }

      // Replace temp ID with real UUID from Supabase
      setGlossary((prev) =>
        prev.map((g) =>
          g.id === optimisticId ? { id: data.id, term: data.term, definition: data.definition } : g
        )
      );
      // Không gọi onUpdate để tránh race condition - state đã được sync qua useEffect
    } catch {
      setGlossary((prev) => prev.filter((g) => g.id !== optimisticId));
      setGlossaryError('Lỗi kết nối Supabase.');
    }
  };

  // Delete Term
  const handleDeleteTerm = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGlossary((prev) => prev.filter((g) => g.id !== id));
    try {
      const { error } = await supabase.from('project_glossary').delete().eq('id', id);
      if (error) setGlossaryError('Xóa thất bại: ' + error.message);
      // Không gọi onUpdate để tránh race condition
    } catch {
      setGlossaryError('Lỗi kết nối khi xóa.');
    }
  };

  // Start editing a term inline
  const handleStartEditTerm = (term: ProjectGlossary, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTermId(term.id);
    setEditTermName(term.term);
    setEditTermDef(term.definition);
    setGlossaryError(null);
  };

  // Save edited term
  const handleSaveTerm = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTermName.trim() || !editTermDef.trim()) return;
    setGlossaryError(null);

    const prev = glossary.find((g) => g.id === id);
    // Optimistic update
    setGlossary((list) =>
      list.map((g) =>
        g.id === id ? { ...g, term: editTermName.trim(), definition: editTermDef.trim() } : g
      )
    );
    setEditingTermId(null);

    try {
      const { error } = await supabase
        .from('project_glossary')
        .update({ term: editTermName.trim(), definition: editTermDef.trim() })
        .eq('id', id);

      if (error) {
        // Rollback
        if (prev) setGlossary((list) => list.map((g) => (g.id === id ? prev : g)));
        setGlossaryError('Cập nhật thất bại: ' + error.message);
      }
      // Không gọi onUpdate để tránh race condition
    } catch {
      if (prev) setGlossary((list) => list.map((g) => (g.id === id ? prev : g)));
      setGlossaryError('Lỗi kết nối khi cập nhật.');
    }
  };

  // Cancel editing
  const handleCancelEditTerm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTermId(null);
    setGlossaryError(null);
  };

  const logoSrc = project.logoUrl || (project.id === 'nam-khanh' ? '/NamKhanh.png' : project.id === 'maersk' ? '/maersk-logo.png' : null);

  return (
    <div
      style={{
        width: '100%',
        touchAction: 'pan-y',
        userSelect: isFlipped ? 'auto' : 'none',
      }}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!isFlipped ? (
        /* ══════════════════════════════════════════════════════════
            FRONT SIDE (Regular View)
            ══════════════════════════════════════════════════════════ */
        <div
          className="card bento-full"
          style={{
            minHeight: 200,
            cursor: 'default',
          }}
        >
          {/* Header (Same on both sides) */}
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {logoSrc ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img
                    src={logoSrc}
                    alt={project.name}
                    style={{
                      height: 24,
                      width: 'auto',
                      maxWidth: 110,
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                  {project.id === 'nam-khanh' && (
                    <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.02em', color: 'var(--color-text-1)' }}>
                      NAMKHANH
                    </span>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)' }}>
                  {project.name}
                </span>
              )}
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
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                maxHeight: 220,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                paddingRight: 2,
              }}
            >
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
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '7px 9px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: item.done ? 'var(--color-surface-2)' : 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'background-color 150ms ease, border-color 150ms ease',
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
                            Deadline: {item.date} &bull; {item.time}
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
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                maxHeight: 220,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                paddingRight: 2,
              }}
            >
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
                      flexShrink: 0,
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
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                maxHeight: 220,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                paddingRight: 2,
              }}
            >
              {glossary.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 12, color: 'var(--color-text-3)' }}>
                  Chưa có thuật ngữ. Nhấn đúp vào card để thêm!
                </div>
              ) : (
                glossary.map((term) => (
                  <div
                    key={term.id}
                    style={{
                      flexShrink: 0,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border-2)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      onClick={() => setOpenTermId(openTermId === term.id ? null : term.id)}
                      style={{ padding: '9px 11px', cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-accent)' }}>
                        {term.term}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--color-text-2)', marginTop: 3, lineHeight: 1.4 }}>
                        {term.definition}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════
            BACK SIDE (Inline Flip Form for Direct Input)
            ══════════════════════════════════════════════════════════ */
        <div
          className="card bento-full"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            background: 'var(--color-surface)',
            border: '2px solid var(--color-accent)',
            boxShadow: '0 8px 30px rgba(37, 99, 235, 0.15)',
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
              {logoSrc ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img
                    src={logoSrc}
                    alt={project.name}
                    style={{
                      height: 24,
                      width: 'auto',
                      maxWidth: 110,
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                  {project.id === 'nam-khanh' && (
                    <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.02em', color: 'var(--color-text-1)' }}>
                      NAMKHANH
                    </span>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)' }}>
                  {project.name}
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(editTab);
                setIsFlipped(false);
              }}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent)',
                color: 'var(--color-accent-ink)',
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 150ms ease, opacity 150ms ease',
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
                {/* Title */}
                <input
                  type="text"
                  placeholder="Tiêu đề công việc cần làm..."
                  value={schedTitle}
                  onChange={(e) => { setSchedTitle(e.target.value); setFormError(null); }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                    transition: 'border-color 0.15s ease',
                  }}
                />

                {/* Quick Date Presets */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Hôm nay', offsetDays: 0 },
                    { label: 'Ngày mai', offsetDays: 1 },
                    { label: '+2 ngày', offsetDays: 2 },
                    { label: '+1 tuần', offsetDays: 7 },
                  ].map((preset) => {
                    const target = new Date();
                    target.setDate(target.getDate() + preset.offsetDays);
                    const dd = String(target.getDate()).padStart(2, '0');
                    const mm = String(target.getMonth() + 1).padStart(2, '0');
                    const yy = String(target.getFullYear()).slice(-2);
                    const targetDigits6 = `${dd}${mm}${yy}`;
                    const targetDigits4 = `${dd}${mm}`;
                    const isSelected = dateDigits === targetDigits6 || (dateDigits === targetDigits4 && yy === '26');
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setDateDigits(targetDigits6);
                          setFormError(null);
                        }}
                        style={{
                          fontSize: 10.5,
                          fontWeight: isSelected ? 650 : 500,
                          padding: '3px 8px',
                          borderRadius: 99,
                          border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          background: isSelected ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
                          color: isSelected ? 'var(--color-accent)' : 'var(--color-text-2)',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                        }}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Deadline & Time Pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 8 }}>
                  {/* Deadline Slot Input (_ _ / _ _ / 2 0 2 6) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={11} color="var(--color-accent)" />
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--color-text-2)' }}>
                          Deadline
                        </span>
                      </div>
                      <span style={{ fontSize: 9.5, color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums' }}>
                        (DD/MM/YYYY)
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 'var(--radius-sm)',
                        border: isDateFocused ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                        background: 'var(--color-surface-2)',
                        padding: '0 8px',
                        height: 34,
                        boxSizing: 'border-box',
                        cursor: 'text',
                        position: 'relative',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                        boxShadow: isDateFocused ? '0 0 0 2px var(--color-accent-ring)' : 'none',
                      }}
                    >
                      {/* Visual Formatted Slots */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: 13,
                          fontWeight: 600,
                          fontVariantNumeric: 'tabular-nums',
                          lineHeight: 1,
                          pointerEvents: 'none',
                        }}
                      >
                        {/* Day D1 */}
                        <span
                          style={{
                            width: 10,
                            textAlign: 'center',
                            color: isDateFocused && dateDigits.length === 0
                              ? 'var(--color-accent)'
                              : dateDigits[0]
                              ? 'var(--color-text-1)'
                              : 'var(--color-text-3)',
                            fontWeight: isDateFocused && dateDigits.length === 0 ? 700 : 600,
                          }}
                        >
                          {dateDigits[0] || '_'}
                        </span>

                        {/* Day D2 */}
                        <span
                          style={{
                            width: 10,
                            textAlign: 'center',
                            color: isDateFocused && dateDigits.length === 1
                              ? 'var(--color-accent)'
                              : dateDigits[1]
                              ? 'var(--color-text-1)'
                              : 'var(--color-text-3)',
                            fontWeight: isDateFocused && dateDigits.length === 1 ? 700 : 600,
                          }}
                        >
                          {dateDigits[1] || '_'}
                        </span>

                        <span style={{ color: 'var(--color-text-3)', margin: '0 2px', fontWeight: 400 }}>/</span>

                        {/* Month M1 */}
                        <span
                          style={{
                            width: 10,
                            textAlign: 'center',
                            color: isDateFocused && dateDigits.length === 2
                              ? 'var(--color-accent)'
                              : dateDigits[2]
                              ? 'var(--color-text-1)'
                              : 'var(--color-text-3)',
                            fontWeight: isDateFocused && dateDigits.length === 2 ? 700 : 600,
                          }}
                        >
                          {dateDigits[2] || '_'}
                        </span>

                        {/* Month M2 */}
                        <span
                          style={{
                            width: 10,
                            textAlign: 'center',
                            color: isDateFocused && dateDigits.length === 3
                              ? 'var(--color-accent)'
                              : dateDigits[3]
                              ? 'var(--color-text-1)'
                              : 'var(--color-text-3)',
                            fontWeight: isDateFocused && dateDigits.length === 3 ? 700 : 600,
                          }}
                        >
                          {dateDigits[3] || '_'}
                        </span>

                        <span style={{ color: 'var(--color-text-3)', margin: '0 2px', fontWeight: 400 }}>/</span>

                        {/* Century Prefix: 2 0 (Fixed, but styled identically to other digits) */}
                        <span style={{ width: 10, textAlign: 'center', color: dateDigits.length >= 4 ? 'var(--color-text-1)' : 'var(--color-text-2)' }}>
                          2
                        </span>
                        <span style={{ width: 10, textAlign: 'center', color: dateDigits.length >= 4 ? 'var(--color-text-1)' : 'var(--color-text-2)' }}>
                          0
                        </span>

                        {/* Year Y1 (Editable) */}
                        <span
                          style={{
                            width: 10,
                            textAlign: 'center',
                            color: isDateFocused && dateDigits.length === 4
                              ? 'var(--color-accent)'
                              : dateDigits.length >= 5
                              ? 'var(--color-text-1)'
                              : dateDigits.length >= 4
                              ? 'var(--color-text-1)'
                              : 'var(--color-text-2)',
                            fontWeight: isDateFocused && dateDigits.length === 4 ? 700 : 600,
                          }}
                        >
                          {dateDigits[4] || '2'}
                        </span>

                        {/* Year Y2 (Editable) */}
                        <span
                          style={{
                            width: 10,
                            textAlign: 'center',
                            color: isDateFocused && dateDigits.length === 5
                              ? 'var(--color-accent)'
                              : dateDigits.length >= 6
                              ? 'var(--color-text-1)'
                              : dateDigits.length === 5
                              ? 'var(--color-accent)'
                              : dateDigits.length >= 4
                              ? 'var(--color-text-1)'
                              : 'var(--color-text-2)',
                            fontWeight: isDateFocused && dateDigits.length === 5 ? 700 : 600,
                          }}
                        >
                          {dateDigits[5] || (dateDigits.length === 5 ? '_' : '6')}
                        </span>
                      </div>

                      {/* Actual transparent input capturing mobile keypad and desktop keystrokes */}
                      <input
                        ref={dateInputRef}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        autoComplete="off"
                        value={dateDigits}
                        onChange={handleDigitChange}
                        onFocus={() => setIsDateFocused(true)}
                        onBlur={() => setIsDateFocused(false)}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'text',
                          zIndex: 1,
                        }}
                      />

                      {/* Native calendar trigger button */}
                      <button
                        type="button"
                        title="Chọn từ lịch"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNativePicker();
                        }}
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          background: 'none',
                          border: 'none',
                          padding: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text-3)',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-3)')}
                      >
                        <Calendar size={13} />
                      </button>

                      <input
                        ref={nativeDateRef}
                        type="date"
                        tabIndex={-1}
                        onChange={handleNativeDateChange}
                        style={{
                          position: 'absolute',
                          opacity: 0,
                          pointerEvents: 'none',
                          width: 0,
                          height: 0,
                        }}
                      />
                    </div>
                  </div>

                  {/* Time Picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} color="var(--color-accent)" />
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--color-text-2)' }}>
                        Giờ
                      </span>
                    </div>
                    <input
                      type="time"
                      value={schedTime}
                      onChange={(e) => {
                        setSchedTime(e.target.value);
                        setFormError(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface-2)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-text-1)',
                        transition: 'border-color 0.15s ease',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>

                {/* Validation Error Message */}
                {formError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: 'var(--color-danger)',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Note */}
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
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          fontSize: 11.5,
                        }}
                      >
                        <span style={{ color: 'var(--color-text-1)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.title} (Deadline: {s.date} &bull; {s.time})
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
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
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

              {/* ── Danh sách hiện có — luôn hiện đầu tiên ── */}
              {glossary.length > 0 && (
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Thuật ngữ hiện có ({glossary.length})
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                      maxHeight: 180,
                      overflowY: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      paddingRight: 2,
                    }}
                  >
                    {glossary.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          flexShrink: 0,
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          border: editingTermId === t.id ? '1px solid var(--color-accent)' : '1px solid transparent',
                          fontSize: 11.5,
                          overflow: 'hidden',
                        }}
                      >
                        {editingTermId === t.id ? (
                          /* ── Inline edit form ── */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '7px 8px' }}>
                            <input
                              autoFocus
                              type="text"
                              value={editTermName}
                              onChange={(ev) => setEditTermName(ev.target.value)}
                              onClick={(ev) => ev.stopPropagation()}
                              style={{
                                padding: '5px 8px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                fontSize: 12,
                                color: 'var(--color-text-1)',
                                fontWeight: 700,
                                outline: 'none',
                              }}
                            />
                            <input
                              type="text"
                              value={editTermDef}
                              onChange={(ev) => setEditTermDef(ev.target.value)}
                              onClick={(ev) => ev.stopPropagation()}
                              style={{
                                padding: '5px 8px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                fontSize: 11.5,
                                color: 'var(--color-text-1)',
                                outline: 'none',
                              }}
                            />
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button
                                onClick={(ev) => handleSaveTerm(t.id, ev)}
                                style={{
                                  flex: 1,
                                  padding: '5px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'var(--color-accent)',
                                  color: '#fff',
                                  border: 'none',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4,
                                }}
                              >
                                <Check size={11} /> Lưu
                              </button>
                              <button
                                onClick={handleCancelEditTerm}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'var(--color-surface-3, var(--color-surface-2))',
                                  color: 'var(--color-text-2)',
                                  border: '1px solid var(--color-border)',
                                  fontSize: 11,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <X size={11} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── Normal row ── */
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 9px', minWidth: 0 }}>
                            <span style={{ color: 'var(--color-text-1)', flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                              <span style={{ fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, fontSize: 12 }}>{t.term}</span>
                              <span style={{ color: 'var(--color-text-3)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {t.definition}
                              </span>
                            </span>
                            <div style={{ display: 'flex', gap: 2, flexShrink: 0, alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={(ev) => handleStartEditTerm(t, ev)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', padding: 3, display: 'flex', alignItems: 'center' }}
                                title="Sửa"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={(ev) => handleDeleteTerm(t.id, ev)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 3, display: 'flex', alignItems: 'center' }}
                                title="Xóa"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Divider ── */}
              {glossary.length > 0 && (
                <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: 8 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Thêm thuật ngữ mới
                  </div>
                </div>
              )}

              {/* ── Form thêm mới ── */}
              <form onSubmit={handleAddTerm} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  ref={termNameRef}
                  autoFocus
                  type="text"
                  placeholder="Thuật ngữ (VD: EDI, Reefer)..."
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      termDefRef.current?.focus();
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                    outline: 'none',
                  }}
                />
                <input
                  ref={termDefRef}
                  type="text"
                  placeholder="Định nghĩa thuật ngữ..."
                  value={termDef}
                  onChange={(e) => setTermDef(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (termName.trim() && termDef.trim()) {
                        handleAddTerm();
                      }
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                    outline: 'none',
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

              {/* Error message */}
              {glossaryError && (
                <div style={{ fontSize: 11, color: 'var(--color-danger)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.08)' }}>
                  {glossaryError}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
