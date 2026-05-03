const SVG_W = 380;
const SVG_H = 300;

const ROCK_COLORS = {
  Granite:   ['#374151', '#4B5563', '#374151', '#4B5563'],
  Limestone: ['#D4C5A0', '#C8B882', '#D4C5A0', '#C8B882'],
  Sandstone: ['#C2784A', '#B06B3A', '#C2784A', '#B06B3A'],
  Basalt:    ['#1F2937', '#111827', '#1F2937', '#111827'],
  Shale:     ['#4B5E6B', '#3E4F5A', '#4B5E6B', '#3E4F5A'],
  Coal:      ['#1A1A1A', '#2D2D2D', '#1A1A1A', '#2D2D2D'],
  Mixed:     ['#6B5B4E', '#5A4B40', '#6B5B4E', '#5A4B40'],
};

export default function SlopeCrossSectionVisualizer({ slopeAngle = 45, slopeHeight = 15, rockType = 'Granite', groundwater = 'Dry', riskLevel = 'Low' }) {
  const angle = Math.min(85, Math.max(5, slopeAngle));
  const rad = (angle * Math.PI) / 180;

  const baseY = SVG_H - 40;
  const topX = 80;
  const slopeHPx = Math.min(200, Math.max(60, (slopeHeight / 40) * 200));
  const slopeWPx = slopeHPx / Math.tan(rad);

  const crestX = topX + slopeWPx;
  const crestY = baseY - slopeHPx;

  const toePt   = [topX, baseY];
  const crestPt = [crestX, crestY];
  const farPt   = [SVG_W - 20, baseY];
  const farTopPt = [SVG_W - 20, crestY];

  const colors = ROCK_COLORS[rockType] || ROCK_COLORS.Granite;
  const bandH = slopeHPx / 4;

  const showWater = ['Wet', 'Flooded'].includes(groundwater);
  const waterY = crestY + slopeHPx * (groundwater === 'Flooded' ? 0.15 : 0.35);
  const showFailurePlane = ['High', 'Critical'].includes(riskLevel);

  const polyToStr = (pts) => pts.map(([x, y]) => `${x},${y}`).join(' ');
  const slopeClip = polyToStr([toePt, crestPt, farTopPt, farPt]);

  const angleBisect = angle / 2 + (90 - angle);
  const arcR = 30;
  const arcEnd = [
    topX + arcR * Math.cos((angleBisect * Math.PI) / 180),
    baseY - arcR * Math.sin((angleBisect * Math.PI) / 180),
  ];

  return (
    <div className="rounded-xl border border-slate-700/50 overflow-hidden" style={{ background: '#0F172A' }}>
      <div className="px-14 py-10 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xl font-black text-white">Slope Cross-Section</span>
        <span className="text-sm font-black text-slate-400">Live preview · θ = {slopeAngle}°</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ maxHeight: SVG_H }}>
        <defs>
          <clipPath id="slopeClip">
            <polygon points={slopeClip} />
          </clipPath>
          <clipPath id="farClip">
            <rect x={crestX} y={crestY} width={SVG_W - crestX} height={slopeHPx} />
          </clipPath>
        </defs>

        {/* Sky */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#0F172A" />

        {/* Rock layers inside slope */}
        {[0,1,2,3].map((i) => (
          <rect key={i} x={topX - 10} y={crestY + i * bandH} width={SVG_W - topX + 20} height={bandH + 1}
            fill={colors[i]} opacity={0.75} clipPath="url(#slopeClip)" />
        ))}
        {/* Rock layers on plateau */}
        {[0,1,2,3].map((i) => (
          <rect key={`f${i}`} x={crestX} y={crestY + i * bandH} width={SVG_W - crestX + 10} height={bandH + 1}
            fill={colors[i]} opacity={0.75} clipPath="url(#farClip)" />
        ))}

        {/* Base flat ground */}
        <rect x={0} y={baseY} width={SVG_W} height={SVG_H - baseY} fill={colors[3]} opacity={0.5} />

        {/* Slope face outline */}
        <polygon points={polyToStr([toePt, crestPt, farTopPt, farPt])} fill="none" stroke="#64748B" strokeWidth={1.5} />
        {/* Slope face highlight */}
        <line x1={toePt[0]} y1={toePt[1]} x2={crestPt[0]} y2={crestPt[1]} stroke="#94A3B8" strokeWidth={2.5} />

        {/* Groundwater line */}
        {showWater && (
          <>
            <line x1={topX - 20} y1={waterY} x2={SVG_W - 10} y2={waterY}
              stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="8 4" opacity={0.85} />
            <text x={SVG_W - 15} y={waterY - 4} textAnchor="end" fill="#3B82F6" fontSize={9} fontFamily="Inter">Water Table</text>
          </>
        )}

        {/* Failure plane */}
        {showFailurePlane && (
          <line x1={toePt[0] + 10} y1={toePt[1] - 10} x2={crestPt[0] - 15} y2={crestPt[1] + 20}
            stroke="#EF4444" strokeWidth={2} strokeDasharray="10 5" opacity={0.9} />
        )}

        {/* Angle arc */}
        <path d={`M ${topX + arcR} ${baseY} A ${arcR} ${arcR} 0 0 0 ${arcEnd[0]} ${arcEnd[1]}`}
          fill="none" stroke="#3B82F6" strokeWidth={1.5} opacity={0.7} />
        <text x={topX + arcR + 6} y={baseY - 10} fill="#3B82F6" fontSize={10} fontFamily="Inter">θ={angle}°</text>

        {/* Height dimension */}
        <line x1={topX - 15} y1={crestY} x2={topX - 15} y2={baseY} stroke="#64748B" strokeWidth={1} />
        <line x1={topX - 20} y1={crestY} x2={topX - 10} y2={crestY} stroke="#64748B" strokeWidth={1} />
        <line x1={topX - 20} y1={baseY} x2={topX - 10} y2={baseY} stroke="#64748B" strokeWidth={1} />
        <text x={topX - 28} y={crestY + slopeHPx / 2 + 4} textAnchor="middle" fill="#94A3B8" fontSize={9} fontFamily="Inter"
          transform={`rotate(-90, ${topX - 28}, ${crestY + slopeHPx / 2 + 4})`}>
          {slopeHeight}m
        </text>

        {/* Rock type label */}
        <text x={crestX + 20} y={crestY + 15} fill="#94A3B8" fontSize={10} fontFamily="Inter">{rockType}</text>

        {/* Failure label */}
        {showFailurePlane && (
          <text x={toePt[0] + 30} y={crestY + slopeHPx * 0.6} fill="#F87171" fontSize={9} fontFamily="Inter">Failure Plane</text>
        )}
      </svg>
    </div>
  );
}
