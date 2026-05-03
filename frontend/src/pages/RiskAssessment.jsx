import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import Modal from '../components/ui/Modal';
import { MOCK_ANALYTICS } from '../utils/mockData';
import { toast } from 'react-toastify';

const LIKELIHOOD = ['Rare','Unlikely','Possible','Likely','Almost Certain'];
const CONSEQUENCE = ['Negligible','Minor','Moderate','Major','Catastrophic'];

const cellColor = (row, col) => {
  const score = (row + 1) * (col + 1);
  if (score <= 4) return { bg: 'rgba(16,185,129,0.25)', border: '#10B981', text: '#10B981' };
  if (score <= 9) return { bg: 'rgba(245,158,11,0.25)', border: '#F59E0B', text: '#F59E0B' };
  if (score <= 15) return { bg: 'rgba(59,130,246,0.25)', border: '#3B82F6', text: '#3B82F6' };
  return { bg: 'rgba(239,68,68,0.25)', border: '#EF4444', text: '#EF4444' };
};

const INITIAL_RISKS = [
  { id:'r1', desc:'Slope failure during blasting',      likelihood: 2, consequence: 4, owner:'Site Engineer', mitigation:'Pre-blast stability assessment', status:'Open' },
  { id:'r2', desc:'Excessive PPV at structures',        likelihood: 3, consequence: 3, owner:'Blast Manager',  mitigation:'Reduce charge per delay',        status:'Mitigated' },
  { id:'r3', desc:'Groundwater flooding blast holes',   likelihood: 1, consequence: 2, owner:'Safety Officer', mitigation:'Regular water level monitoring',  status:'Open' },
  { id:'r4', desc:'Flyrock incident',                   likelihood: 2, consequence: 4, owner:'Site Engineer', mitigation:'Blast mats and exclusion zones',   status:'Closed' },
  { id:'r5', desc:'Premature detonation',               likelihood: 0, consequence: 4, owner:'Blast Manager',  mitigation:'Electronic detonator use',         status:'Mitigated' },
];

const statusV = { Open: 'danger', Mitigated: 'warning', Closed: 'success' };
const riskLevel = (l, c) => { const s = (l+1)*(c+1); return s<=4?'Low':s<=9?'Medium':s<=15?'High':'Critical'; };

export default function RiskAssessment() {
  const [risks, setRisks] = useState(INITIAL_RISKS);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRisk, setEditRisk] = useState(null);
  const [delModal, setDelModal] = useState(null);
  const [form, setForm] = useState({ desc:'', likelihood:0, consequence:0, owner:'', mitigation:'', status:'Open' });

  const trendData = MOCK_ANALYTICS.slice(0,12).map((d) => ({ date: d.date, score: d.avgBisf }));

  const openNew = () => { setEditRisk(null); setForm({ desc:'', likelihood:0, consequence:0, owner:'', mitigation:'', status:'Open' }); setDrawerOpen(true); };
  const openEdit = (r) => { setEditRisk(r); setForm({ ...r }); setDrawerOpen(true); };

  const save = () => {
    if (!form.desc.trim()) { toast.error('Description required'); return; }
    if (editRisk) {
      setRisks((p) => p.map((r) => r.id === editRisk.id ? { ...r, ...form } : r));
      toast.success('Risk updated');
    } else {
      setRisks((p) => [...p, { id:`r${Date.now()}`, ...form }]);
      toast.success('Risk added');
    }
    setDrawerOpen(false);
  };

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Risk Matrix */}
        <Card>
          <CardHeader title="Risk Matrix" subtitle="Click cell to filter risks" />
          <CardBody>
            <div className="overflow-x-auto">
              <div className="min-w-96">
                <div className="flex items-center mb-1 ml-24">
                  {CONSEQUENCE.map((c) => (
                    <div key={c} className="flex-1 text-center text-[10px] text-slate-400 font-medium px-1">{c}</div>
                  ))}
                </div>
                {LIKELIHOOD.map((l, li) => (
                  <div key={l} className="flex items-center mb-1">
                    <div className="w-24 text-[10px] text-slate-400 font-medium text-right pr-2 flex-shrink-0">{l}</div>
                    {CONSEQUENCE.map((c, ci) => {
                      const style = cellColor(li, ci);
                      const isSelected = selected?.row === li && selected?.col === ci;
                      return (
                        <button key={c} onClick={() => setSelected(isSelected ? null : { row: li, col: ci })}
                          className="flex-1 h-10 rounded-md mx-0.5 text-xs font-bold transition-all hover:scale-105 border"
                          style={{ background: style.bg, borderColor: isSelected ? style.border : style.border + '40', color: style.text }}>
                          {(li+1)*(ci+1)}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-3 flex-wrap">
              {[['Low','#10B981'],['Medium','#F59E0B'],['High','#3B82F6'],['Critical','#EF4444']].map(([r,c]) => (
                <div key={r} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: c + '40', border: `1px solid ${c}` }} />
                  <span className="text-xs text-slate-400">{r}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Trend */}
        <Card>
          <CardHeader title="Risk Score Trend" subtitle="Last 12 periods" />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} domain={[0,100]} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" name="BISF Score" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Risk Register */}
      <Card>
        <CardHeader title="Risk Register" subtitle={`${risks.length} risks tracked`}
          action={<Button size="sm" icon={Plus} onClick={openNew}>Add Risk</Button>} />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['ID','Description','Likelihood','Consequence','Risk Level','Owner','Mitigation','Status',''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 uppercase font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {risks.map((r) => {
                  const rl = riskLevel(r.likelihood, r.consequence);
                  const rColor = { Low:'#10B981', Medium:'#F59E0B', High:'#3B82F6', Critical:'#EF4444' }[rl];
                  return (
                    <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{r.id}</td>
                      <td className="px-4 py-3 text-white max-w-48"><p className="line-clamp-2 text-xs">{r.desc}</p></td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{LIKELIHOOD[r.likelihood]}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{CONSEQUENCE[r.consequence]}</td>
                      <td className="px-4 py-3"><span className="text-xs font-semibold" style={{ color: rColor }}>{rl}</span></td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{r.owner}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs max-w-40"><p className="line-clamp-2">{r.mitigation}</p></td>
                      <td className="px-4 py-3"><Badge variant={statusV[r.status]}>{r.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(r)} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => setDelModal(r)} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Risk Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editRisk ? 'Edit Risk' : 'Add Risk'}
        footer={<div className="flex gap-2"><Button variant="outline" onClick={() => setDrawerOpen(false)} fullWidth>Cancel</Button><Button onClick={save} fullWidth>Save Risk</Button></div>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea value={form.desc} onChange={(e) => setForm(p => ({ ...p, desc: e.target.value }))} rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['likelihood','consequence'].map((k) => (
              <div key={k}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 capitalize">{k}</label>
                <select value={form[k]} onChange={(e) => setForm(p => ({ ...p, [k]: +e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70">
                  {(k === 'likelihood' ? LIKELIHOOD : CONSEQUENCE).map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>
          {[['owner','Owner','text'],['mitigation','Mitigation Measure','text']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{l}</label>
              <input type={t} value={form[k]} onChange={(e) => setForm(p => ({ ...p, [k]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70">
              {['Open','Mitigated','Closed'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Drawer>

      <Modal open={!!delModal} onClose={() => setDelModal(null)} title="Delete Risk"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setDelModal(null)}>Cancel</Button><Button variant="danger" onClick={() => { setRisks(p => p.filter(r => r.id !== delModal.id)); toast.success('Risk deleted'); setDelModal(null); }}>Delete</Button></div>}>
        <p className="text-slate-300">Remove risk <strong className="text-white">"{delModal?.desc}"</strong>?</p>
      </Modal>
    </div>
  );
}
