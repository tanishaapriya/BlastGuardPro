import { useState } from 'react';
import { Bell, BellOff, AlertTriangle, Info, CheckCircle, Settings, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNotifications } from '../context/NotificationContext';
import { fmtRelative } from '../utils/formatters';
import { SITES } from '../utils/constants';
import { toast } from 'react-toastify';

const TABS = ['All', 'Unread', 'Critical', 'System'];

const ALERT_STYLES = {
  critical: { bg: 'rgba(239,68,68,0.08)',   border: '#EF4444', icon: AlertTriangle, iconColor: '#EF4444', badge: 'danger'  },
  high:     { bg: 'rgba(59,130,246,0.08)',   border: '#3B82F6', icon: AlertTriangle, iconColor: '#3B82F6', badge: 'orange'  },
  warning:  { bg: 'rgba(245,158,11,0.08)',   border: '#F59E0B', icon: AlertTriangle, iconColor: '#F59E0B', badge: 'warning' },
  info:     { bg: 'rgba(59,130,246,0.08)',   border: '#3B82F6', icon: Info,          iconColor: '#3B82F6', badge: 'info'    },
  system:   { bg: 'rgba(139,92,246,0.08)',   border: '#8B5CF6', icon: Settings,      iconColor: '#8B5CF6', badge: 'default' },
};

const THRESHOLD_SITES = SITES.map((s) => ({ ...s, ppv: 25, bisf: 75, air: 115 }));

export default function Alerts() {
  const { alerts, unreadCount, markRead, markAllRead } = useNotifications();
  const [tab, setTab] = useState('All');
  const [thresholds, setThresholds] = useState(THRESHOLD_SITES);

  const filtered = alerts.filter((a) => {
    if (tab === 'Unread') return !a.read;
    if (tab === 'Critical') return a.type === 'critical';
    if (tab === 'System') return a.type === 'system';
    return true;
  });

  return (
    <div className="space-y-5 max-w-screen-xl">
      {/* Tab bar + mark all read */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1E293B' }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              style={tab === t ? { background: '#3B82F6' } : {}}>
              {t}
              {t === 'Unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px]">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" icon={BellOff} onClick={() => { markAllRead(); toast.success('All marked as read'); }}>
          Mark All Read
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Alerts list */}
        <div className="xl:col-span-2 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No alerts in this category</p>
            </div>
          )}
          {filtered.map((alert, i) => {
            const style = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
            const Icon = style.icon;
            return (
              <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <div className={`rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.005] ${!alert.read ? 'ring-1 ring-offset-0' : ''}`}
                  style={{ background: alert.read ? '#1E293B' : style.bg, borderColor: style.border + '40', ringColor: style.border }}
                  onClick={() => markRead(alert.id)}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: style.border + '20' }}>
                      <Icon className="w-4 h-4" style={{ color: style.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-sm font-semibold text-white">{alert.title}</p>
                        {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />}
                        <Badge variant={style.badge} className="ml-auto">{alert.type}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{alert.desc}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{alert.site}</span>
                        <span>·</span>
                        <span>{fmtRelative(alert.ts)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Alert settings */}
        <div>
          <Card>
            <CardHeader title="Alert Settings" subtitle="Thresholds per site" />
            <CardBody>
              <div className="space-y-4">
                {thresholds.slice(0, 3).map((s) => (
                  <div key={s.id} className="pb-4 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white mb-2 truncate">{s.name.split(' ').slice(0,3).join(' ')}</p>
                    {[['ppv','PPV Limit','mm/s',5,100],['bisf','BISF Limit','score',20,100],['air','Air Blast','dB',80,150]].map(([k,l,u,min,max]) => (
                      <div key={k} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{l}</span>
                          <span className="text-white">{s[k]} {u}</span>
                        </div>
                        <input type="range" min={min} max={max} value={s[k]}
                          onChange={(e) => setThresholds(p => p.map(t => t.id === s.id ? { ...t, [k]: +e.target.value } : t))} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <Button fullWidth size="sm" onClick={() => toast.success('Thresholds saved')} className="mt-3">Save Thresholds</Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
