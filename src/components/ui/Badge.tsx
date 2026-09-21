type BadgeVariant = 'accent' | 'success' | 'warn' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export default function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
}
