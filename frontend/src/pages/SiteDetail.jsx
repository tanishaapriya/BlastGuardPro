import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Activity, FileText, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { RiskBadge, Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import { SITES, RISK_COLORS } from '../utils/constants';
import { MOCK_PREDICTIONS, MOCK_ANALYTICS } from '../utils/mockData';
import { fmtDate, fmtRelative } from '../utils/formatters';

const TABS = [
  { id: 'overview', label: 'Overview', icon: MapPin },
  { id: 'history', label: 'Blast History', icon: Activity },
  { id: 'monitoring', label: 'Slope Monitoring', icon: Layers },
  { id: 'documents', label: 'Documents', icon: FileText },
];

const DOCS = [
  { name: 'Geological Survey Report 2024.pdf', size: '4.2 MB', date: '2024-11-15' },
  { name: 'Blast Design Specification v3.docx', size: '1.8 MB', date: '2024-12-01' },
  { name: 'Safety Assessment Q4 2024.pdf', size: '2.1 MB', date: '2024-12-20' },
  { name: 'Monitoring Instrumentation Plan.pdf', size: '3.5 MB', date: '2025-01-10' },
];

export default function SiteDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [tab, setTab] = useState('overview');

  const site = SITES.find((s) => s.id === id) || SITES[0];
  const sitePreds = MOCK_PREDICTIONS.filter((p) => p.siteId === id).slice(0, 15);
  const risk = sitePreds[0]?.outputs.risk_level || 'Low';
  const riskColor = RISK_COLORS[risk];

  const stabilityData = MOCK_ANALYTICS.slice(0, 20).map((d, i) => ({
    date: d.date,
    stability: Math.max(20, Math.min(95, 65 - i * 0.5 + Math.random() * 15 - 7)),
    threshold: 40,
  }));

  return (
    <div className="space-y-5 max-w-screen-xl">
      <Breadcrumbs />
      <div className="flex items-center gap-4">
        <button onClick={() => nav('/sites')} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">{site.name}</h1>
            <RiskBadge level={risk} />
            <Badge variant={site.status === 'Active' ? 'success' : 'default'}>{site.status}</Badge>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-sm mt-0.5">
            <MapPin className="w-3.5 h-3.5" />{site.location}
          </div>
        </div>
        <Button onClick={() => nav('/predict')}>New Prediction →</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1E293B' }}>
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button key={tid} onClick={() => setTab(tid)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === tid ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
            style={tab === tid ? { background: '#3B82F6' } : {}}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader title="Site Map" subtitle="Approximate location" />
            <CardBody>
              <div className="h-48 rounded-xl flex items-center justify-center" style={{ background: '#0F172A', border: '1px solid #334155' }}>
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-white font-medium">{site.name}</p>
                  <p className="text-slate-400 text-sm">{site.lat.toFixed(4)}, {site.lng.toFixed(4)}</p>
                  <p className="text-slate-500 text-xs mt-1">{site.location}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Geology Summary" />
            <CardBody>
              <div className="space-y-3">
                {[
                  ['Rock Type', site.rockType], ['Slope Angle', `${site.slopeAngle}°`],
                  ['Coordinates', `${site.lat.toFixed(3)}, ${site.lng.toFixed(3)}`],
                  ['Status', site.status], ['Total Predictions', sitePreds.length || '~15'],
                  ['Last Blast', sitePreds[0] ? fmtDate(sitePreds[0].timestamp) : 'N/A'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-sm text-slate-400">{l}</span>
                    <span className="text-sm font-semibold text-white">{v}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'history' && (
        <Card>
          <CardHeader title="Blast History" subtitle={`${sitePreds.length} recorded blasts`} />
          <CardBody>
            <div className="space-y-3">
              {(sitePreds.length ? sitePreds : MOCK_PREDICTIONS.slice(0, 8)).map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/30 transition-colors"
                  style={{ borderLeft: `3px solid ${RISK_COLORS[p.outputs.risk_level]?.border}` }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-white">{p.blast_type || 'Surface Blast'}</span>
                      <RiskBadge level={p.outputs.risk_level} />
                    </div>
                    <span className="text-xs text-slate-400">{fmtRelative(p.timestamp)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{p.outputs.bisf_score.toFixed(1)}</p>
                    <p className="text-xs text-slate-400">BISF Score</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{p.outputs.ppv}</p>
                    <p className="text-xs text-slate-400">PPV mm/s</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {tab === 'monitoring' && (
        <Card>
          <CardHeader title="Slope Stability Index" subtitle="Last 20 readings" />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="stability" name="Stability Index" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="threshold" name="Safety Threshold" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {tab === 'documents' && (
        <Card>
          <CardHeader title="Site Documents" action={<Button size="sm" variant="outline">Upload</Button>} />
          <CardBody>
            <div className="space-y-2">
              {DOCS.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 transition-colors border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#3B82F6' + '20' }}>
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.size} · {fmtDate(doc.date)}</p>
                    </div>
                  </div>
                  <Button size="xs" variant="ghost">Download</Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
