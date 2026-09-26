'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRefresh } from '@/lib/refresh-context';
import { workProjects as fallbackProjects } from '@/lib/mock-data';
import { fetchWorkProjects } from '@/lib/supabase/services';
import type { WorkProject } from '@/types';

const VN_ZONE   = 'Asia/Ho_Chi_Minh';
const MONTH_ABR = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DAY_ABR   = ['S','M','T','W','T','F','S'];
const DAY_PX    = 46;
const COL_H     = 34;

function getVNToday(): Date {
  const iso = new Intl.DateTimeFormat('sv-SE', { timeZone: VN_ZONE }).format(new Date());
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function toDDMM(d: Date): string {
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

const PROJ_COLORS: Record<string,string> = {
  maersk:      '#2563EB',
  betonamu:    '#DC2626',
  'nam-khanh': '#16A34A',
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playHapticTick() {
  try {
    // 1. Hardware vibration for Android
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(8);
    }
    // 2. Sub-bass acoustic haptic pulse for iOS
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(56, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.013);
    
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.013);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.014);
  } catch {
    // Fallback gracefully
  }
}

export default function WorkProgressCard() {
  const { isRefreshing, registerRefreshHandler } = useRefresh();
  const [projects, setProjects] = useState<WorkProject[]>(fallbackProjects);

  const loadData = useCallback(async () => {
    const data = await fetchWorkProjects();
    if (data && data.length > 0) {
      setProjects(data as WorkProject[]);
    }
  }, []);

  useEffect(() => {
    loadData();
    return registerRefreshHandler('work-progress-card', loadData);
  }, [loadData, registerRefreshHandler]);

  const today     = useRef(getVNToday()).current;
  const todayDDMM = toDDMM(today);

  const offsetRef = useRef(0);
  const [windowOffset, _setOff] = useState(0);
  const setOffset = useCallback((n: number) => { _setOff(n); offsetRef.current = n; }, []);

  const days      = Array.from({ length: 7 }, (_, i) => addDays(addDays(today, windowOffset), i));
  const windowSet = new Set(days.map(toDDMM));

  const projStats = projects.map(p => ({
    id: p.id, name: p.name, logoUrl: p.logoUrl,
    color: PROJ_COLORS[p.id] ?? '#6B6B6B',
    count: (p.schedules || []).filter(s => windowSet.has(s.date)).length,
  }));
  const maxProj = Math.max(...projStats.map(s => s.count), 1);

  const dayCounts = days.map(day => {
    const dm = toDDMM(day);
    return projects.reduce((s, p) => s + (p.schedules || []).filter(x => x.date === dm).length, 0);
  });
  const maxDay = Math.max(...dayCounts, 1);

  // ── Drag + high momentum (up to 13 days) ──────────────────────────────────
  const cardRef      = useRef<HTMLDivElement>(null);
  const tmr          = useRef<ReturnType<typeof setTimeout>|null>(null);

  const killTimer = () => { if (tmr.current) { clearTimeout(tmr.current); tmr.current = null; } };

  const startMomentum = useCallback((targetOffset: number) => {
    killTimer();
    const cur = offsetRef.current;
    const totalSteps = Math.abs(targetOffset - cur);
    if (totalSteps === 0) return;

    const step = (remaining: number) => {
      const current = offsetRef.current;
      if (current === targetOffset) return;
      
      const next = current + Math.sign(targetOffset - current);
      setOffset(next);
      playHapticTick();
      
      const left = Math.abs(targetOffset - next);
      if (left > 0) {
        // Natural ease-out deceleration curve: fast at start (~22ms), slow at end (~135ms)
        const progress = (totalSteps - left) / totalSteps;
        const delay = Math.round(22 + Math.pow(progress, 1.7) * 115);
        tmr.current = setTimeout(() => step(left), delay);
      }
    };

    step(totalSteps);
  }, [setOffset]);

  // Touch gesture with strict direction locking & preventDefault on horizontal swipe
  const touchState = useRef({
    startX: 0,
    startY: 0,
    baseOff: 0,
    isH: null as boolean | null,
    isLocked: false,
    history: [] as { x: number; t: number }[],
    active: false,
  });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      killTimer();
      getAudioContext();
      const t = e.touches[0];
      touchState.current = {
        startX: t.clientX,
        startY: t.clientY,
        baseOff: offsetRef.current,
        isH: null,
        isLocked: false,
        history: [{ x: t.clientX, t: e.timeStamp }],
        active: true,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      const s = touchState.current;
      if (!s.active) return;

      const t = e.touches[0];
      const dx = t.clientX - s.startX;
      const dy = t.clientY - s.startY;

      // Lock direction after 7px displacement
      if (!s.isLocked) {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (absX >= 7 || absY >= 7) {
          s.isLocked = true;
          // Horizontal intent: horizontal distance clearly beats vertical
          s.isH = absX > absY * 1.15;
        }
      }

      // If locked horizontal: prevent native page scroll and shift days
      if (s.isH === true) {
        if (e.cancelable) {
          e.preventDefault();
        }
        const now = e.timeStamp;
        s.history.push({ x: t.clientX, t: now });
        s.history = s.history.filter(p => now - p.t <= 120);

        const shift = -Math.round(dx / DAY_PX);
        const newOff = s.baseOff + shift;
        if (newOff !== offsetRef.current) {
          setOffset(newOff);
          playHapticTick();
        }
      }
      // If locked vertical (s.isH === false): do nothing, browser scrolls smoothly
    };

    const onTouchEnd = (e: TouchEvent) => {
      const s = touchState.current;
      if (!s.active) return;
      s.active = false;

      if (s.isH === true) {
        const history = s.history;
        let vel = 0;
        if (history.length >= 2) {
          const first = history[0];
          const last  = history[history.length - 1];
          const dt    = Math.max(last.t - first.t, 10);
          vel = (first.x - last.x) / dt;
        }

        if (Math.abs(vel) > 0.12) {
          const rawSteps = Math.round(Math.abs(vel) * 5.2);
          const mom = Math.sign(vel) * Math.min(Math.max(rawSteps, 1), 13);
          if (mom !== 0) {
            startMomentum(offsetRef.current + mom);
          }
        }
      }

      s.isH = null;
      s.isLocked = false;
      s.history = [];
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [setOffset, startMomentum]);

  // Desktop mouse drag handlers
  const mouseState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    baseOff: 0,
    isH: null as boolean | null,
    isLocked: false,
    history: [] as { x: number; t: number }[],
  });

  const onMouseDown = (e: React.MouseEvent) => {
    killTimer();
    getAudioContext();
    mouseState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseOff: offsetRef.current,
      isH: null,
      isLocked: false,
      history: [{ x: e.clientX, t: e.timeStamp }],
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const s = mouseState.current;
    if (!s.active || e.buttons !== 1) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.isLocked) {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX >= 5 || absY >= 5) {
        s.isLocked = true;
        s.isH = absX >= absY;
      }
    }
    if (s.isH) {
      const now = e.timeStamp;
      s.history.push({ x: e.clientX, t: now });
      s.history = s.history.filter(p => now - p.t <= 120);

      const shift = -Math.round(dx / DAY_PX);
      const newOff = s.baseOff + shift;
      if (newOff !== offsetRef.current) {
        setOffset(newOff);
        playHapticTick();
      }
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    const s = mouseState.current;
    if (!s.active) return;
    s.active = false;
    if (s.isH) {
      const history = s.history;
      let vel = 0;
      if (history.length >= 2) {
        const first = history[0];
        const last  = history[history.length - 1];
        const dt    = Math.max(last.t - first.t, 10);
        vel = (first.x - last.x) / dt;
      }
      if (Math.abs(vel) > 0.12) {
        const rawSteps = Math.round(Math.abs(vel) * 5.2);
        const mom = Math.sign(vel) * Math.min(Math.max(rawSteps, 1), 13);
        if (mom !== 0) {
          startMomentum(offsetRef.current + mom);
        }
      }
    }
  };

  const first = days[0];

  return (
    <div
      ref={cardRef}
      className="card bento-full"
      style={{ padding: '16px 14px 12px', userSelect:'none', touchAction:'pan-y', cursor: 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* ── Header: month + date range ─────────────────────────── */}
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:11, fontWeight:800, letterSpacing:'0.12em', color:'var(--color-accent)' }}>
          {MONTH_ABR[first.getMonth()]}
        </span>
        <span style={{ fontSize:10, color:'var(--color-text-3)', fontVariantNumeric:'tabular-nums' }}>
          {first.getDate()}/{first.getMonth()+1} &ndash; {days[6].getDate()}/{days[6].getMonth()+1}
        </span>
      </div>

      {/* ── Column chart + day labels ──────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        {/* Bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: COL_H, margin: '0 auto', width: 'fit-content' }}>
          {days.map((day, i) => {
            const dm      = toDDMM(day);
            const isToday = dm === todayDDMM;
            const isPast  = day < today && !isToday;
            const cnt     = dayCounts[i];
            const barH    = isRefreshing ? 3 : (cnt === 0 ? 3 : Math.max(7, (cnt / maxDay) * COL_H));
            const bg      = isToday
              ? 'var(--color-accent)'
              : isPast ? 'rgba(37,99,235,0.22)' : 'rgba(37,99,235,0.10)';
            return (
              <div key={i} style={{ width: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                <div style={{
                  width: '100%', height: barH,
                  background: bg,
                  borderRadius: '3px 3px 2px 2px',
                  transition: 'height 0.28s ease, background 0.2s',
                }} />
              </div>
            );
          })}
        </div>

        {/* Day of week labels */}
        <div style={{ display: 'flex', gap: 5, marginTop: 4, margin: '4px auto 0', width: 'fit-content' }}>
          {days.map((day, i) => {
            const dm      = toDDMM(day);
            const isToday = dm === todayDDMM;
            return (
              <div key={i} style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  fontSize: 9,
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? 'var(--color-accent)' : 'var(--color-text-3)',
                  lineHeight: 1,
                }}>
                  {DAY_ABR[day.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────── */}
      <div style={{ height: 1, background: 'var(--color-border-2)', marginBottom: 10 }} />

      {/* ── Per-project horizontal bars ────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {projStats.map(p => {
          const pct   = isRefreshing ? 0 : ((p.count / maxProj) * 100);
          const empty = p.count === 0 || isRefreshing;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ minWidth: 86, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexShrink: 0, height: 22 }}>
                {p.logoUrl ? (
                  <img
                    src={p.logoUrl}
                    alt={p.name}
                    style={{
                      height: 18,
                      width: 'auto',
                      maxHeight: 20,
                      objectFit: 'contain',
                      opacity: empty ? 0.35 : 1,
                      display: 'block',
                      transition: 'opacity 0.25s ease',
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize: 13.5,
                    fontWeight: 650,
                    textAlign: 'right',
                    color: empty ? 'var(--color-text-3)' : 'var(--color-text-2)',
                    letterSpacing: '0.01em',
                    lineHeight: 1,
                    transition: 'color 0.25s ease',
                  }}>
                    {p.name}
                  </span>
                )}
              </div>
              <div style={{
                flex: 1, height: 4.5, background: 'var(--color-border-2)',
                borderRadius: 99, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: p.color,
                  borderRadius: 99,
                  opacity: empty ? 0 : 0.85,
                  transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: empty ? 'var(--color-text-3)' : 'var(--color-text-2)',
                minWidth: 16,
                textAlign: 'right',
                flexShrink: 0,
              }}>
                {isRefreshing ? '---' : p.count}
              </span>
            </div>
          );
        })}
      </div>


    </div>
  );
}