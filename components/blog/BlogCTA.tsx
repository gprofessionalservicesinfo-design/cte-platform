interface BlogCTAProps {
  text: string
  href: string
  label: string
}

export default function BlogCTA({ text, href, label }: BlogCTAProps) {
  return (
    <div className="my-10 rounded-2xl p-7 text-center" style={{ background: '#2A3544' }}>
      <p className="text-white font-semibold text-lg mb-4 leading-snug">{text}</p>
      <a
        href={href}
        className="inline-block text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        style={{ background: '#2CB98A' }}
      >
        {label}
      </a>
    </div>
  )
}
