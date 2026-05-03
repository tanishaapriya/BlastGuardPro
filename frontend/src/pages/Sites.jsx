import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ExternalLink, MapPin, Activity, Mountain } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { Badge, RiskBadge } from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import Modal from '../components/ui/Modal';
import { SITES, ROCK_TYPES, RISK_COLORS } from '../utils/constants';
import { MOCK_PREDICTIONS } from '../utils/mockData';
import { fmtDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const STATUS_VARIANT = { Active: 'success', Monitoring: 'warning', Inactive: 'default' };

const ROCK_ICONS = {
  Granite:   '🪨', Limestone: '🏔️', Sandstone: '🗺️',
  Basalt:    '⛰️', Shale:     '📐', Coal:      '⬛', Mixed: '🔷',
};

export default function Sites() {
  const nav = useNavigate();
  const [sites, setSites]           = useState(SITES.map(s => ({ ...s })));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editSite, setEditSite]     = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [form, setForm] = useState({
    name: '', location: '', lat: '', lng: '',
    rockType: 'Granite', slopeAngle: 45, status: 'Active',
  });

  const openNew = () => {
    setEditSite(null);
    setForm({ name: '', location: '', lat: '', lng: '', rockType: 'Granite', slopeAngle: 45, status: 'Active' });
    setDrawerOpen(true);
  };
  const openEdit = s => {
    setEditSite(s);
    setForm({ name: s.name, location: s.location, lat: s.lat, lng: s.lng, rockType: s.rockType, slopeAngle: s.slopeAngle, status: s.status });
    setDrawerOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) { toast.error('Site name required'); return; }
    if (editSite) {
      setSites(p => p.map(s => s.id === editSite.id ? { ...s, ...form } : s));
      toast.success('Site updated');
    } else {
      setSites(p => [...p, { id: `s${Date.now()}`, ...form, lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 }]);
      toast.success('Site added');
    }
    setDrawerOpen(false);
  };

  const deleteSite = () => {
    setSites(p => p.filter(s => s.id !== deleteModal.id));
    toast.success('Site deleted');
    setDeleteModal(null);
  };

  return (
    <div className="space-y-8 max-w-[1200px]">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#3B82F6' }}>
            Site Management
          </p>
          <h1 className="text-2xl font-bold" style={{ color: '#E2EAF4' }}>
            {sites.length} Mining Sites
          </h1>
          <p className="text-sm mt-1" style={{ color: '#5A7A9A' }}>
            Monitor and manage all registered mining locations
          </p>
        </div>
        <Button icon={Plus} onClick={openNew}>Add New Site</Button>
      </div>

      {/* ── Site grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sites.map((site, i) => {
          const lastPred = MOCK_PREDICTIONS.find(p => p.siteId === site.id);
          const risk     = lastPred?.outputs.risk_level || 'Low';
          const rc       = RISK_COLORS[risk] || RISK_COLORS.Low;

          return (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ease: 'easeOut' }}
            >
              <div
                className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer group"
                style={{
                  background: '#0D1829',
                  border: `1px solid ${rc.border}28`,
                }}
                onClick={() => nav(`/sites/${site.id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = rc.border + '50';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 32px ${rc.glow}, 0 1px 3px rgba(0,0,0,0.4)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = rc.border + '28';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top risk accent bar */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${rc.border}, ${rc.border}50)` }} />

                {/* Card body */}
                <div className="p-6">
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl leading-none">{ROCK_ICONS[site.rockType] || '⛰️'}</span>
                        <Badge variant={STATUS_VARIANT[site.status] || 'default'}>
                          {site.status}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold leading-snug" style={{ color: '#E2EAF4' }}>
                        {site.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin style={{ width: 12, height: 12, flexShrink: 0, color: '#3D5470' }} />
                        <span className="text-xs truncate" style={{ color: '#5A7A9A' }}>{site.location}</span>
                      </div>
                    </div>
                    <RiskBadge level={risk} />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <StatItem label="Rock Type" value={site.rockType} />
                    <StatItem label="Slope" value={`${site.slopeAngle}°`} />
                    <StatItem label="Last Blast" value={lastPred ? fmtDate(lastPred.timestamp) : '—'} />
                  </div>

                  {/* BISF score bar */}
                  {lastPred && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#3D5470' }}>
                          BISF Score
                        </span>
                        <span className="text-xs font-bold" style={{ color: '#E2EAF4' }}>
                          {lastPred.outputs.bisf_score.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full w-full" style={{ background: '#111E30' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${lastPred.outputs.bisf_score}%`,
                            background: `linear-gradient(90deg, ${rc.border}90, ${rc.border})`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action footer */}
                <div
                  className="flex"
                  style={{ borderTop: '1px solid #111E30' }}
                  onClick={e => e.stopPropagation()}
                >
                  <ActionBtn icon={ExternalLink} label="View"   onClick={() => nav(`/sites/${site.id}`)} accent />
                  <ActionBtn icon={Edit2}        label="Edit"   onClick={() => openEdit(site)} />
                  <ActionBtn icon={Trash2}       label="Delete" onClick={() => setDeleteModal(site)} danger />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add new placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sites.length * 0.06 }}
        >
          <button
            onClick={openNew}
            className="w-full min-h-[260px] rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-200 group"
            style={{ border: '2px dashed #1E2D45', background: 'transparent' }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
              e.currentTarget.style.background = 'rgba(59,130,246,0.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#1E2D45';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
              style={{ background: '#111E30', border: '1px solid #1E2D45' }}
            >
              <Plus style={{ width: 22, height: 22, color: '#3D5470' }}
                className="group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold transition-colors" style={{ color: '#5A7A9A' }}>
                Add New Site
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#3D5470' }}>Register a mining location</p>
            </div>
          </button>
        </motion.div>
      </div>

      {/* ── Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editSite ? 'Edit Site' : 'Add New Site'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)} fullWidth>Cancel</Button>
            <Button onClick={save} fullWidth>Save Site</Button>
          </div>
        }
      >
        <div className="space-y-5">
          {[
            ['name',     'Site Name', 'text',  'e.g. Rajasthan Quarry A'],
            ['location', 'Location',  'text',  'State, Country'],
          ].map(([k, l, t, ph]) => (
            <FormField key={k} label={l}>
              <input
                type={t} value={form[k]} placeholder={ph}
                onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                className="input-base"
              />
            </FormField>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {[['lat', 'Latitude'], ['lng', 'Longitude']].map(([k, l]) => (
              <FormField key={k} label={l}>
                <input
                  type="number" step="0.0001" value={form[k]}
                  onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="input-base"
                />
              </FormField>
            ))}
          </div>

          <FormField label="Rock Type">
            <select
              value={form.rockType}
              onChange={e => setForm(p => ({ ...p, rockType: e.target.value }))}
              className="input-base"
            >
              {ROCK_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>

          <FormField label={<>Slope Angle — <span style={{ color: '#3B82F6' }}>{form.slopeAngle}°</span></>}>
            <input
              type="range" min={5} max={90}
              value={form.slopeAngle}
              onChange={e => setForm(p => ({ ...p, slopeAngle: +e.target.value }))}
            />
          </FormField>

          <FormField label="Status">
            <div className="flex gap-2">
              {['Active', 'Monitoring', 'Inactive'].map(s => (
                <button
                  key={s} type="button"
                  onClick={() => setForm(p => ({ ...p, status: s }))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    background: form.status === s ? 'rgba(59,130,246,0.15)' : '#111E30',
                    borderColor: form.status === s ? 'rgba(59,130,246,0.5)' : '#1E2D45',
                    color: form.status === s ? '#3B82F6' : '#5A7A9A',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormField>
        </div>
      </Drawer>

      {/* ── Delete modal ── */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Site"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={deleteSite}>Delete Site</Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed" style={{ color: '#7A92AE' }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: '#E2EAF4' }}>{deleteModal?.name}</strong>?
          <br />
          <span className="mt-2 block" style={{ color: '#3D5470' }}>This action cannot be undone.</span>
        </p>
      </Modal>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function StatItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#3D5470' }}>
        {label}
      </p>
      <p className="text-xs font-semibold" style={{ color: '#A8C0D6' }}>{value}</p>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, accent, danger }) {
  const baseColor = accent ? '#3B82F6' : danger ? '#5A7A9A' : '#5A7A9A';
  const hoverBg   = accent ? 'rgba(59,130,246,0.08)' : danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)';
  const hoverColor = accent ? '#60A5FA' : danger ? '#EF4444' : '#E2EAF4';

  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all"
      style={{ color: baseColor }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverColor; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = baseColor; }}
    >
      <Icon style={{ width: 13, height: 13 }} />
      {label}
    </button>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: '#7A92AE' }}>{label}</label>
      {children}
    </div>
  );
}
