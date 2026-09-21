import { Languages } from 'lucide-react';
import { languages } from '@/lib/mock-data';
import ProgressBar from '@/components/ui/ProgressBar';

const LANG_COLORS: Record<string, string> = {
  EN: '#2563EB',
  JA: '#DC2626',
};

export default function LanguageCard() {
  return (
    <div className="card bento-full">
      <div className="card-header">
        <span className="card-title">
          <Languages size={14} strokeWidth={2} />
          Ngoại ngữ
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {languages.map((lang) => (
          <div
            key={lang.lang}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-2)',
              background: 'var(--color-surface-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: LANG_COLORS[lang.lang] }}>
                {lang.lang}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 99,
                background: lang.todayDone ? 'var(--color-success-bg)' : 'var(--color-warn-bg)',
                color: lang.todayDone ? 'var(--color-success)' : 'var(--color-warn)',
              }}>
                {lang.todayDone ? 'Done' : 'Pending'}
              </span>
            </div>

            <div style={{ marginBottom: 6 }}>
              <div className="text-2xl font-bold text-1">{lang.streak}</div>
              <div className="text-xs text-3">ngày streak</div>
            </div>

            <ProgressBar value={Math.round((lang.xp / lang.xpGoal) * 100)} />
            <div className="text-xs text-3" style={{ marginTop: 4 }}>
              {lang.xp}/{lang.xpGoal} XP · {lang.level}
            </div>

            <div className="text-xs text-2" style={{ marginTop: 6, fontStyle: 'italic', lineHeight: 1.4 }}>
              {lang.nextLesson}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
