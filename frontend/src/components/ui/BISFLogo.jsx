/**
 * BISF Mountain-Peak SVG Logo
 * Usage: <BISFLogo size={36} /> or <BISFLogo size={28} showText />
 */
export default function BISFLogo({ size = 36, showText = false, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Background square with rounded corners */}
        <rect width="40" height="40" rx="10" fill="url(#bisf-bg)" />

        {/* Mountain peak shape */}
        <path
          d="M20 8 L30 26 H10 Z"
          fill="none"
          stroke="url(#bisf-peak)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Inner smaller peak (snow cap) */}
        <path
          d="M20 8 L24 18 H16 Z"
          fill="url(#bisf-snow)"
          opacity="0.5"
        />
        {/* Blast wave arc */}
        <path
          d="M13 31 Q20 27 27 31"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Small impact dot */}
        <circle cx="20" cy="31" r="1.5" fill="rgba(255,255,255,0.7)" />

        <defs>
          <linearGradient id="bisf-bg" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="bisf-peak" x1="10" y1="8" x2="30" y2="26">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#BFDBFE" />
          </linearGradient>
          <linearGradient id="bisf-snow" x1="16" y1="8" x2="24" y2="18">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#BFDBFE" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div>
          <p
            style={{
              fontSize: size * 0.38,
              fontWeight: 700,
              color: '#E2EAF4',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            BlastGuard Pro
          </p>
          <p
            style={{
              fontSize: size * 0.28,
              color: '#3D5470',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            BISF Platform
          </p>
        </div>
      )}
    </div>
  );
}
