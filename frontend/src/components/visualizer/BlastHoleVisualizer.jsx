import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { runPrediction, fallbackPrediction } from '../../services/predictionAPI';
import { RISK_COLORS, WAVE_SPEED } from '../../utils/constants';

const scale = (v, inMin, inMax, outMin, outMax) =>
  outMin + ((Math.min(Math.max(v, inMin), inMax) - inMin) / (inMax - inMin)) * (outMax - outMin);

const SVG_W = 340;
const SVG_H = 480;
const HOLE_X = SVG_W / 2;
const SURFACE_Y = 80;

const LEGEND = [
  { color: '#EF4444', label: 'High Energy Core',      sub: 'Maximum energy transfer zone' },
  { color: '#3B82F6', label: 'Primary Fragmentation', sub: 'Main rock breakage region' },
  { color: '#10B981', label: 'Secondary Scatter',     sub: 'Outer displacement zone' },
  { color: '#3B82F6', label: 'Stemming Column',       sub: 'Inert confinement material' },
];

export default function BlastHoleVisualizer({ inputParams: extParams, modelOutput: extOutput, isLoading: extLoading }) {
  const [localParams, setLocalParams] = useState({
    hole_depth: extParams?.hole_depth ?? 8,
    hole_diameter: extParams?.hole_diameter ?? 115,
    stemming_length: extParams?.stemming_length ?? 1.8,
    burden: extParams?.burden ?? 2.5,
    spacing: extParams?.spacing ?? 3.0,
    specific_charge: extParams?.specific_charge ?? 0.45,
    max_charge_delay: extParams?.max_charge_delay ?? 25,
    rmr: extParams?.rmr ?? 60,
    groundwater: extParams?.groundwater ?? 'Dry',
    slope_angle: extParams?.slope_angle ?? 45,
    distance_to_structure: extParams?.distance_to_structure ?? 200,
    joint_orientation: extParams?.joint_orientation ?? 45,
  });
  const [modelOutput, setModelOutput] = useState(extOutput || null);
  const [isPredicting, setIsPredicting] = useState(false);

  const params = extParams || localParams;
  const output = extOutput || modelOutput;
  const loading = extLoading || isPredicting;

  const doPrediction = useCallback(async (p) => {
    setIsPredicting(true);
    try {
      const res = await runPrediction(p);
      setModelOutput(res);
    } catch {
      toast.warn('Running in offline mode', { toastId: 'offline' });
      setModelOutput(fallbackPrediction(p));
    } finally {
      setIsPredicting(false);
    }
  }, []);

  useEffect(() => {
    if (extParams) return;
    const timer = setTimeout(() => doPrediction(localParams), 800);
    return () => clearTimeout(timer);
  }, [localParams, extParams, doPrediction]);

  useEffect(() => {
    if (extOutput) setModelOutput(extOutput);
  }, [extOutput]);

  // Geometry
  const holeH = scale(params.hole_depth, 3, 20, 80, 360);
  const holeW = scale(params.hole_diameter, 50, 300, 8, 28);
  const stemmingH = scale(params.stemming_length, 0.5, 5, 18, 130);
  const chargeH = Math.max(10, holeH - stemmingH);
  const holeX = HOLE_X - holeW / 2;
  const holeY = SURFACE_Y;
  const chargeY = holeY + stemmingH;
  const coreH = chargeH * 0.45;
  const coreW = holeW * 0.55;

  const burdenW = scale(params.burden, 1, 5, 60, 220);
  const spacingW = scale(params.spacing, 1, 6, 60, 260);

  const risk = output?.risk_level || 'Low';
  const riskColor = RISK_COLORS[risk] || RISK_COLORS.Low;
  const waveSpd = WAVE_SPEED[risk] || '2s';

  const highCoreOpacity = output?.energy_distribution?.high_energy_core ?? 0.5;
  const primaryOpacity = output?.energy_distribution?.primary_fragmentation ?? 0.4;
  const scatterOpacity = output?.energy_distribution?.secondary_scatter ?? 0.3;
  const scatterR = output ? scale(output.fragmentation_index || 0.5, 0, 1, 40, 110) : 60;

  const showFailurePlane = ['High', 'Critical'].includes(risk);

  const sliderDef = [
    { key: 'burden',        label: 'Burden',       unit: 'm',     min: 1,   max: 5,    step: 0.1 },
    { key: 'spacing',       label: 'Spacing',      unit: 'm',     min: 1,   max: 6,    step: 0.1 },
    { key: 'hole_depth',    label: 'Hole Depth',   unit: 'm',     min: 3,   max: 20,   step: 0.5 },
    { key: 'hole_diameter', label: 'Diameter',     unit: 'mm',    min: 50,  max: 300,  step: 5   },
    { key: 'stemming_length',label:'Stemming',     unit: 'm',     min: 0.5, max: 5,    step: 0.1 },
    { key: 'specific_charge',label:'Spec. Charge', unit: 'kg/m³', min: 0.1, max: 1.5,  step: 0.05 },
  ];

  return (
    <div className="flex flex-col h-full rounded-xl border" style={{ background: '#0F172A', borderColor: riskColor.border + '60', boxShadow: `0 0 20px ${riskColor.glow}` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-14 py-10 border-b border-slate-800">
        <div>
          <p className="text-xl font-black text-white">Blast Hole Cross-Section</p>
          <p className="text-sm text-slate-400 mt-1">Live visualization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${loading ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse-dot`} />
          <span className="text-sm font-black text-slate-400">{loading ? 'Predicting...' : 'Real-time'}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SVG */}
        <div className="flex-1 flex flex-col items-center justify-start pt-3 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 skeleton-shimmer rounded-none opacity-20" />
          )}
          <svg width={SVG_W} height={SVG_H} style={{ fontFamily: 'Inter, sans-serif', overflow: 'visible' }}>
            {/* Wave animation CSS */}
            <style>{`
              @keyframes waveExpand {
                0%   { transform: scale(1); opacity: 0.7; }
                100% { transform: scale(1.9); opacity: 0; }
              }
              .wave { transform-origin: ${HOLE_X}px ${holeY + stemmingH + chargeH / 2}px; animation: waveExpand ${waveSpd} ease-out infinite; }
              .wave2 { animation-delay: ${parseFloat(waveSpd) * 0.4}s; }
            `}</style>

            {/* Ground surface */}
            <rect x={0} y={0} width={SVG_W} height={SURFACE_Y} fill="#334155" opacity={0.6} />
            {/* Hatching */}
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1={i * 30 - 10} y1={0} x2={i * 30 + 60} y2={SURFACE_Y} stroke="#475569" strokeWidth={1} opacity={0.4} />
            ))}
            <text x={10} y={22} fill="#94A3B8" fontSize={10}>Ground Surface</text>

            {/* Burden / spacing visual lines */}
            <line x1={HOLE_X - burdenW / 2} y1={SURFACE_Y} x2={HOLE_X - burdenW / 2} y2={SURFACE_Y + 30} stroke="#64748B" strokeWidth={1} strokeDasharray="4 2" />
            <line x1={HOLE_X + burdenW / 2} y1={SURFACE_Y} x2={HOLE_X + burdenW / 2} y2={SURFACE_Y + 30} stroke="#64748B" strokeWidth={1} strokeDasharray="4 2" />
            <line x1={HOLE_X - burdenW / 2} y1={SURFACE_Y + 15} x2={HOLE_X + burdenW / 2} y2={SURFACE_Y + 15} stroke="#64748B" strokeWidth={1} />
            <text x={HOLE_X} y={SURFACE_Y + 12} textAnchor="middle" fill="#64748B" fontSize={8}>← burden →</text>

            {/* Scatter ellipses */}
            {[scatterR, scatterR * 0.6].map((r, wi) => (
              <ellipse key={wi} cx={HOLE_X} cy={chargeY + chargeH / 2}
                rx={r + 20} ry={r} fill="none"
                stroke="#10B981" strokeWidth={1.5} opacity={scatterOpacity}
                className={`wave ${wi === 1 ? 'wave2' : ''}`} />
            ))}

            {/* Hole outline */}
            <rect x={holeX - 1} y={holeY - 1} width={holeW + 2} height={holeH + 2} rx={2} fill="#1E293B" stroke="#64748B" strokeWidth={1} />

            {/* Primary fragmentation zone */}
            <rect x={holeX - holeW * 0.8} y={chargeY} width={holeW * 2.6} height={chargeH} rx={4}
              fill="#3B82F6" opacity={primaryOpacity} />

            {/* Blast hole charge area */}
            <rect x={holeX} y={chargeY} width={holeW} height={chargeH} fill="#3B82F6" opacity={0.55} />

            {/* High energy core */}
            <rect x={HOLE_X - coreW / 2} y={chargeY + chargeH * 0.25} width={coreW} height={coreH}
              rx={3} fill="#EF4444" opacity={highCoreOpacity} />

            {/* Stemming column */}
            <rect x={holeX} y={holeY} width={holeW} height={stemmingH} fill="#3B82F6" opacity={0.75} />

            {/* Hole outline top */}
            <rect x={holeX} y={holeY} width={holeW} height={holeH} rx={2} fill="none" stroke="#94A3B8" strokeWidth={1} />

            {/* Failure plane */}
            {showFailurePlane && (
              <line x1={HOLE_X - 30} y1={chargeY + chargeH * 0.2} x2={HOLE_X + burdenW * 0.6} y2={SVG_H - 20}
                stroke="#EF4444" strokeWidth={2} strokeDasharray="8 4" opacity={0.8} />
            )}

            {/* Labels */}
            {stemmingH > 25 && (
              <text x={holeX + holeW + 8} y={holeY + stemmingH / 2 + 4} fill="#93C5FD" fontSize={9}>Stemming</text>
            )}
            <text x={holeX + holeW + 8} y={chargeY + chargeH / 2 + 4} fill="#FDBA74" fontSize={9}>Charge Zone</text>
            {showFailurePlane && (
              <text x={HOLE_X + burdenW * 0.3} y={SVG_H - 25} fill="#F87171" fontSize={9}>Failure Plane</text>
            )}

            {/* Depth indicator */}
            <line x1={12} y1={SURFACE_Y} x2={12} y2={SURFACE_Y + holeH} stroke="#475569" strokeWidth={1} />
            <line x1={6} y1={SURFACE_Y} x2={18} y2={SURFACE_Y} stroke="#475569" strokeWidth={1} />
            <line x1={6} y1={SURFACE_Y + holeH} x2={18} y2={SURFACE_Y + holeH} stroke="#475569" strokeWidth={1} />
            <text x={18} y={SURFACE_Y + holeH / 2 + 4} fill="#64748B" fontSize={9}>{params.hole_depth}m</text>
          </svg>
        </div>

        {/* Sliders panel — only shown when not using external params */}
        {!extParams && (
          <div className="w-96 flex-shrink-0 border-l border-slate-800 px-14 py-12 overflow-y-auto">
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Adjust Parameters</p>
            <div className="space-y-10">
              {sliderDef.map(({ key, label, unit, min, max, step }) => (
                <div key={key}>
                  <div className="flex justify-between text-base mb-4">
                    <span className="text-slate-400 font-medium">{label}</span>
                    <span className="text-white font-black">{localParams[key]} <span className="text-slate-500 font-normal">{unit}</span></span>
                  </div>
                  <input type="range" min={min} max={max} step={step} className="w-full h-1.5 accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                    value={localParams[key]}
                    onChange={(e) => setLocalParams((p) => ({ ...p, [key]: parseFloat(e.target.value) }))} />
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              {LEGEND.map(({ color, label, sub }) => (
                <div key={label} className="flex gap-2 items-start">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: color }} />
                  <div>
                    <p className="text-[10px] font-medium text-slate-300">{label}</p>
                    <p className="text-[9px] text-slate-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk output footer */}
      {output && (
        <div className="border-t border-slate-800 px-14 py-10 flex items-center gap-12 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-3.5 h-3.5 rounded-full animate-pulse-dot" style={{ background: riskColor.border }} />
            <span className="text-xl font-black" style={{ color: riskColor.text }}>{risk} Risk</span>
          </div>
          <div className="text-lg text-slate-400">BISF: <span className="text-white font-black">{output.bisf_score?.toFixed(1)}</span></div>
          <div className="text-lg text-slate-400">PPV: <span className="text-white font-black">{output.ppv} mm/s</span></div>
          <div className="text-lg font-black text-slate-300 ml-auto tracking-tight">{output.failure_mode}</div>
        </div>
      )}
    </div>
  );
}
