type CalloutType = 'info' | 'warning' | 'tip' | 'important'

interface CalloutProps {
  type?: CalloutType
  children: React.ReactNode
}

const STYLES: Record<CalloutType, { border: string; bg: string; icon: string; label: string }> = {
  info:      { border: '#3b82f6', bg: '#eff6ff', icon: 'ℹ️', label: 'Información' },
  warning:   { border: '#f59e0b', bg: '#fffbeb', icon: '⚠️', label: 'Atención' },
  tip:       { border: '#10b981', bg: '#ecfdf5', icon: '💡', label: 'Consejo' },
  important: { border: '#ef4444', bg: '#fff1f2', icon: '🔴', label: 'Importante' },
}

export default function Callout({ type = 'info', children }: CalloutProps) {
  const s = STYLES[type]
  return (
    <div
      className="my-6 rounded-xl px-5 py-4 flex gap-3"
      style={{ background: s.bg, borderLeft: `4px solid ${s.border}` }}
    >
      <span className="text-xl leading-none flex-shrink-0 mt-0.5">{s.icon}</span>
      <div className="text-sm leading-relaxed text-gray-700">
        <span className="font-semibold text-gray-900">{s.label}: </span>
        {children}
      </div>
    </div>
  )
}
