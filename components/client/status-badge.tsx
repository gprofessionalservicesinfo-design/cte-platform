import { cn, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] ?? status
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  )
}
