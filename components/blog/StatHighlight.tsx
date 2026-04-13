interface StatItem {
  value: string
  label: string
}

interface StatHighlightProps {
  stats: StatItem[]
}

export default function StatHighlight({ stats }: StatHighlightProps) {
  return (
    <div className={`my-8 grid gap-4 grid-cols-${Math.min(stats.length, 3)}`}>
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-gray-50 rounded-2xl py-6 px-5 text-center border border-gray-100"
        >
          <p className="text-3xl font-bold text-[#0A2540] mb-1">{s.value}</p>
          <p className="text-xs text-gray-500 leading-snug">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
