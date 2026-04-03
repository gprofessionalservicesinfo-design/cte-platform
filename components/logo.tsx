interface LogoProps {
  height?: number
  /** invert: true = white text (for dark backgrounds) */
  invert?: boolean
}

export function Logo({ height = 36, invert = false }: LogoProps) {
  const navy  = invert ? '#ffffff' : '#0A2540'
  const red   = invert ? '#ffaaaa' : '#DC2626'
  const scale = height / 38

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 224 38"
      width={Math.round(224 * scale)}
      height={height}
      aria-label="CreaTuEmpresaUSA"
      role="img"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <text
        x="0" y="26"
        fontFamily="Georgia,'Times New Roman',serif"
        fontSize="24"
        fontWeight="700"
        letterSpacing="-0.3"
      >
        <tspan fill={navy}>CreaTuEmpresa</tspan>
        <tspan fill={red}>USA</tspan>
      </text>
      {/* Flag stripe under "CreaTuEmpresa" */}
      <rect x="0"  y="31" width="44" height="6" fill="#3C3B6E" rx="1"/>
      <circle cx="7"  cy="34" r="1.1" fill="rgba(255,255,255,.85)"/>
      <circle cx="12" cy="34" r="1.1" fill="rgba(255,255,255,.85)"/>
      <circle cx="17" cy="34" r="1.1" fill="rgba(255,255,255,.85)"/>
      <circle cx="22" cy="34" r="1.1" fill="rgba(255,255,255,.85)"/>
      <circle cx="27" cy="34" r="1.1" fill="rgba(255,255,255,.85)"/>
      <circle cx="32" cy="34" r="1.1" fill="rgba(255,255,255,.85)"/>
      <circle cx="37" cy="34" r="1.1" fill="rgba(255,255,255,.85)"/>
      {/* Red-white-red stripes under "USA" */}
      <rect x="45" y="31" width="179" height="2" fill="#B22234"/>
      <rect x="45" y="33" width="179" height="2" fill={invert ? 'rgba(255,255,255,0.3)' : 'white'}/>
      <rect x="45" y="35" width="179" height="2" fill="#B22234"/>
    </svg>
  )
}
