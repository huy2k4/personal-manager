'use client';

import {
  AlertTriangle,
  Clock,
  Flame,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import type { NavId } from '@/components/layout/BottomNav';
import { languages } from '@/lib/mock-data';
import WorkProgressCard from '@/components/cards/WorkProgressCard';
import CryptoChartCard from '@/components/cards/CryptoChartCard';

interface DashboardViewProps {
  onNavigate: (tab: NavId) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const jaLang = languages.find((l) => l.lang === 'JA');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* ─── 1. Work Progress Card (4x2) ─── */}
      <WorkProgressCard />

      {/* ─── 2. Crypto Chart Card (4x1) ─── */}
      <CryptoChartCard />

      {/* ─── 3. Khối Cảnh báo & Chú ý quan trọng ─── */}
      <div className="card bento-full">
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="card-title" style={{ margin: 0 }}>
              <AlertTriangle size={15} color="var(--color-danger)" />
              Cảnh báo & Lịch hẹn quan trọng
            </span>
          </div>
          <span className="badge badge-danger" style={{ fontWeight: 600 }}>3 nhắc nhở</span>
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
        </div>
      </div>
    </div>
  );
}
