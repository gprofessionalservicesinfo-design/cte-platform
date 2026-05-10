export function CteBadge({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="16" fill="#000000"/>
      <rect x="0" y="27" width="64" height="10" fill="rgba(0,0,0,0.18)"/>
      <text x="32" y="46" fontFamily="Syne,sans-serif" fontWeight="800"
            fontSize="28" fill="white" textAnchor="middle" letterSpacing="-1">CTE</text>
    </svg>
  )
}
