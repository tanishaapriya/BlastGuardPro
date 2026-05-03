import { useState } from 'react';
import { User, Shield, Bell, Sliders } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ROLES } from '../utils/constants';
import { toast } from 'react-toastify';

const TABS = [
  { id: 'profile',      label: 'Profile',       icon: User    },
  { id: 'security',     label: 'Security',       icon: Shield  },
  { id: 'notifications',label: 'Notifications',  icon: Bell    },
  { id: 'preferences',  label: 'Preferences',    icon: Sliders },
];

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)}
    className={`relative w-10 h-6 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-slate-700'}`}>
    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
  </button>
);

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { isDark, toggle } = useTheme();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', org: user?.org || '', role: user?.role || '', bio: '' });
  const [notifs, setNotifs] = useState({ emailRisk: true, emailPred: true, inAppRisk: true, inAppPred: true, inAppSystem: false });
  const [prefs, setPrefs] = useState({ units: 'metric', language: 'English' });

  const saveProfile = () => {
    updateProfile({ name: profile.name, org: profile.org, role: profile.role });
    toast.success('Profile updated');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1E293B' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            style={tab === id ? { background: '#3B82F6' } : {}}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <Card>
          <CardHeader title="Profile Information" />
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={user?.name} size="xl" />
              <div>
                <p className="text-white font-semibold">{user?.name}</p>
                <p className="text-slate-400 text-sm">{user?.email}</p>
                <p className="text-slate-500 text-xs mt-0.5">{user?.role} · {user?.org}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization</label>
                <input value={profile.org} onChange={(e) => setProfile(p => ({ ...p, org: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
                <select value={profile.role} onChange={(e) => setProfile(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email (read-only)</label>
                <input value={user?.email || ''} readOnly
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 text-sm cursor-not-allowed" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                <textarea value={profile.bio} onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70 resize-none" />
              </div>
            </div>
            <Button className="mt-4" onClick={saveProfile}>Save Profile</Button>
          </CardBody>
        </Card>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Change Password" />
            <CardBody>
              <div className="space-y-3 max-w-sm">
                {['Current Password','New Password','Confirm Password'].map((l, i) => (
                  <div key={l}>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{l}</label>
                    <input type="password" placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500/70" />
                  </div>
                ))}
                <Button onClick={() => toast.success('Password updated')}>Update Password</Button>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Two-Factor Authentication" />
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">2FA Authentication</p>
                  <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security to your account</p>
                </div>
                <Toggle value={false} onChange={() => toast.info('2FA setup coming soon')} />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Active Sessions" />
            <CardBody>
              {[['Chrome — Windows 11','Current session','192.168.1.10'],['Firefox — macOS','3 days ago','192.168.1.45']].map(([d, t, ip]) => (
                <div key={d} className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="text-sm text-white">{d}</p>
                    <p className="text-xs text-slate-400">{t} · {ip}</p>
                  </div>
                  {t !== 'Current session' && <Button size="xs" variant="danger" onClick={() => toast.success('Session revoked')}>Revoke</Button>}
                  {t === 'Current session' && <span className="text-xs text-emerald-400 font-medium">Active</span>}
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <Card>
          <CardHeader title="Notification Preferences" />
          <CardBody>
            <div className="space-y-1">
              {[
                ['Email Notifications', null, 'separator'],
                ['Risk threshold exceeded (Email)',  'emailRisk',    'email'],
                ['Prediction complete (Email)',       'emailPred',    'email'],
                ['In-App Notifications', null, 'separator'],
                ['Risk alerts (In-App)',              'inAppRisk',    'app'],
                ['Prediction updates (In-App)',       'inAppPred',    'app'],
                ['System updates (In-App)',           'inAppSystem',  'app'],
              ].map(([l, k, t]) => {
                if (t === 'separator') return <p key={l} className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-4 pb-1">{l}</p>;
                return (
                  <div key={k} className="flex items-center justify-between py-2.5 border-b border-slate-800">
                    <span className="text-sm text-slate-300">{l}</span>
                    <Toggle value={notifs[k]} onChange={(v) => setNotifs(p => ({ ...p, [k]: v }))} />
                  </div>
                );
              })}
            </div>
            <Button className="mt-4" onClick={() => toast.success('Notification preferences saved')}>Save Preferences</Button>
          </CardBody>
        </Card>
      )}

      {/* Preferences */}
      {tab === 'preferences' && (
        <Card>
          <CardHeader title="App Preferences" />
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2.5 border-b border-slate-800">
                <div>
                  <p className="text-sm text-white font-medium">Dark Mode</p>
                  <p className="text-xs text-slate-400">Toggle dark/light theme</p>
                </div>
                <Toggle value={isDark} onChange={toggle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Units</label>
                <div className="flex gap-2">
                  {['metric','imperial'].map((u) => (
                    <button key={u} onClick={() => setPrefs(p => ({ ...p, units: u }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border capitalize transition-all ${prefs.units === u ? 'text-white border-blue-500 bg-blue-500/20' : 'text-slate-400 border-slate-700'}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Language</label>
                <select value={prefs.language} onChange={(e) => setPrefs(p => ({ ...p, language: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none">
                  {['English','Hindi','Tamil','Telugu'].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <Button onClick={() => toast.success('Preferences saved')}>Save Preferences</Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
