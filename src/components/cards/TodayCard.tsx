import { CheckCircle2, Circle, ListTodo } from 'lucide-react';
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
        <span className="card-title">
          <ListTodo size={14} strokeWidth={2} />
          Hôm nay
        </span>
        <span className="text-xs text-2">{done}/{todayTasks.length} xong</span>
      </div>

      <div>
        {todayTasks.map((task) => (
          <div key={task.id} className="task-item">
            {task.done
              ? <CheckCircle2 size={17} color="var(--color-success)" strokeWidth={2} style={{ flexShrink: 0 }} />
              : <Circle size={17} color="var(--color-border)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
            }
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
