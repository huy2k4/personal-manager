import { lessons } from '@/lib/mock-data';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return 'Hôm nay';
  if (d.toDateString() === tomorrow.toDateString()) return 'Ngày mai';
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function TeachCard() {
  const nextLesson = lessons[0];

  return (
    <div className="card bento-full">
      <div className="card-header">
        <span className="card-title">🎓 Dạy Scratch</span>
        <span className="text-xs text-accent font-medium">{lessons.length} buổi sắp tới</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lessons.map((lesson, idx) => (
          <div
            key={lesson.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              background: idx === 0 ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
              border: `1px solid ${idx === 0 ? 'rgba(37,99,235,0.15)' : 'var(--color-border-2)'}`,
            }}
          >
            <div style={{ textAlign: 'center', minWidth: 36 }}>
              <div className="text-xs font-semibold" style={{ color: idx === 0 ? 'var(--color-accent)' : 'var(--color-text-3)' }}>
                {lesson.time}
              </div>
              <div className="text-xs text-3">{formatDate(lesson.date)}</div>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--color-border)' }} />
            <div style={{ flex: 1 }}>
              <div className="text-sm font-medium text-1">{lesson.topic}</div>
              <div className="text-xs text-2">{lesson.student}</div>
            </div>
            {idx === 0 && (
              <span className="badge badge-accent">Tiếp theo</span>
            )}
          </div>
        ))}
      </div>

      {nextLesson && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border-2)' }}>
          <span className="text-xs text-3">Cần chuẩn bị: Slide {nextLesson.topic}</span>
        </div>
      )}
    </div>
  );
}
