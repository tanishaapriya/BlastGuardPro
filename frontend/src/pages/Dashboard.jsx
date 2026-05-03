import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Zap, MapPin, AlertTriangle, TrendingUp, Activity,
  ArrowUpRight, Download, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { RiskBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { MOCK_PREDICTIONS, MOCK_ANALYTICS } from '../utils/mockData';
import { SITES, RISK_COLORS } from '../utils/constants';
import { fmtDateTime, fmtRelative } from '../utils/formatters';

const PIE_COLORS  = ['#22C55E', '#F59E0B', '#3B82F6', '#EF4444'];
const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#060C14', border: '1px solid #1E2D45',
      borderRadius: 10, padding: '8px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    }}>
      <p style={{ color: '#5A7A9A', fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontSize: 12 }}>
          {p.name}: <span style={{ color: '#E2EAF4', fontWeight: 600 }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const AXIS = { tick: { fontSize: 11, fill: '#3D5470' }, axisLine: false, tickLine: false };

/* ── Reusable section label ─────────────────────────────── */
export function SectionLabel({ children }) {
  return (
    <h2 className="text-xl font-black uppercase tracking-[0.2em] mb-10 px-4" style={{ color: '#3D5470' }}>
      {children}
    </h2>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const [selectedPred, setSelectedPred] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);

  const recent    = MOCK_PREDICTIONS.slice(0, 10);
  const riskDist  = RISK_LEVELS.map(r => ({
    name: r, value: MOCK_PREDICTIONS.filter(p => p.outputs.risk_level === r).length,
  }));
  const highAlerts  = MOCK_PREDICTIONS.filter(p => ['High','Critical'].includes(p.outputs.risk_level)).length;
  const avgAccuracy = (MOCK_ANALYTICS.reduce((a,b) => a + b.accuracy, 0) / MOCK_ANALYTICS.length).toFixed(1);
  const activeSites = SITES.filter(s => s.status === 'Active').length;

  const kpis = [
    { label: 'Total Predictions', value: MOCK_PREDICTIONS.length, sub: '+12 this week',
      icon: TrendingUp, color: '#3B82F6', trend: '+8.5%', up: true },
    { label: 'Active Sites',      value: activeSites, sub: `${SITES.length} total`,
      icon: MapPin, color: '#3B82F6', trend: `${SITES.length-activeSites} monitoring`, up: null },
    { label: 'High Risk Alerts',  value: highAlerts, sub: 'Last 30 days',
      icon: AlertTriangle, color: '#EF4444', trend: '−3 from last month', up: false },
    { label: 'Model Accuracy',    value: `${avgAccuracy}%`, sub: 'Rolling 30-day avg',
      icon: Activity, color: '#22C55E', trend: '+1.2% vs last month', up: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 100 }}>

      {/* ══ SECTION 1 — KPI CARDS ══════════════════════════════ */}
      <section>
        <SectionLabel>Key Metrics</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <motion.div key={k.label}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, ease: 'easeOut' }}>
                <div style={{
                  background: '#0D1829',
                  border: '1px solid #1E2D45',
                  borderRadius: 20,
                  padding: '36px',
                }}>
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: k.color + '15', border: `1px solid ${k.color}30` }}>
                      <Icon style={{ width: 24, height: 24, color: k.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">{k.label}</p>
                      <p className="text-3xl font-black text-white tracking-tight">{k.value}</p>
                    </div>
                  </div>
                  {k.trend && (
                    <div className="mt-4 pt-4 border-t border-[#1E2D45]">
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: k.up === true ? '#22C55E' : k.up === false ? '#EF4444' : '#5A7A9A',
                        display: 'flex', alignItems: 'center', gap: 2,
                      }}>
                        {k.up === true && <ArrowUpRight style={{ width: 11, height: 11 }} />}
                        {k.trend}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ SECTION 2 — CHARTS ═════════════════════════════════ */}
      <section>
        <SectionLabel>Trend Analysis</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>

          {/* Prediction Trend */}
          <Card>
            <CardHeader title="Prediction Trend" subtitle="30-day risk-level breakdown" />
            <CardBody>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={MOCK_ANALYTICS} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2942" />
                  <XAxis dataKey="date" {...AXIS} interval={6} />
                  <YAxis {...AXIS} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#5A7A9A', paddingTop: 8 }} />
                  <Line type="monotone" dataKey="low"      name="Low"      stroke="#22C55E" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="high"     name="High"     stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="critical" name="Critical" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="4 3" />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* BISF Score Trend */}
          <Card>
            <CardHeader title="BISF Score Trend" subtitle="Average score over 30 days" />
            <CardBody>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={MOCK_ANALYTICS} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="bisfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2942" />
                  <XAxis dataKey="date" {...AXIS} interval={6} />
                  <YAxis {...AXIS} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="avgBisf" name="Avg BISF"
                    stroke="#3B82F6" fill="url(#bisfGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Monthly Blast Activity */}
          <Card>
            <CardHeader title="Monthly Blast Activity" subtitle="Blasts recorded per day" />
            <CardBody>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_ANALYTICS} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2942" />
                  <XAxis dataKey="date" {...AXIS} interval={6} />
                  <YAxis {...AXIS} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="blasts" name="Blasts" fill="#3B82F6" fillOpacity={0.8} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader title="Risk Distribution" subtitle="All-time prediction breakdown" />
            <CardBody>
              <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <div style={{ flexShrink: 0 }}>
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie data={riskDist} cx="50%" cy="50%" innerRadius={40} outerRadius={68}
                        paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {riskDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {riskDist.map((r, i) => {
                    const total = riskDist.reduce((a,b) => a+b.value, 0);
                    const pct   = ((r.value / total) * 100).toFixed(0);
                    return (
                      <div key={r.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i], flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: '#A8C0D6' }}>{r.name}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#E2EAF4' }}>{r.value}</span>
                        </div>
                        <div style={{ height: 3, borderRadius: 2, background: '#1A2942' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: PIE_COLORS[i], borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ══ SECTION 3 — RECENT ACTIVITY ════════════════════════ */}
      <section>
        <SectionLabel>Recent Activity</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 36 }}>

          {/* Recent predictions table */}
          <Card>
            <CardHeader
              title="Recent Predictions"
              subtitle="Latest 10 blast runs"
              action={
                <button onClick={() => nav('/history')}
                  style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 3 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#60A5FA'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}>
                  View all <ChevronRight style={{ width: 13, height: 13 }} />
                </button>
              }
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1A2942' }}>
                    {['Site', 'Time', 'Risk', 'BISF Score', 'PPV', ''].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '10px 20px',
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: '#3D5470',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p, i) => (
                    <tr key={p.id}
                      style={{ borderBottom: i < recent.length-1 ? '1px solid #0A1422' : 'none', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0A1422'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 22px' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#E2EAF4', display: 'block', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.site}
                        </span>
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <span style={{ fontSize: 12, color: '#5A7A9A' }}>{fmtRelative(p.timestamp)}</span>
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <RiskBadge level={p.outputs.risk_level} />
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#E2EAF4' }}>
                          {p.outputs.bisf_score.toFixed(1)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <span style={{ fontSize: 13, color: '#7A92AE' }}>{p.outputs.ppv}</span>
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <button onClick={() => setSelectedPred(p)}
                          style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#60A5FA'}
                          onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}>
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Site status */}
            <Card>
              <CardHeader title="Site Status" subtitle="Click a site for details" />
              <CardBody>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {SITES.map(site => {
                    const lastPred = MOCK_PREDICTIONS.find(p => p.siteId === site.id);
                    const risk  = lastPred?.outputs.risk_level || 'Low';
                    const color = RISK_COLORS[risk]?.border || '#22C55E';
                    return (
                      <button key={site.id} onClick={() => setSelectedSite({...site, risk, lastPred})}
                        style={{
                          padding: '10px 10px 8px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                          background: color + '10', border: `1px solid ${color}30`, transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = color+'55'; e.currentTarget.style.background = color+'18'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = color+'30'; e.currentTarget.style.background = color+'10'; }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginBottom: 6 }} />
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#E2EAF4', lineHeight: 1.3 }}>
                          {site.name.split(' ').slice(0,3).join(' ')}
                        </p>
                        <p style={{ fontSize: 10, fontWeight: 600, color, marginTop: 2 }}>{risk}</p>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
                  {[['Low','#22C55E'],['Medium','#F59E0B'],['High','#3B82F6'],['Critical','#EF4444']].map(([r,c]) => (
                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                      <span style={{ fontSize: 11, color: '#5A7A9A' }}>{r}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader title="Quick Actions" />
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Button fullWidth icon={Zap}           onClick={() => nav('/predict')}>New Prediction</Button>
                  <Button fullWidth variant="secondary"  icon={Download} onClick={() => nav('/reports')}>Generate Report</Button>
                  <Button fullWidth variant="ghost"      icon={AlertTriangle} onClick={() => nav('/alerts')}>View Alerts</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* ══ MODALS ══════════════════════════════════════════════ */}
      <Modal open={!!selectedPred} onClose={() => setSelectedPred(null)} title="Prediction Details" size="lg">
        {selectedPred && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <RiskBadge level={selectedPred.outputs.risk_level} pulse />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#E2EAF4' }}>{selectedPred.site}</p>
                <p style={{ fontSize: 12, color: '#5A7A9A', marginTop: 2 }}>{fmtDateTime(selectedPred.timestamp)}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                ['BISF Score',    selectedPred.outputs.bisf_score.toFixed(1)],
                ['PPV (mm/s)',    selectedPred.outputs.ppv],
                ['Probability',  `${(selectedPred.outputs.probability*100).toFixed(1)}%`],
                ['Confidence',   `${(selectedPred.outputs.confidence*100).toFixed(1)}%`],
                ['Failure Mode', selectedPred.outputs.failure_mode],
                ['Fragmentation',selectedPred.outputs.fragmentation_index.toFixed(3)],
              ].map(([l, v]) => (
                <div key={l} style={{ padding: '14px 16px', borderRadius: 12, background: '#060C14', border: '1px solid #1A2942' }}>
                  <p style={{ fontSize: 11, color: '#5A7A9A', marginBottom: 6 }}>{l}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#E2EAF4' }}>{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#A8C0D6', marginBottom: 10 }}>Recommendations</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedPred.outputs.recommendations.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#7A92AE' }}>
                    <span style={{ color: '#3B82F6', flexShrink: 0 }}>•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!selectedSite} onClose={() => setSelectedSite(null)} title="Site Details">
        {selectedSite && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#E2EAF4' }}>{selectedSite.name}</p>
                <p style={{ fontSize: 12, color: '#5A7A9A', marginTop: 2 }}>{selectedSite.location}</p>
              </div>
              <RiskBadge level={selectedSite.risk} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Rock Type',   selectedSite.rockType],
                ['Slope Angle', `${selectedSite.slopeAngle}°`],
                ['Status',      selectedSite.status],
                ['Coordinates', `${selectedSite.lat?.toFixed(2)}, ${selectedSite.lng?.toFixed(2)}`],
              ].map(([l, v]) => (
                <div key={l} style={{ padding: '14px 16px', borderRadius: 12, background: '#060C14', border: '1px solid #1A2942' }}>
                  <p style={{ fontSize: 11, color: '#5A7A9A', marginBottom: 4 }}>{l}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#E2EAF4' }}>{v}</p>
                </div>
              ))}
            </div>
            <Button fullWidth onClick={() => { nav(`/sites/${selectedSite.id}`); setSelectedSite(null); }}>
              View Full Site Details →
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
