interface TagProps {
  children: React.ReactNode;
  color?: string; // CSS color
}

export default function Tag({ children, color }: TagProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 500,
        background: color ? `${color}18` : 'var(--color-surface-2)',
        color: color ?? 'var(--color-text-2)',
        border: `1px solid ${color ? `${color}30` : 'var(--color-border-2)'}`,
        whiteSpace: 'nowrap' as const,
      }}
    >
      {children}
    </span>
  );
}
