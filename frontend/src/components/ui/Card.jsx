export function Card({ children, className = '', style = {}, onClick, hover = false }) {
  return (
    <div
      onClick={onClick}
      className={`${onClick || hover ? 'cursor-pointer transition-all duration-200' : ''} ${className}`}
      style={{
        background: '#0D1829',
        border: '1px solid #1E2D45',
        borderRadius: 32,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        ...(onClick || hover ? {} : {}),
        ...style,
      }}
      onMouseEnter={onClick || hover ? e => {
        e.currentTarget.style.borderColor = '#243550';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
      } : undefined}
      onMouseLeave={onClick || hover ? e => {
        e.currentTarget.style.borderColor = '#1E2D45';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4)';
      } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div
      className="flex items-start justify-between"
      style={{ borderBottom: '1px solid #1A2942', padding: '48px 64px' }}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <Icon style={{ width: 19, height: 19, color: '#3B82F6' }} />
          </div>
        )}
        <div>
          <h3 className="text-lg font-black" style={{ color: '#E2EAF4', letterSpacing: '-0.02em' }}>{title}</h3>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: '#5A7A9A' }}>{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0 ml-3">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '', noPad = false }) {
  return (
    <div className={className} style={{ padding: noPad ? 0 : '64px' }}>
      {children}
    </div>
  );
}
