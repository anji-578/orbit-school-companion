/** Clean Orbit brand mark — refined for dark UI (no sheet crops). */
export function OrbitMark({ className = '', title = 'Orbit' }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="orbitSwoosh" x1="18" y1="78" x2="86" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1D4ED8" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#93C5FD" />
        </linearGradient>
        <linearGradient id="orbitArc" x1="16" y1="70" x2="70" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8EEF8" />
          <stop offset="1" stopColor="#B8C7E6" />
        </linearGradient>
      </defs>

      {/* Upper arc */}
      <path
        d="M24 70C16 54 20 34 36 24c12-8 28-9 40-2"
        stroke="url(#orbitArc)"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Lower orbit swooshes */}
      <path
        d="M20 76c16 14 40 18 62 6 8-4 14-11 18-18"
        stroke="url(#orbitSwoosh)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M28 84c14 8 34 10 52 2"
        stroke="#60A5FA"
        strokeWidth="2.75"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Planet */}
      <circle cx="74" cy="28" r="4.25" fill="#F8FAFC" />

      {/* Student silhouette */}
      <g fill="#F8FAFC">
        <ellipse cx="46" cy="34" rx="7.2" ry="8" />
        <path d="M34.5 72c1.5-14 6.5-22 11.5-25.5 3.2-2.2 8.2-2.4 11.8.4 5.2 4 10 12.2 11.7 25.1-6.2 2.8-14.4 4.2-22.2 3.4-4.4-.4-8.6-1.8-12.8-3.4Z" />
        {/* backpack */}
        <path d="M35.2 52c-3.4 1.8-6.4 7-7.2 13.2 3.2 1.4 6.6 2.2 9.8 2.4.8-5.4 1.6-10.2 3.2-13.8-2-.6-3.8-1.2-5.8-1.8Z" />
      </g>

      {/* Tablet */}
      <rect x="42.5" y="50.5" width="13.5" height="9.2" rx="1.4" fill="#0B1224" stroke="#F8FAFC" strokeWidth="1.3" />
      <path d="M45 53.2h8.2M45 56h6" stroke="#60A5FA" strokeWidth="1.05" strokeLinecap="round" />
      {/* backpack highlight */}
      <path d="M36.2 56.5c1.8-.4 3.4-.6 5-.4" stroke="#93C5FD" strokeWidth="1.1" strokeLinecap="round" />

      {/* Sparkles */}
      <path d="M63 39.5 64.1 42 66.6 43.1 64.1 44.2 63 46.7 61.9 44.2 59.4 43.1 61.9 42 63 39.5Z" fill="#60A5FA" />
      <path d="M70 44.2 70.7 45.8 72.3 46.5 70.7 47.2 70 48.8 69.3 47.2 67.7 46.5 69.3 45.8 70 44.2Z" fill="#F8FAFC" />
      <path d="M67.2 33.8 67.7 35 68.9 35.5 67.7 36 67.2 37.2 66.7 36 65.5 35.5 66.7 35 67.2 33.8Z" fill="#93C5FD" />
    </svg>
  )
}
