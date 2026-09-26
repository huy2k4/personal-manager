'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { JP, GB, US } from 'country-flag-icons/react/3x2';
import type { NavId } from '@/components/layout/BottomNav';

const VN_ZONE = 'Asia/Ho_Chi_Minh';

/** Extract date/time parts for a given IANA timezone. */
function getDisplayParts(date: Date, zone: string) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  return {
    weekday: map.weekday,    // 'Mon' | 'Tue' | ...
    day:     parseInt(map.day),
    month:   parseInt(map.month) - 1, // 0-indexed
    hour:    map.hour,      // already padded '09'
    minute:  map.minute,    // already padded '30'
  };
}

const MONTH_NAMES = [
  'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
  'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12',
];

const TAB_TITLES: Record<NavId, { label: string; sub: string }> = {
  dashboard: { label: 'Dashboard', sub: 'Thống kê & Cảnh báo' },
  work:      { label: 'Việc',      sub: 'Công việc & Giảng dạy' },
  finance:   { label: 'Tài chính', sub: 'Dòng tiền & Đầu tư' },
  health:    { label: 'Sức khỏe', sub: 'Gym & Dinh dưỡng' },
  study:     { label: 'Học tập',  sub: 'Ngoại ngữ & Đồ án' },
  account:   { label: 'Tài khoản', sub: 'Hồ sơ & Quản trị' },
};

// ─── Market sessions ─────────────────────────────────────────────────────────
// All open/close times are the exchange's local time; Intl API handles DST automatically.
const SESSIONS = [
  { label: 'TYO', Flag: JP, title: 'Tokyo',    zone: 'Asia/Tokyo',       openH: 9,  openM: 0,  closeH: 15, closeM: 30 },
  { label: 'LDN', Flag: GB, title: 'London',   zone: 'Europe/London',    openH: 8,  openM: 0,  closeH: 16, closeM: 30 },
  { label: 'NYC', Flag: US, title: 'New York', zone: 'America/New_York', openH: 9,  openM: 30, closeH: 16, closeM: 0  },
];

/** Parse date parts in a given IANA timezone. */
function tzParts(date: Date, zone: string) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  return { weekday: map.weekday, h: parseInt(map.hour), m: parseInt(map.minute) };
}

/**
 * Returns the next open Date (UTC) for a session.
 * If currently open, returns the close time instead (for "OPEN" state).
 */
function nextSessionOpen(now: Date, zone: string, openH: number, openM: number, closeH: number, closeM: number) {
  const { weekday, h, m } = tzParts(now, zone);
  const isWeekend = weekday === 'Sat' || weekday === 'Sun';
  const curMins   = h * 60 + m;
  const openMins  = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;

  // Currently open?
  if (!isWeekend && curMins >= openMins && curMins < closeMins) {
    return { open: true, minsUntilOpen: 0 };
  }

  // Minutes until next open
  let daysAhead: number;
  if (isWeekend) {
    daysAhead = weekday === 'Sat' ? 2 : 1;
  } else if (curMins >= closeMins) {
    daysAhead = weekday === 'Fri' ? 3 : 1;
  } else {
    daysAhead = 0; // same day, before open
  }

  const minsUntilOpen = daysAhead * 24 * 60 - curMins + openMins;
  return { open: false, minsUntilOpen };
}



function padTwo(n: number) { return String(n).padStart(2, '0'); }
function formatCountdown(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  // Use 'g' (giờ) as separator so "57g24" is clearly hours·minutes, not mm:ss.
  return `${h}g${padTwo(m)}`;
}

interface StatusBarProps {
  activeTab?: NavId;
}

export default function StatusBar({ activeTab = 'dashboard' }: StatusBarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Align to next whole-second boundary to minimise clock display lag.
    const msUntilNextSec = 1000 - (Date.now() % 1000);
    let raf: number;
    const timeout = setTimeout(() => {
      setNow(new Date());
      let last = Date.now();
      const tick = () => {
        const t = Date.now();
        if (t - last >= 1000) {
          last = t - (t % 1000);
          setNow(new Date(t));
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, msUntilNextSec);

    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, []);

  // All display values from VN timezone — ignores device locale.
  const vnParts  = getDisplayParts(now, VN_ZONE);
  const DAY_VI   = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
  const MONTH_VI = ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6',
                    'tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12'];
  const EN_TO_VI: Record<string, string> = {
    Sun: 'Chủ nhật', Mon: 'Thứ hai', Tue: 'Thứ ba',
    Wed: 'Thứ tư',   Thu: 'Thứ năm', Fri: 'Thứ sáu', Sat: 'Thứ bảy',
  };
  const dayName = EN_TO_VI[vnParts.weekday] ?? vnParts.weekday;
  const dateStr = `${vnParts.day} ${MONTH_VI[vnParts.month]}`;
  const hours   = vnParts.hour;
  const minutes = vnParts.minute;

  const tabInfo = TAB_TITLES[activeTab];

  return (
    <div className="status-bar">
      {/* ── Row 1: clock + tab badge ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-xs text-2">{dayName}, {dateStr}</div>
          <div style={{
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-1)',
            fontFamily: 'var(--font-mono)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {hours}:{minutes}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span className="badge badge-accent">{tabInfo.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} color="var(--color-text-3)" />
            <span className="text-xs text-3">{tabInfo.sub}</span>
          </div>
        </div>
      </div>

      {/* ── Row 2: market sessions in VN time ─────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginTop: 8,
        paddingTop: 6,
        borderTop: '1px solid var(--color-border-2)',
      }}>
        {SESSIONS.map(({ label, Flag, title, zone, openH, openM, closeH, closeM }) => {
          const { open, minsUntilOpen } = nextSessionOpen(now, zone, openH, openM, closeH, closeM);
          return (
            <div
              key={label}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '5px 4px',
                borderRadius: 'var(--radius-sm)',
                background: open ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
                border: `1px solid ${open ? 'var(--color-accent-ring)' : 'var(--color-border-2)'}`,
              }}
            >
              {/* 1. Cờ (Flag SVG) */}
              <Flag
                title={title}
                style={{
                  width: 15,
                  height: 10.5,
                  borderRadius: 2,
                  boxShadow: '0 0 1px rgba(0,0,0,0.3)',
                  flexShrink: 0,
                }}
              />

              {/* 2. Tên phiên (Session label) */}
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: open ? 'var(--color-accent)' : 'var(--color-text-3)',
                flexShrink: 0,
              }}>
                {label}
              </span>

              {/* 3. Thời gian / Trạng thái (Countdown / Status) */}
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
                color: open ? 'var(--color-accent)' : 'var(--color-text-1)',
                flexShrink: 0,
              }}>
                {open ? 'MỞ' : formatCountdown(minsUntilOpen)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
