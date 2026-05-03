import { RISK_COLORS } from '../../utils/constants';

export default function Gauge({ value = 0, max = 100, label, size = 160 }) {
  const pct = Math.min(1, Math.max(0, value / max));
  const r = size * 0.36;
  const cx = size / 2;
  const cy = size * 0.58;
  const startAngle = -210;
  const totalAngle = 240;
  const angle = startAngle + totalAngle * pct;

  const polarToXY = (angleDeg, radius) => {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const arcPath = (startDeg, endDeg, rad) => {
    const s = polarToXY(startDeg, rad);
    const e = polarToXY(endDeg, rad);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${rad} ${rad} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const riskLevel = value < 25 ? 'Low' : value < 50 ? 'Medium' : value < 75 ? 'High' : 'Critical';
  const color = RISK_COLORS[riskLevel]?.border || '#64748B';

  const needle = polarToXY(angle, r * 0.72);
  const needleBase1 = polarToXY(angle - 90, 4);
  const needleBase2 = polarToXY(angle + 90, 4);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.72} style={{ overflow: 'visible' }}>
        {/* Background arc */}
        <path d={arcPath(startAngle, startAngle + totalAngle, r)} fill="none" stroke="#334155" strokeWidth={10} strokeLinecap="round" />
        {/* Value arc */}
        {pct > 0 && (
          <path d={arcPath(startAngle, angle, r)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
        )}
        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const a = startAngle + totalAngle * t;
          const outer = polarToXY(a, r + 8);
          const inner = polarToXY(a, r + 2);
          return <line key={t} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#475569" strokeWidth={2} />;
        })}
        {/* Needle */}
        <polygon
          points={`${needle.x},${needle.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={color} opacity={0.9}
        />
        <circle cx={cx} cy={cy} r={6} fill="#334155" stroke={color} strokeWidth={2} />
        {/* Value text */}
        <text x={cx} y={cy - r * 0.22} textAnchor="middle" fill="white" fontSize={size * 0.15} fontWeight="700" fontFamily="Inter">
          {Math.round(value)}
        </text>
        <text x={cx} y={cy - r * 0.04} textAnchor="middle" fill="#94A3B8" fontSize={size * 0.075} fontFamily="Inter">
          {label || 'BISF Score'}
        </text>
        {/* Range labels */}
        <text x={polarToXY(startAngle, r + 18).x} y={polarToXY(startAngle, r + 18).y + 4} textAnchor="middle" fill="#64748B" fontSize={size * 0.065}>0</text>
        <text x={polarToXY(startAngle + totalAngle, r + 18).x} y={polarToXY(startAngle + totalAngle, r + 18).y + 4} textAnchor="middle" fill="#64748B" fontSize={size * 0.065}>100</text>
      </svg>
      <span className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-full" style={{ color, background: RISK_COLORS[riskLevel]?.bg }}>
        {riskLevel}
      </span>
    </div>
  );
}
