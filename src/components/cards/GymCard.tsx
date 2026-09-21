import { gymSessions, nutritionToday } from '@/lib/mock-data';
import ProgressBar from '@/components/ui/ProgressBar';

interface MacroRowProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
}

function MacroRow({ label, value, goal, unit }: MacroRowProps) {
  const pct = Math.round((value / goal) * 100);
  const variant = pct >= 90 ? 'success' : pct >= 60 ? 'default' : 'warn';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span className="text-xs text-2">{label}</span>
        <span className="text-xs font-medium text-1">{value}<span className="text-3">/{goal}{unit}</span></span>
      </div>
      <ProgressBar value={pct} variant={variant} />
    </div>
  );
}

export default function GymCard() {
  const todaySession = gymSessions[0];
  const nt = nutritionToday;

  // Last 5 days workout dots
  const last5 = gymSessions.slice(0, 5);

  return (
    <div className="card bento-full">
      <div className="card-header">
        <span className="card-title">🏋️ Gym & Dinh dưỡng</span>
        <span
          className="text-xs font-medium"
          style={{
            color: todaySession.done ? 'var(--color-success)' : 'var(--color-warn)',
          }}
        >
          {todaySession.done ? '✓ Done' : '○ Chưa tập'}
        </span>
      </div>

      {/* Today session */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          background: todaySession.done ? 'var(--color-success-bg)' : 'var(--color-warn-bg)',
          border: `1px solid ${todaySession.done ? 'rgba(22,163,74,0.15)' : 'rgba(217,119,6,0.15)'}`,
          marginBottom: 12,
        }}
      >
        <div className="text-sm font-semibold text-1">
          {todaySession.muscles.join(' · ')}
        </div>
        <div className="text-xs text-2" style={{ marginTop: 2 }}>
          {todaySession.done && todaySession.duration
            ? `${todaySession.duration} phút`
            : 'Push Day — 21:00 tối nay'}
        </div>
      </div>

      {/* Streak dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <span className="text-xs text-3">7 ngày:</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {last5.map((s, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: !s.done
                  ? 'var(--color-border)'
                  : i === 0
                  ? 'var(--color-warn)'
                  : 'var(--color-success)',
              }}
              title={s.date}
            />
          ))}
        </div>
      </div>

      {/* Nutrition */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <MacroRow label="Calo" value={nt.calories} goal={nt.caloriesGoal} unit=" kcal" />
        <MacroRow label="Protein" value={nt.protein} goal={nt.proteinGoal} unit="g" />
        <MacroRow label="Carbs" value={nt.carbs} goal={nt.carbsGoal} unit="g" />
        <MacroRow label="Fat" value={nt.fat} goal={nt.fatGoal} unit="g" />
      </div>
    </div>
  );
}
