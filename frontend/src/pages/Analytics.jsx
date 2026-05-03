import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Download, TrendingUp, Zap, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MOCK_ANALYTICS, MOCK_PREDICTIONS } from '../utils/mockData';
import { SITES } from '../utils/constants';
import { toast } from 'react-toastify';

const PRESETS = ['7d', '30d', '90d', '1yr'];

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#0F172A', border: '1px solid #334155' }}>
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-semibold text-white">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span></p>)}
    </div>
  );
};

const radarData = SITES.map((s, i) => ({
  site: s.name.split(' ').slice(0, 2).join(' '),
  bisf: 30 + i * 12,
  ppv: 8 + i * 6,
  stability: 90 - i * 10,
  riskScore: 20 + i * 15,
}));

export default function Analytics() {
  const [preset, setPreset] = useState('30d');
  const days = preset === '7d' ? 7 : preset === '90d' ? 90 : preset === '1yr' ? 365 : 30;
  const data = MOCK_ANALYTICS.slice(-Math.min(days, MOCK_ANALYTICS.length));

  const avgBisf = (data.reduce((a, b) => a + b.avgBisf, 0) / data.length).toFixed(1);
  const totalBlasts = data.reduce((a, b) => a + b.blasts, 0);
  const highRisk = data.reduce((a, b) => a + b.high + b.critical, 0);
  const avgAcc = (data.reduce((a, b) => a + b.accuracy, 0) / data.length).toFixed(1);

  const scatterData = MOCK_PREDICTIONS.slice(0, 30).map((p) => ({
    distance: p.inputs.distance_to_structure,
    ppv: p.outputs.ppv,
    risk: p.outputs.risk_level,
  }));
  const scatterColors = { Low: '#10B981', Medium: '#F59E0B', High: '#3B82F6', Critical: '#EF4444' };

  const distData = [0,1,2,3].map((i) => ({
    range: ['0-25','25-50','50-75','75-100'][i],
    count: MOCK_PREDICTIONS.filter((p) => {
      const s = p.outputs.bisf_score;
      return s >= i*25 && s < (i+1)*25;
    }).length,
  }));

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto">
      {/* Date range */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1E293B' }}>
          {PRESETS.map((p) => (
            <button key={p} onClick={() => setPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${preset === p ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              style={preset === p ? { background: '#3B82F6' } : {}}>
              {p}
            </button>
          ))}
        </div>
        <Button variant="outline" icon={Download} size="sm" onClick={() => toast.info('Chart export coming soon')}>
          Export Analytics
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-8">
        {[
          ['Total Blasts', totalBlasts, TrendingUp, '#3B82F6'],
          ['Avg BISF Score', avgBisf, Zap, '#3B82F6'],
          ['High Risk Events', highRisk, AlertTriangle, '#EF4444'],
          ['Model Accuracy', `${avgAcc}%`, Activity, '#10B981'],
        ].map(([l, v, Icon, c]) => (
          <Card key={l}>
            <CardBody className="pt-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c + '20' }}>
                  <Icon style={{ width: 18, height: 18, color: c }} />
                </div>
                <span className="text-sm text-slate-400">{l}</span>
              </div>
              <p className="text-3xl font-bold text-white">{v}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Charts grid 2×3 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card>
          <CardHeader title="Risk Distribution Over Time" subtitle="Stacked area" />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data}>
                <defs>
                  {[['low','#10B981'],['medium','#F59E0B'],['high','#3B82F6'],['critical','#EF4444']].map(([k,c]) => (
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip content={<TT />} />
                <Legend />
                <Area type="monotone" dataKey="low" name="Low" stackId="1" stroke="#10B981" fill="url(#g-low)" />
                <Area type="monotone" dataKey="medium" name="Medium" stackId="1" stroke="#F59E0B" fill="url(#g-medium)" />
                <Area type="monotone" dataKey="high" name="High" stackId="1" stroke="#3B82F6" fill="url(#g-high)" />
                <Area type="monotone" dataKey="critical" name="Critical" stackId="1" stroke="#EF4444" fill="url(#g-critical)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="PPV vs Distance" subtitle="Scatter by risk level" />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="distance" name="Distance (m)" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis dataKey="ppv" name="PPV (mm/s)" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Scatter data={scatterData} name="Predictions">
                  {scatterData.map((d, i) => <Cell key={i} fill={scatterColors[d.risk] || '#64748B'} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="BISF Score Distribution" subtitle="Score range histogram" />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={distData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip content={<TT />} />
                <Bar dataKey="count" name="Predictions" radius={[4,4,0,0]}>
                  {distData.map((_, i) => (
                    <Cell key={i} fill={['#10B981','#F59E0B','#3B82F6','#EF4444'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Site Comparison" subtitle="Multi-dimensional radar" />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="site" tick={{ fontSize: 9, fill: '#94A3B8' }} />
                <PolarRadiusAxis tick={{ fontSize: 8, fill: '#94A3B8' }} />
                <Radar name="BISF" dataKey="bisf" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} />
                <Radar name="Stability" dataKey="stability" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Monthly Blast Activity" subtitle="Blasts per day" />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip content={<TT />} />
                <Bar dataKey="blasts" name="Blasts" fill="#3B82F6" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Prediction Accuracy" subtitle="Model accuracy over time" />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} domain={[75, 100]} />
                <Tooltip content={<TT />} />
                <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
