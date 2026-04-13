interface BlogCTAProps {
  text: string
  href: string
  label: string
}

export default function BlogCTA({ text, href, label }: BlogCTAProps) {
  return (
    <div className="my-10 bg-[#0A2540] rounded-2xl p-7 text-center">
      <p className="text-white font-semibold text-lg mb-4 leading-snug">{text}</p>
      <a
        href={href}
        className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
      >
        {label}
      </a>
    </div>
  )
}
