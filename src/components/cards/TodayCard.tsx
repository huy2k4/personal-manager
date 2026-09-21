import { todayTasks } from '@/lib/mock-data';

const CATEGORY_COLORS: Record<string, string> = {
  work:      '#2563EB',
  freelance: '#7C3AED',
  teach:     '#D97706',
  study:     '#16A34A',
  personal:  '#6B6B6B',
};

export default function TodayCard() {
  const done = todayTasks.filter((t) => t.done).length;

  return (
    <div className="card bento-full">
      <div className="card-header">
        <span className="card-title">📋 Hôm nay</span>
        <span className="text-xs text-2">{done}/{todayTasks.length} xong</span>
      </div>

      <div>
        {todayTasks.map((task) => (
          <div key={task.id} className="task-item">
            <div
              className={`task-check${task.done ? ' done' : ''}`}
              aria-label={task.done ? 'Đã xong' : 'Chưa xong'}
            >
              {task.done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div
              style={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: CATEGORY_COLORS[task.category] ?? '#6B6B6B',
                flexShrink: 0,
              }}
            />
            <span className="task-time">{task.time}</span>
            <span className={`task-title${task.done ? ' done' : ''}`}>{task.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
