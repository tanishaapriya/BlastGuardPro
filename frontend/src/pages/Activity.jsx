import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Bell, AlertTriangle, CheckCircle, Info, 
  Search, Filter, ChevronRight, Activity as ActivityIcon,
  Calendar, MapPin, User
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { RiskBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { MOCK_PREDICTIONS } from '../utils/mockData';
import { RISK_COLORS } from '../utils/constants';
import { fmtDateTime, fmtRelative } from '../utils/formatters';

export default function Activity() {
  const [search, setSearch] = useState('');
  
  const activities = [
    ...MOCK_PREDICTIONS.map(p => ({
      id: p.id,
      type: 'prediction',
      title: 'New Blast Prediction',
      site: p.site,
      timestamp: p.timestamp,
      data: p.outputs,
      icon: Zap,
      color: '#3B82F6'
    })),
    {
      id: 'a1',
      type: 'alert',
      title: 'Critical Ground Vibration Alert',
      site: 'Rajasthan Quarry A',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      data: { msg: 'PPV limit exceeded: 28.4 mm/s' },
      icon: AlertTriangle,
      color: '#EF4444'
    },
    {
      id: 'a2',
      type: 'system',
      title: 'Report Generated',
      site: 'Global',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      data: { msg: 'Monthly compliance report ready for download' },
      icon: CheckCircle,
      color: '#10B981'
    }
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filtered = activities.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.site.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Recent Activity</h2>
          <p className="text-slate-400 mt-2 text-base">Real-time feed of predictions, alerts, and system events</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity..."
              className="w-full pl-13 pr-6 py-3.5 rounded-2xl bg-[#0D1829] border border-[#1E2D45] text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm"
            />
          </div>
          <Button variant="outline" icon={Filter} className="px-6">Filters</Button>
        </div>
      </div>

      <div className="space-y-8">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardBody className="py-10 px-12">
                <div className="flex items-start gap-10">
                  {/* Icon Column */}
                  <div 
                    className="w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-xl shadow-black/30"
                    style={{ background: item.color + '10', border: `1px solid ${item.color}20` }}
                  >
                    <item.icon style={{ width: 26, height: 26, color: item.color }} />
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: item.color }}>
                          {item.type}
                        </span>
                        <span className="text-slate-700 text-[10px]">•</span>
                        <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {fmtDateTime(item.timestamp)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-black bg-[#162338] px-3 py-1 rounded-full border border-slate-700/40 uppercase tracking-widest">
                        {fmtRelative(item.timestamp)}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">{item.title}</h3>
                    
                    <div className="flex items-center gap-5 text-slate-400 mb-6">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-semibold">{item.site}</span>
                      </div>
                      {item.type === 'prediction' && (
                        <div className="flex items-center gap-3">
                          <span className="text-slate-800">|</span>
                          <RiskBadge level={item.data.risk_level} />
                        </div>
                      )}
                    </div>

                    {item.type === 'prediction' ? (
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          ['BISF Score', item.data.bisf_score.toFixed(1)],
                          ['PPV (mm/s)', item.data.ppv],
                          ['Probability', `${(item.data.probability * 100).toFixed(1)}%`],
                          ['Failure Mode', item.data.failure_mode]
                        ].map(([l, v]) => (
                          <div key={l} className="bg-[#060C14] rounded-2xl p-4 border border-[#1A2942] hover:border-blue-500/20 transition-all">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">{l}</p>
                            <p className="text-base font-black text-white tracking-tight">{v}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#060C14] rounded-2xl p-6 border border-[#1A2942] text-slate-300 text-base font-semibold leading-relaxed">
                        {item.data.msg}
                      </div>
                    )}
                  </div>

                  {/* Action Column */}
                  <div className="flex flex-col justify-center self-stretch">
                    <button className="p-3 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                      <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-blue-400 transition-all transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
