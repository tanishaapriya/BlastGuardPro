import { RISK_COLORS } from '../../utils/constants';

const VARIANTS = {
  default: { bg: 'rgba(90,122,154,0.15)',  text: '#7A92AE', border: 'rgba(90,122,154,0.3)' },
  success: { bg: 'rgba(34,197,94,0.12)',   text: '#22C55E', border: 'rgba(34,197,94,0.3)'  },
  warning: { bg: 'rgba(245,158,11,0.12)',  text: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  danger:  { bg: 'rgba(239,68,68,0.12)',   text: '#EF4444', border: 'rgba(239,68,68,0.3)'  },
  info:    { bg: 'rgba(59,130,246,0.12)',  text: '#3B82F6', border: 'rgba(59,130,246,0.3)' },
  orange:  { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6', border: 'rgba(59,130,246,0.3)' },
};

export function Badge({ children, variant = 'default', risk, pulse, className = '' }) {
  const s = risk
    ? { bg: RISK_COLORS[risk]?.bg, text: RISK_COLORS[risk]?.text, border: (RISK_COLORS[risk]?.border || '') + '50' }
    : VARIANTS[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold ${pulse ? 'animate-badge' : ''} ${className}`}
      style={{
        background:   s.bg,
        color:        s.text,
        border:       `1px solid ${s.border}`,
        borderRadius: 99,
        padding:      '5px 12px',
        fontSize:     13,
        lineHeight:   '18px',
        whiteSpace:   'nowrap',
      }}
    >
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-dot"
          style={{ background: s.text }}
        />
      )}
      {children}
    </span>
  );
}

export function RiskBadge({ level, pulse }) {
  return (
    <Badge risk={level} pulse={pulse ?? ['High', 'Critical'].includes(level)}>
      {level}
    </Badge>
  );
}
