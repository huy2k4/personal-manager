type ProgressVariant = 'default' | 'success' | 'warn' | 'danger';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({
  value,
  variant = 'default',
  showLabel = false,
  label,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const fillClass = variant === 'default' ? '' : ` ${variant}`;

  return (
    <div>
      {(showLabel || label) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span className="text-xs text-2">{label}</span>
          <span className="text-xs font-medium text-2">{clamped}%</span>
        </div>
      )}
      <div className="progress-track">
        <div
          className={`progress-fill${fillClass}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
