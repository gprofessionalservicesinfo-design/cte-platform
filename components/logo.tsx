interface LogoProps {
  height?: number
  /** invert: true = white text (for dark backgrounds) */
  invert?: boolean
}

export function Logo({ height = 36, invert = false }: LogoProps) {
  const navy = invert ? '#ffffff' : '#0A2540'
  const red  = invert ? '#7DDBCA' : '#2CB98A'
  const scale = height / 28

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 224 28"
      width={Math.round(224 * scale)}
      height={height}
      aria-label="CreaTuEmpresaUSA"
      role="img"
      overflow="visible"
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
    </svg>
  )
}
