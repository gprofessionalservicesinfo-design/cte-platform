'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const NAVY = '#0A2540'

export function USMap() {
  return (
    <div className="relative flex items-center justify-center">
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: '100%', maxWidth: 420, height: 'auto', display: 'block' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="rgba(10,37,64,0.07)"
                stroke={NAVY}
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover:   { outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>

      {/* 50 estados badge */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          background: 'white',
          border: `2px solid ${NAVY}`,
          borderRadius: '12px',
          padding: '10px 20px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(10,37,64,0.14)',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            fontWeight: 800,
            fontSize: '1.6rem',
            color: NAVY,
            lineHeight: 1,
          }}
        >
          50
        </p>
        <p
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: NAVY,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginTop: 2,
          }}
        >
          estados
        </p>
      </div>
    </div>
  )
}
