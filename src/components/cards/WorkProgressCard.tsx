'use client';

import { useState, useRef, useCallback } from 'react';
import { workProjects } from '@/lib/mock-data';

const VN_ZONE   = 'Asia/Ho_Chi_Minh';
const MONTH_ABR = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DAY_ABR   = ['S','M','T','W','T','F','S'];
const DAY_PX    = 46;
const COL_H     = 44;

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
  const today     = useRef(getVNToday()).current;
  const todayDDMM = toDDMM(today);

  const offsetRef = useRef(0);
  const [windowOffset, _setOff] = useState(0);
  const setOffset = useCallback((n: number) => { _setOff(n); offsetRef.current = n; }, []);

  const days      = Array.from({ length: 7 }, (_, i) => addDays(addDays(today, windowOffset), i));
  const windowSet = new Set(days.map(toDDMM));

  const projStats = workProjects.map(p => ({
    id: p.id, name: p.name, logoUrl: p.logoUrl,
    color: PROJ_COLORS[p.id] ?? '#6B6B6B',
    count: p.schedules.filter(s => windowSet.has(s.date)).length,
  }));
  const maxProj = Math.max(...projStats.map(s => s.count), 1);

  const dayCounts = days.map(day => {
    const dm = toDDMM(day);
    return workProjects.reduce((s, p) => s + p.schedules.filter(x => x.date === dm).length, 0);
  });
  const maxDay = Math.max(...dayCounts, 1);

  // ── Drag + high momentum (up to 13 days) ──────────────────────────────────
  const startX       = useRef<number|null>(null);
  const startY       = useRef(0);
  const isH          = useRef<boolean|null>(null);
  const baseOff      = useRef(0);
  const touchHistory = useRef<{ x: number; t: number }[]>([]);
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
        // Natural ease-out deceleration curve: fast at start (~24ms), slow at end (~135ms)
        const progress = (totalSteps - left) / totalSteps;
        const delay = Math.round(22 + Math.pow(progress, 1.7) * 115);
        tmr.current = setTimeout(() => step(left), delay);
      }
    };

    step(totalSteps);
  }, [setOffset]);

  const handlePointerStart = (clientX: number, clientY: number, timeStamp: number) => {
    killTimer();
    getAudioContext();
    startX.current  = clientX;
    startY.current  = clientY;
    baseOff.current = offsetRef.current;
    isH.current     = null;
    touchHistory.current = [{ x: clientX, t: timeStamp }];
  };

  const handlePointerMove = (clientX: number, clientY: number, timeStamp: number) => {
    if (startX.current === null) return;
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;
    if (isH.current === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isH.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isH.current) return;
    
    // Store points within the last 120ms
    touchHistory.current.push({ x: clientX, t: timeStamp });
    const cutoff = timeStamp - 120;
    touchHistory.current = touchHistory.current.filter(p => p.t >= cutoff);

    const shift  = -Math.round(dx / DAY_PX);
    const newOff = baseOff.current + shift;
    if (newOff !== offsetRef.current) {
      setOffset(newOff);
      playHapticTick();
    }
  };

  const handlePointerEnd = (timeStamp: number) => {
    if (startX.current === null || !isH.current) {
      startX.current = null;
      touchHistory.current = [];
      return;
    }
    const history = touchHistory.current;
    let vel = 0;
    if (history.length >= 2) {
      const first = history[0];
      const last  = history[history.length - 1];
      const dt    = Math.max(last.t - first.t, 10);
      vel = (first.x - last.x) / dt; // px per ms (positive when swiped left -> next days)
    }
    startX.current = null;
    touchHistory.current = [];

    // Map velocity to momentum steps: max 13 days
    if (Math.abs(vel) > 0.12) {
      const rawSteps = Math.round(Math.abs(vel) * 5.2);
      const mom = Math.sign(vel) * Math.min(Math.max(rawSteps, 1), 13);
      if (mom !== 0) {
        startMomentum(offsetRef.current + mom);
      }
    }
  };

  const first = days[0];

  return (
    <div
      className="card bento-full"
      style={{ padding: '16px 14px 12px', userSelect:'none', touchAction:'pan-y', cursor: 'grab' }}
      onTouchStart={(e) => handlePointerStart(e.touches[0].clientX, e.touches[0].clientY, e.timeStamp)}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY, e.timeStamp)}
      onTouchEnd={(e) => handlePointerEnd(e.timeStamp)}
      onMouseDown={(e) => handlePointerStart(e.clientX, e.clientY, e.timeStamp)}
      onMouseMove={(e) => { if (e.buttons === 1) handlePointerMove(e.clientX, e.clientY, e.timeStamp); }}
      onMouseUp={(e) => handlePointerEnd(e.timeStamp)}
      onMouseLeave={(e) => { if (startX.current !== null) handlePointerEnd(e.timeStamp); }}
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
      <div style={{ marginBottom:12 }}>
        {/* Bars */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:5, height: COL_H, margin:'0 auto', width:'fit-content' }}>
          {days.map((day, i) => {
            const dm      = toDDMM(day);
            const isToday = dm === todayDDMM;
            const isPast  = day < today && !isToday;
            const cnt     = dayCounts[i];
            const barH    = cnt === 0 ? 3 : Math.max(8, (cnt / maxDay) * COL_H);
            const bg      = isToday
              ? 'var(--color-accent)'
              : isPast ? 'rgba(37,99,235,0.22)' : 'rgba(37,99,235,0.10)';
            return (
              <div key={i} style={{ width:28, display:'flex', alignItems:'flex-end', justifyContent:'center', height:'100%' }}>
                <div style={{
                  width:'100%', height: barH,
                  background: bg,
                  borderRadius:'3px 3px 2px 2px',
                  transition:'height 0.28s ease, background 0.2s',
                }} />
              </div>
            );
          })}
        </div>

        {/* Day of week labels + today dot */}
        <div style={{ display:'flex', gap:5, marginTop:4, margin:'4px auto 0', width:'fit-content' }}>
          {days.map((day, i) => {
            const dm      = toDDMM(day);
            const isToday = dm === todayDDMM;
            return (
              <div key={i} style={{ width:28, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <span style={{
                  fontSize: 9, fontWeight: isToday ? 700 : 400,
                  color: isToday ? 'var(--color-accent)' : 'var(--color-text-3)',
                  lineHeight:1,
                }}>
                  {DAY_ABR[day.getDay()]}
                </span>
                {isToday && (
                  <div style={{ width:4, height:4, borderRadius:'50%', background:'var(--color-accent)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────── */}
      <div style={{ height:1, background:'var(--color-border-2)', marginBottom:10 }} />

      {/* ── Per-project horizontal bars ────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {projStats.map(p => {
          const pct   = (p.count / maxProj) * 100;
          const empty = p.count === 0;
          return (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ minWidth:66, display:'flex', justifyContent:'flex-end', alignItems:'center', flexShrink:0, height:14 }}>
                {p.logoUrl ? (
                  <img
                    src={p.logoUrl}
                    alt={p.name}
                    style={{
                      height: 11,
                      width: 'auto',
                      maxHeight: 13,
                      objectFit: 'contain',
                      opacity: empty ? 0.35 : 1,
                      display: 'block',
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize:10, fontWeight:600, textAlign:'right',
                    color: empty ? 'var(--color-text-3)' : 'var(--color-text-2)',
                    letterSpacing:'0.01em',
                    lineHeight: 1,
                  }}>
                    {p.name}
                  </span>
                )}
              </div>
              <div style={{
                flex:1, height:6, background:'var(--color-border-2)',
                borderRadius:99, overflow:'hidden',
              }}>
                <div style={{
                  width:`${pct}%`, height:'100%',
                  background: p.color,
                  borderRadius:99,
                  opacity: empty ? 0 : 0.8,
                  transition:'width 0.35s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <span style={{
                fontSize:10, fontWeight:700, fontVariantNumeric:'tabular-nums',
                color: empty ? 'var(--color-text-3)' : 'var(--color-text-2)',
                minWidth:14, textAlign:'right', flexShrink:0,
              }}>
                {p.count}
              </span>
            </div>
          );
        })}
      </div>


    </div>
  );
}