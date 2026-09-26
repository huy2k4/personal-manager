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

  // ── Drag + momentum ─────────────────────────────────────────────────────
  const startX   = useRef<number|null>(null);
  const startY   = useRef(0);
  const isH      = useRef<boolean|null>(null);
  const baseOff  = useRef(0);
  const lastX    = useRef(0);
  const lastT    = useRef(0);
  const tmr      = useRef<ReturnType<typeof setTimeout>|null>(null);

  const buzz = () => { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(7); };
  const killTimer = () => { if (tmr.current) { clearTimeout(tmr.current); tmr.current = null; } };

  const momentRef = useRef<(t: number) => void>(undefined!);
  momentRef.current = (target: number) => {
    killTimer();
    const cur = offsetRef.current;
    if (cur === target) return;
    const next = cur + Math.sign(target - cur);
    setOffset(next);
    buzz();
    const left = Math.abs(target - next);
    if (left > 0) {
      const elapsed = Math.abs(target - cur) - left;
      tmr.current = setTimeout(() => momentRef.current(target), Math.min(50 + elapsed * 20, 200));
    }
  };

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    killTimer();
    startX.current  = e.touches[0].clientX;
    startY.current  = e.touches[0].clientY;
    lastX.current   = e.touches[0].clientX;
    lastT.current   = e.timeStamp;
    baseOff.current = offsetRef.current;
    isH.current     = null;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (isH.current === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isH.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isH.current) return;
    const shift  = -Math.round(dx / DAY_PX);
    const newOff = baseOff.current + shift;
    if (newOff !== offsetRef.current) { setOffset(newOff); buzz(); }
    lastX.current = e.touches[0].clientX;
    lastT.current = e.timeStamp;
  }, [setOffset]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (startX.current === null || !isH.current) return;
    const endX  = e.changedTouches[0].clientX;
    const dt    = Math.max(e.timeStamp - lastT.current, 1);
    const vel   = (lastX.current - endX) / dt;
    const mom   = Math.sign(vel) * Math.min(Math.round(Math.abs(vel) * 300 / DAY_PX), 9);
    startX.current = null;
    momentRef.current(offsetRef.current + mom);
  }, []);

  const first = days[0];

  return (
    <div
      className="card bento-full"
      style={{ padding: '16px 14px 12px', userSelect:'none', touchAction:'pan-y' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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