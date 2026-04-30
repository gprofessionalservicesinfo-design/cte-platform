interface HighlightBlockProps {
  text: string
}

export default function HighlightBlock({ text }: HighlightBlockProps) {
  return (
    <div
      className="my-6 px-5 py-4 rounded-xl border-l-4 font-medium text-gray-800 leading-relaxed text-[15px]"
      style={{ background: '#f0fdf9', borderColor: '#00C896' }}
    >
      <span className="mr-2" style={{ color: '#00C896' }}>💡</span>
      {text}
    </div>
  )
}
