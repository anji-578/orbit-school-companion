/** Flat sunrise / sunset landscape — colors come from `.orbit-glance` CSS variables. */
export function SunViz({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 420 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="orbitSunSky" x1="210" y1="0" x2="210" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--glance-sky-1)" />
          <stop offset="38%" stopColor="var(--glance-sky-2)" />
          <stop offset="62%" stopColor="var(--glance-sky-3)" />
          <stop offset="78%" stopColor="var(--glance-sky-4)" />
          <stop offset="100%" stopColor="var(--glance-sky-5)" />
        </linearGradient>
        <radialGradient
          id="orbitSunGlow"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(268 148) rotate(90) scale(110 110)"
        >
          <stop offset="0%" stopColor="var(--glance-sun-glow)" stopOpacity="0.95" />
          <stop offset="35%" stopColor="var(--glance-sun-mid)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--glance-sky-5)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="orbitSunDisk" x1="268" y1="120" x2="268" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--glance-sun-core)" />
          <stop offset="55%" stopColor="var(--glance-sun-glow)" />
          <stop offset="100%" stopColor="var(--glance-sun-mid)" />
        </linearGradient>
        <linearGradient id="orbitMtFar" x1="210" y1="140" x2="210" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--glance-mt-far)" />
          <stop offset="100%" stopColor="var(--glance-mt-far-deep)" />
        </linearGradient>
        <linearGradient id="orbitMtMid" x1="210" y1="160" x2="210" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--glance-mt-mid)" />
          <stop offset="100%" stopColor="var(--glance-mt-mid-deep)" />
        </linearGradient>
        <linearGradient id="orbitMtNear" x1="210" y1="190" x2="210" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--glance-mt-near)" />
          <stop offset="100%" stopColor="var(--glance-mt-near-deep)" />
        </linearGradient>
        <linearGradient id="orbitFadeLeft" x1="0" y1="140" x2="170" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--glance-bg)" stopOpacity="1" />
          <stop offset="50%" stopColor="var(--glance-bg)" stopOpacity="0.65" />
          <stop offset="100%" stopColor="var(--glance-bg)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="420" height="280" fill="url(#orbitSunSky)" />
      <circle cx="268" cy="148" r="110" fill="url(#orbitSunGlow)" />
      <circle cx="268" cy="152" r="48" fill="url(#orbitSunDisk)" />

      <g
        stroke="var(--glance-bird)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      >
        <path d="M118 72c6 4 10 4 16 0" />
        <path d="M142 58c5 3.5 9 3.5 14 0" />
        <path d="M168 78c7 4.5 12 4.5 18 0" />
        <path d="M198 64c4.5 3 8 3 12.5 0" />
        <path d="M312 70c5.5 3.5 9.5 3.5 15 0" />
        <path d="M338 84c4 2.8 7.5 2.8 11.5 0" />
      </g>

      <path
        d="M0 210 C60 188 110 175 160 182 C210 190 250 160 300 168 C350 176 390 158 420 170 L420 280 L0 280 Z"
        fill="url(#orbitMtFar)"
        opacity="0.9"
      />
      <path
        d="M0 230 C50 210 95 198 140 205 C185 212 220 185 255 178 C290 172 330 195 370 205 C395 212 410 208 420 212 L420 280 L0 280 Z"
        fill="url(#orbitMtMid)"
      />
      <path
        d="M0 248 C70 232 130 238 180 242 C240 248 290 228 340 236 C380 242 405 248 420 252 L420 280 L0 280 Z"
        fill="url(#orbitMtNear)"
      />

      <rect width="180" height="280" fill="url(#orbitFadeLeft)" className="orbit-sunviz-fade" />
    </svg>
  )
}
