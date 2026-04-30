import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? 'business entrepreneur USA'
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!accessKey || accessKey.startsWith('your_')) {
    return NextResponse.json({ url: null }, { status: 404 })
  }

  const url =
    `https://api.unsplash.com/search/photos` +
    `?query=${encodeURIComponent(q)}&per_page=3&orientation=landscape&content_filter=high`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return NextResponse.json({ url: null }, { status: 502 })

    const data = await res.json()
    const photo = data.results?.[0]
    if (!photo) return NextResponse.json({ url: null }, { status: 404 })

    const photoUrl =
      photo.urls.regular.split('?')[0] + '?w=800&q=80&auto=format&fit=crop'

    return NextResponse.json({ url: photoUrl }, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    })
  } catch {
    return NextResponse.json({ url: null }, { status: 500 })
  }
}
