import { GraduationCap } from 'lucide-react';
import { schoolProjects } from '@/lib/mock-data';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

const PRIORITY_VARIANT = { high: 'danger', medium: 'warn', low: 'neutral' } as const;
const PRIORITY_LABEL = { high: 'Gấp', medium: 'Vừa', low: 'Thấp' } as const;

function daysLeft(deadline: string) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return 'Quá hạn';
  if (diff === 0) return 'Hôm nay';
  return `${diff} ngày`;
}

export default function ProjectCard() {
  return (
    <div className="card bento-full">
      <div className="card-header">
        <span className="card-title">
          <GraduationCap size={14} strokeWidth={2} />
          Project trường
        </span>
        <span className="text-xs text-3">{schoolProjects.length} môn</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {schoolProjects.map((proj) => (
          <div key={proj.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ flex: 1, marginRight: 8 }}>
                <span className="text-sm font-medium text-1">{proj.name}</span>
                <div className="text-xs text-2">{proj.subject}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <Badge variant={PRIORITY_VARIANT[proj.priority]}>{PRIORITY_LABEL[proj.priority]}</Badge>
                <span className="text-xs text-3">{daysLeft(proj.deadline)}</span>
              </div>
            </div>
            <ProgressBar
              value={proj.progress}
              variant={proj.priority === 'high' && proj.progress < 50 ? 'danger' : 'default'}
              showLabel
              label={`${proj.progress}%`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
