interface LearnBoxProps {
  items: string[]
}

export default function LearnBox({ items }: LearnBoxProps) {
  if (!items.length) return null
  return (
    <div
      className="rounded-2xl p-5 sm:p-6 mb-8 border-l-4"
      style={{ background: '#f0fdf9', borderColor: '#00C896' }}
    >
      <p className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
        <span style={{ color: '#00C896' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Lo que aprenderás en este artículo
      </p>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0" style={{ color: '#00C896' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
