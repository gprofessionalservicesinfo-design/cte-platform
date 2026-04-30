interface ArticleImageProps {
  src: string
  alt: string
  caption?: string | null
  photographerName: string
  photographerUrl: string
}

export default function ArticleImage({
  src,
  alt,
  caption,
  photographerName,
  photographerUrl,
}: ArticleImageProps) {
  const displayAlt = alt || caption || 'Imagen ilustrativa del artículo'
  // Append Unsplash sizing params to the URL
  const optimizedSrc = src.includes('unsplash.com')
    ? `${src.split('?')[0]}?w=900&q=80&auto=format&fit=crop`
    : src

  return (
    <figure className="my-8 -mx-4 sm:mx-0">
      <div className="overflow-hidden sm:rounded-2xl bg-gray-100" style={{ aspectRatio: '16/9' }}>
        <img
          src={optimizedSrc}
          alt={displayAlt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption className="flex items-start justify-between gap-3 mt-2 px-4 sm:px-0">
        {caption ? (
          <p className="text-xs text-gray-500 italic leading-relaxed flex-1">{caption}</p>
        ) : (
          <span />
        )}
        <a
          href={`${photographerUrl}?utm_source=creatuempresausa&utm_medium=referral`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
        >
          📷 {photographerName} · Unsplash
        </a>
      </figcaption>
    </figure>
  )
}
