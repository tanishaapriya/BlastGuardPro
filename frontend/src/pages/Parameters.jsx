import { useState } from 'react';
import { Plus, Copy, Trash2, Edit2, Search } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Drawer from '../components/ui/Drawer';
import Modal from '../components/ui/Modal';
import { MOCK_BLAST_PARAMS } from '../utils/mockData';
import { ROCK_TYPES, BLAST_TYPES } from '../utils/constants';
import { fmtDate } from '../utils/formatters';
import { toast } from 'react-toastify';

export default function Parameters() {
  const [params, setParams] = useState(MOCK_BLAST_PARAMS);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editParam, setEditParam] = useState(null);
  const [delModal, setDelModal] = useState(null);
  const [form, setForm] = useState({ name:'', rockType:'Granite', blastType:'Surface Blast', maxCharge:25, burden:2.5, spacing:3.0 });

  const filtered = params.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.rockType.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditParam(null); setForm({ name:'', rockType:'Granite', blastType:'Surface Blast', maxCharge:25, burden:2.5, spacing:3.0 }); setDrawerOpen(true); };
  const openEdit = (p) => { setEditParam(p); setForm({ ...p }); setDrawerOpen(true); };

  const save = () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    if (editParam) {
      setParams((p) => p.map((x) => x.id === editParam.id ? { ...x, ...form } : x));
      toast.success('Configuration updated');
    } else {
      setParams((p) => [...p, { id: `bp${Date.now()}`, ...form, createdBy: 'Current User', lastUsed: new Date().toISOString() }]);
      toast.success('Configuration saved');
    }
    setDrawerOpen(false);
  };

  const clone = (p) => {
    const cloned = { ...p, id: `bp${Date.now()}`, name: `${p.name} (Copy)`, lastUsed: new Date().toISOString() };
    setParams((prev) => [...prev, cloned]);
    toast.success('Configuration cloned');
  };

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search configurations..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
        </div>
        <Button icon={Plus} onClick={openNew}>New Configuration</Button>
      </div>

      <Card>
        <CardHeader title="Blast Parameter Library" subtitle={`${filtered.length} saved configurations`} />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['Name','Rock Type','Blast Type','Max Charge','Burden','Spacing','Created By','Last Used','Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 uppercase font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                    <td className="px-4 py-3 text-slate-300">{p.rockType}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{p.blastType}</td>
                    <td className="px-4 py-3 text-slate-300">{p.maxCharge} kg</td>
                    <td className="px-4 py-3 text-slate-300">{p.burden} m</td>
                    <td className="px-4 py-3 text-slate-300">{p.spacing} m</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{p.createdBy}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(p.lastUsed)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => clone(p)} className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Clone"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDelModal(p)} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-10 text-slate-500">No configurations found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editParam ? 'Edit Configuration' : 'New Configuration'}
        footer={<div className="flex gap-2"><Button variant="outline" onClick={() => setDrawerOpen(false)} fullWidth>Cancel</Button><Button onClick={save} fullWidth>Save</Button></div>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Configuration Name</label>
            <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Standard Granite Blast"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70" />
          </div>
          {[['rockType','Rock Type',ROCK_TYPES],['blastType','Blast Type',BLAST_TYPES]].map(([k,l,opts]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{l}</label>
              <select value={form[k]} onChange={(e) => setForm(p => ({ ...p, [k]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70">
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {[['maxCharge','Max Charge (kg)',0.5,200,0.5],['burden','Burden (m)',0.5,10,0.1],['spacing','Spacing (m)',0.5,12,0.1]].map(([k,l,min,max,step]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{l}</label>
              <div className="flex items-center gap-3">
                <input type="range" min={min} max={max} step={step} value={form[k]}
                  onChange={(e) => setForm(p => ({ ...p, [k]: parseFloat(e.target.value) }))} className="flex-1" />
                <span className="text-white font-semibold w-12 text-right">{form[k]}</span>
              </div>
            </div>
          ))}
        </div>
      </Drawer>

      <Modal open={!!delModal} onClose={() => setDelModal(null)} title="Delete Configuration"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setDelModal(null)}>Cancel</Button><Button variant="danger" onClick={() => { setParams(p => p.filter(x => x.id !== delModal.id)); toast.success('Deleted'); setDelModal(null); }}>Delete</Button></div>}>
        <p className="text-slate-300">Delete <strong className="text-white">"{delModal?.name}"</strong>?</p>
      </Modal>
    </div>
  );
}
