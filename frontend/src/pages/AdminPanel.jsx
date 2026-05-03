import { useState } from 'react';
import { Users, Settings, FileText, Key, Plus, Edit2, MoreVertical, Copy, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { MOCK_USERS } from '../utils/constants';
import { MOCK_AUDIT_LOGS } from '../utils/mockData';
import { ROLES } from '../utils/constants';
import { fmtDateTime, fmtRelative } from '../utils/formatters';
import { toast } from 'react-toastify';

const TABS = [
  { id: 'users',    label: 'User Management', icon: Users    },
  { id: 'settings', label: 'System Settings', icon: Settings },
  { id: 'audit',    label: 'Audit Logs',       icon: FileText },
  { id: 'apikeys',  label: 'API Keys',         icon: Key      },
];

const FAKE_KEYS = [
  { id: 'k1', name: 'Production API Key', key: 'bg_live_xk8f...9a2c', created: '2025-01-15', status: 'Active' },
  { id: 'k2', name: 'Development Key',    key: 'bg_test_m3p2...7b1d', created: '2025-03-10', status: 'Active' },
];

const ALL_USERS = [
  ...MOCK_USERS.map(u => ({ ...u, status: 'Active', lastLogin: '2 hours ago' })),
  { id:'u4', name:'Suresh Kumar', email:'safety@blastguard.com', role:'Safety Officer', org:'Rajasthan Mines Ltd', status:'Active', lastLogin:'1 day ago' },
  { id:'u5', name:'Anita Desai',  email:'researcher@geotech.com',role:'Researcher',     org:'GeoTech India',      status:'Inactive', lastLogin:'30 days ago' },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('users');
  const [inviteModal, setInviteModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [settings, setSettings] = useState({ ppvLimit: 25, bisfLimit: 75, airBlast: 115, emailAlerts: true, smsAlerts: false, maintenanceMode: false });
  const [keys, setKeys] = useState(FAKE_KEYS);

  const statusBadge = (s) => s === 'Active' ? 'success' : 'default';

  return (
    <div className="space-y-5 max-w-screen-xl">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: '#1E293B' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            style={tab === id ? { background: '#3B82F6' } : {}}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* User Management */}
      {tab === 'users' && (
        <Card>
          <CardHeader title="User Management" subtitle={`${ALL_USERS.length} users`}
            action={<Button size="sm" icon={Plus} onClick={() => setInviteModal(true)}>Invite User</Button>} />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['Name','Email','Role','Organization','Status','Last Login','Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 uppercase font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_USERS.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{u.role}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{u.org}</td>
                    <td className="px-4 py-3"><Badge variant={statusBadge(u.status)}>{u.status}</Badge></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditUser(u)} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toast.success('Password reset sent')} className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Reset Password"><Key className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toast.success('User deactivated')} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* System Settings */}
      {tab === 'settings' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Risk Thresholds" />
            <CardBody>
              <div className="space-y-5">
                {[
                  ['ppvLimit','PPV Threshold','mm/s',1,100],
                  ['bisfLimit','BISF Score Limit','score',10,100],
                  ['airBlast','Air Blast Limit','dB',80,160],
                ].map(([k,l,u,min,max]) => (
                  <div key={k}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">{l}</span>
                      <span className="text-white font-semibold">{settings[k]} {u}</span>
                    </div>
                    <input type="range" min={min} max={max} value={settings[k]}
                      onChange={(e) => setSettings(p => ({ ...p, [k]: +e.target.value }))} />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notifications & System" />
            <CardBody>
              <div className="space-y-4">
                {[
                  ['emailAlerts','Email Alerts'],
                  ['smsAlerts','SMS Alerts'],
                  ['maintenanceMode','Maintenance Mode'],
                ].map(([k,l]) => (
                  <div key={k} className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-sm text-slate-300">{l}</span>
                    <button onClick={() => setSettings(p => ({ ...p, [k]: !p[k] }))}
                      className={`relative w-10 h-6 rounded-full transition-colors ${settings[k] ? 'bg-blue-500' : 'bg-slate-700'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[k] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <Button fullWidth className="mt-4" onClick={() => toast.success('Settings saved')}>Save Settings</Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Audit Logs */}
      {tab === 'audit' && (
        <Card>
          <CardHeader title="Audit Logs" subtitle="System activity"
            action={<Button size="sm" variant="outline" onClick={() => toast.success('CSV exported')}>Export CSV</Button>} />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['Timestamp','User','Action','IP Address','Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 uppercase font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_AUDIT_LOGS.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{fmtRelative(log.ts)}</td>
                    <td className="px-4 py-3 text-white font-medium">{log.user}</td>
                    <td className="px-4 py-3 text-slate-300">{log.action}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{log.ip}</td>
                    <td className="px-4 py-3"><Badge variant={log.status === 'Success' ? 'success' : 'danger'}>{log.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* API Keys */}
      {tab === 'apikeys' && (
        <Card>
          <CardHeader title="API Keys" subtitle="Manage access tokens"
            action={<Button size="sm" icon={Plus} onClick={() => { setKeys(p => [...p, { id:`k${Date.now()}`, name:`Key ${p.length+1}`, key:`bg_live_${Math.random().toString(36).slice(2,10)}...`, created: new Date().toISOString().split('T')[0], status:'Active' }]); toast.success('API key generated'); }}>Generate Key</Button>} />
          <CardBody>
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/20 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{k.name}</p>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{k.key}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Created {k.created}</p>
                  </div>
                  <Badge variant="success">{k.status}</Badge>
                  <div className="flex gap-1">
                    <button onClick={() => { navigator.clipboard?.writeText(k.key); toast.success('Copied!'); }} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setKeys(p => p.filter(x => x.id !== k.id)); toast.success('Key revoked'); }} className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Invite modal */}
      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title="Invite User"
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setInviteModal(false)}>Cancel</Button><Button onClick={() => { toast.success('Invitation sent!'); setInviteModal(false); }}>Send Invite</Button></div>}>
        <div className="space-y-4">
          {[['email','Email Address','email'],['name','Full Name','text']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{l}</label>
              <input type={t} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <select className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit user modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">Editing <strong className="text-white">{editUser?.name}</strong></p>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <select className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none" defaultValue={editUser?.role}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <Button fullWidth onClick={() => { toast.success('User updated'); setEditUser(null); }}>Update User</Button>
        </div>
      </Modal>
    </div>
  );
}
