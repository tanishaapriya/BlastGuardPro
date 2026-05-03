import { Loader2 } from 'lucide-react';

const BASE = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none';

const SIZES = {
  xs: { px: '12px', py: '6px',  fontSize: 13, borderRadius: 10 },
  sm: { px: '16px', py: '8px',  fontSize: 14, borderRadius: 11 },
  md: { px: '22px', py: '11px', fontSize: 16, borderRadius: 14 },
  lg: { px: '28px', py: '14px', fontSize: 18, borderRadius: 16 },
};

const VARIANT_STYLES = {
  primary: (disabled) => ({
    background: disabled ? '#243550' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: disabled ? 'none' : '0 2px 10px rgba(59,130,246,0.35)',
  }),
  secondary: {
    background: '#111E30',
    color: '#A8C0D6',
    border: '1px solid #1E2D45',
  },
  outline: {
    background: 'transparent',
    color: '#7A92AE',
    border: '1px solid #243550',
  },
  ghost: {
    background: 'transparent',
    color: '#7A92AE',
    border: 'none',
  },
  danger: {
    background: 'rgba(239,68,68,0.1)',
    color: '#EF4444',
    border: '1px solid rgba(239,68,68,0.25)',
  },
};

const HOVER_STYLES = {
  primary:   { filter: 'brightness(1.08)', transform: 'translateY(-1px)' },
  secondary: { background: '#162338',  color: '#E2EAF4', borderColor: '#243550' },
  outline:   { background: '#0D1829',  color: '#E2EAF4', borderColor: '#304560' },
  ghost:     { background: '#0D1829',  color: '#E2EAF4' },
  danger:    { background: 'rgba(239,68,68,0.18)', color: '#FCA5A5' },
};

export default function Button({
  children, variant = 'primary', size = 'md', loading, disabled,
  onClick, type = 'button', className = '', icon: Icon, fullWidth,
  style: extraStyle = {},
}) {
  const sz = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;
  const baseStyle = typeof VARIANT_STYLES[variant] === 'function'
    ? VARIANT_STYLES[variant](isDisabled)
    : VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

  const handleMouseEnter = e => {
    if (isDisabled) return;
    const h = HOVER_STYLES[variant];
    if (!h) return;
    Object.assign(e.currentTarget.style, h);
  };
  const handleMouseLeave = e => {
    if (isDisabled) return;
    Object.assign(e.currentTarget.style, {
      filter: '',
      transform: '',
      background: baseStyle.background || '',
      color: baseStyle.color || '',
      borderColor: baseStyle.border?.includes('solid') ? (baseStyle.border.split('solid ')[1] || '') : '',
    });
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${BASE} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        ...baseStyle,
        paddingLeft:   sz.px,
        paddingRight:  sz.px,
        paddingTop:    sz.py,
        paddingBottom: sz.py,
        fontSize:      sz.fontSize,
        borderRadius:  sz.borderRadius,
        ...extraStyle,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading
        ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
        : Icon && <Icon style={{ width: 15, height: 15 }} />
      }
      {children}
    </button>
  );
}
