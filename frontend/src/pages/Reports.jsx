import { useState } from 'react';
import { FileText, Download, Trash2, Plus, Calendar } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { SITES } from '../utils/constants';
import { fmtDate, fmtRelative } from '../utils/formatters';
import { subDays } from 'date-fns';
import { toast } from 'react-toastify';

const TEMPLATES = [
  { id: 'summary',     title: 'Summary Report',             desc: 'High-level overview of all blast activities and risk levels',        icon: '📊', color: '#3B82F6' },
  { id: 'technical',   title: 'Detailed Technical Report',  desc: 'Full blast parameters, model outputs, and statistical analysis',     icon: '🔬', color: '#3B82F6' },
  { id: 'regulatory',  title: 'Regulatory Compliance Report',desc: 'PPV, air overpressure, and statutory limit compliance summary',     icon: '⚖️', color: '#10B981' },
  { id: 'safety',      title: 'Site Safety Report',         desc: 'Risk register, incident log, and safety officer checklist',          icon: '🛡️', color: '#8B5CF6' },
];

const FORMATS = ['PDF', 'Excel', 'CSV'];
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];

const RECENT = [
  { id: 'r1', name: 'Summary Report - Rajasthan',    type: 'Summary',    date: subDays(new Date(), 2), size: '1.2 MB' },
  { id: 'r2', name: 'Technical Report - Karnataka',  type: 'Technical',  date: subDays(new Date(), 5), size: '3.8 MB' },
  { id: 'r3', name: 'Compliance Q4 2024',            type: 'Compliance', date: subDays(new Date(), 15), size: '0.9 MB' },
  { id: 'r4', name: 'Safety Report - All Sites',     type: 'Safety',     date: subDays(new Date(), 20), size: '2.1 MB' },
];

const SCHEDULED = [
  { id: 's1', name: 'Weekly Summary - Rajasthan',    freq: 'Weekly',  site: 'Rajasthan Quarry Site A', format: 'PDF' },
  { id: 's2', name: 'Monthly Compliance - All Sites',freq: 'Monthly', site: 'All Sites',               format: 'PDF' },
];

export default function Reports() {
  const [genModal, setGenModal] = useState(null);
  const [recent, setRecent] = useState(RECENT);
  const [form, setForm] = useState({ site: '', dateFrom: '', dateTo: '', format: 'PDF' });

  const generate = () => {
    toast.success(`${genModal?.title} generated!`);
    setRecent((p) => [{
      id: `r${Date.now()}`, name: `${genModal.title} - ${new Date().toLocaleDateString()}`,
      type: genModal.id, date: new Date(), size: '1.5 MB',
    }, ...p]);
    setGenModal(null);
  };

  return (
    <div className="space-y-5 max-w-screen-xl">
      {/* Templates */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-700/50 p-4 hover:border-slate-600 transition-all cursor-pointer hover:scale-[1.02]"
              style={{ background: '#1E293B' }} onClick={() => setGenModal(t)}>
              <div className="text-3xl mb-3">{t.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1">{t.title}</h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">{t.desc}</p>
              <Button size="sm" fullWidth onClick={(e) => { e.stopPropagation(); setGenModal(t); }}>Generate</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent reports */}
        <Card>
          <CardHeader title="Recent Reports" subtitle="Last generated reports" />
          <CardBody>
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/40 transition-colors border border-slate-800">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#3B82F6' + '20' }}>
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.size} · {fmtRelative(r.date)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="xs" variant="ghost" icon={Download} onClick={() => toast.success('Downloading...')} />
                    <Button size="xs" variant="ghost" icon={Trash2} onClick={() => setRecent(p => p.filter(x => x.id !== r.id))} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Scheduled reports */}
        <Card>
          <CardHeader title="Scheduled Reports" subtitle="Automatic report generation"
            action={<Button size="sm" icon={Plus} variant="outline" onClick={() => toast.info('Schedule setup coming soon')}>Schedule</Button>} />
          <CardBody>
            <div className="space-y-3">
              {SCHEDULED.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#3B82F620' }}>
                      <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.site} · {s.format}</p>
                    </div>
                  </div>
                  <Badge variant="info">{s.freq}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Generate modal */}
      <Modal open={!!genModal} onClose={() => setGenModal(null)} title={`Generate: ${genModal?.title}`}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setGenModal(null)}>Cancel</Button>
            <Button icon={FileText} onClick={generate}>Generate Report</Button>
          </div>
        }>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Site</label>
            <select value={form.site} onChange={(e) => setForm(p => ({ ...p, site: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none">
              <option value="">All Sites</option>
              {SITES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['dateFrom','Date From'],['dateTo','Date To']].map(([k,l]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{l}</label>
                <input type="date" value={form[k]} onChange={(e) => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Format</label>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setForm(p => ({ ...p, format: f }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${form.format === f ? 'text-white border-blue-500 bg-blue-500/20' : 'text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
