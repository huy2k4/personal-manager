'use client';

import {
  AlertTriangle,
  Clock,
  Flame,
  Dumbbell,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import type { NavId } from '@/components/layout/BottomNav';
import {
  todayTasks,
  contracts,
  languages,
  cryptoAssets,
  gymSessions,
  nutritionToday,
  workProjects,
} from '@/lib/mock-data';
import ProgressBar from '@/components/ui/ProgressBar';

interface DashboardViewProps {
  onNavigate: (tab: NavId) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  // Stats calculations
  const totalTasks = todayTasks.length;
  const doneTasks = todayTasks.filter((t) => t.done).length;
  const taskPercent = Math.round((doneTasks / totalTasks) * 100);

  const totalFreelanceEarned = contracts.reduce((s, c) => s + c.earned, 0);
  const totalFreelanceGoal = contracts.reduce((s, c) => s + c.total, 0);

  const totalCryptoValue = cryptoAssets.reduce((s, a) => s + a.value, 0);

  const jaLang = languages.find((l) => l.lang === 'JA');
  const enLang = languages.find((l) => l.lang === 'EN');

  const todayGymDone = gymSessions.find((s) => s.date === '2026-09-21')?.done ?? false;
  const proteinRemaining = Math.max(0, nutritionToday.proteinGoal - nutritionToday.protein);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* ─── 1. Thống kê tiến độ nhanh trong ngày ─── */}
      <div className="card bento-full" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <span className="text-xs font-semibold text-2" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tiến độ công việc hôm nay
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>
                {doneTasks}/{totalTasks}
              </span>
              <span className="text-xs text-3">mục xong ({taskPercent}%)</span>
            </div>
          </div>
          <button
            className="card-action"
            onClick={() => onNavigate('work')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
          >
            Tab Việc <ChevronRight size={14} />
          </button>
        </div>
        <ProgressBar value={taskPercent} />
      </div>

      {/* ─── 2. Khối KPI Thống kê 2x2 ─── */}
      <div className="bento-grid" style={{ padding: 0 }}>
        {/* KPI 1: 3 Dự án Việc */}
        <div className="kpi-card" onClick={() => onNavigate('work')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-title">Dự án Việc</span>
            <Briefcase size={14} color="var(--color-accent)" />
          </div>
          <div>
            <div className="kpi-val">{workProjects.length} Active</div>
            <div className="kpi-sub">Maersk • Betonamu • Nam Khánh</div>
          </div>
        </div>

        {/* KPI 2: Tài sản Crypto */}
        <div className="kpi-card" onClick={() => onNavigate('finance')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-title">Crypto</span>
            <span className="badge badge-success" style={{ padding: '1px 5px', fontSize: 10 }}>
              <ArrowUpRight size={10} /> +2.1%
            </span>
          </div>
          <div>
            <div className="kpi-val">${totalCryptoValue.toLocaleString()}</div>
            <div className="kpi-sub">3 đồng coin nắm giữ</div>
          </div>
        </div>

        {/* KPI 3: Sức khỏe & Macro */}
        <div className="kpi-card" onClick={() => onNavigate('health')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-title">Sức khỏe</span>
            <Dumbbell size={14} color={todayGymDone ? 'var(--color-success)' : 'var(--color-warn)'} />
          </div>
          <div>
            <div className="kpi-val">{nutritionToday.calories} kcal</div>
            <div className="kpi-sub">{nutritionToday.protein}g / {nutritionToday.proteinGoal}g protein</div>
          </div>
        </div>

        {/* KPI 4: Học tập & Streak */}
        <div className="kpi-card" onClick={() => onNavigate('study')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-title">Ngoại ngữ</span>
            <Flame size={14} color="var(--color-warn)" />
          </div>
          <div>
            <div className="kpi-val">
              JA {jaLang?.streak}d <span style={{ fontSize: 14, color: 'var(--color-text-3)' }}>• EN {enLang?.streak}d</span>
            </div>
            <div className="kpi-sub">Chuỗi học liên tục</div>
          </div>
        </div>
      </div>

      {/* ─── 3. Khối Cảnh báo & Chú ý quan trọng ─── */}
      <div className="card bento-full">
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="card-title" style={{ margin: 0 }}>
              <AlertTriangle size={15} color="var(--color-danger)" />
              Cảnh báo & Lịch hẹn quan trọng
            </span>
          </div>
          <span className="badge badge-danger" style={{ fontWeight: 600 }}>4 nhắc nhở</span>
        </div>

        <div className="alert-list">
          {/* Cảnh báo 1: Lịch chốt hợp đồng Nam Khánh 20h 22/9 */}
          <div className="alert-item warn">
            <Calendar size={18} color="var(--color-warn)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div className="alert-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="alert-title">Lịch hẹn Nam Khánh — Xuất khẩu chuối</span>
                <span className="badge badge-warn" style={{ fontSize: 10 }}>20:00 22/09</span>
              </div>
              <p className="alert-desc">
                <strong>Liên lạc với anh ABC</strong> để chốt hợp đồng website. Chuẩn bị tài liệu & thống nhất phương án triển khai.
              </p>
              <button
                className="alert-action-btn"
                onClick={() => onNavigate('work')}
              >
                Mở card Nam Khánh <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Cảnh báo 2: Nguy cơ đứt Streak Tiếng Nhật */}
          {jaLang && !jaLang.todayDone && (
            <div className="alert-item danger">
              <Flame size={18} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div className="alert-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="alert-title">Nguy cơ đứt streak Tiếng Nhật!</span>
                  <span className="badge badge-danger" style={{ fontSize: 10 }}>Hôm nay</span>
                </div>
                <p className="alert-desc">
                  Chưa học bài hôm nay: <strong>{jaLang.nextLesson}</strong> ({jaLang.level}). Cần hoàn thành trước 23:59 để giữ streak {jaLang.streak} ngày.
                </p>
                <button
                  className="alert-action-btn"
                  onClick={() => onNavigate('study')}
                >
                  Mở tab Học tập <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Cảnh báo 3: Review UI Mockup Betonamu */}
          <div className="alert-item accent">
            <Clock size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div className="alert-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="alert-title">Họp review UI Web Betonamu</span>
                <span className="badge badge-accent" style={{ fontSize: 10 }}>10:00 22/09</span>
              </div>
              <p className="alert-desc">
                Review mockup với PM bên Nhật. Kiểm tra lại bản vẽ Figma và ghi chú các thuật ngữ tiếng Nhật trong Specification.
              </p>
              <button
                className="alert-action-btn"
                onClick={() => onNavigate('work')}
              >
                Mở card Betonamu <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Cảnh báo 4: Thiếu protein & Chưa tập gym */}
          {!todayGymDone && (
            <div className="alert-item warn">
              <Dumbbell size={18} color="var(--color-warn)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div className="alert-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="alert-title">Chưa tập Gym & Thiếu Protein</span>
                  <span className="badge badge-warn" style={{ fontSize: 10 }}>Thiếu {proteinRemaining}g</span>
                </div>
                <p className="alert-desc">
                  Lịch tập hôm nay: <strong>Push Day</strong> (Ngực, Tay sau, Vai). Mục tiêu protein còn thiếu {proteinRemaining}g.
                </p>
                <button
                  className="alert-action-btn"
                  onClick={() => onNavigate('health')}
                >
                  Mở tab Sức khỏe <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
