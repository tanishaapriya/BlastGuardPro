import { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Pagination } from '../components/ui/Table';
import { RiskBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Gauge from '../components/ui/Gauge';
import { MOCK_PREDICTIONS } from '../utils/mockData';
import { SITES, BLAST_TYPES } from '../utils/constants';
import { fmtDate, fmtDateTime } from '../utils/formatters';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LS_PREDICTIONS_KEY } from '../utils/constants';

const PER_PAGE = 10;
const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export default function History() {
  const [saved] = useLocalStorage(LS_PREDICTIONS_KEY, []);
  const allPreds = [...(saved || []), ...MOCK_PREDICTIONS];

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState([]);
  const [siteFilter, setSiteFilter] = useState('');
  const [blastFilter, setBlastFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return allPreds.filter((p) => {
      if (search && !p.site.toLowerCase().includes(search.toLowerCase())) return false;
      if (riskFilter.length && !riskFilter.includes(p.outputs.risk_level)) return false;
      if (siteFilter && p.siteId !== siteFilter) return false;
      if (blastFilter && p.blast_type !== blastFilter) return false;
      if (dateFrom && new Date(p.timestamp) < new Date(dateFrom)) return false;
      if (dateTo && new Date(p.timestamp) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [allPreds, search, riskFilter, siteFilter, blastFilter, dateFrom, dateTo]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const exportCSV = () => {
    const header = 'ID,Site,Date,Blast Type,Risk Level,BISF Score,PPV,Confidence';
    const rows = filtered.map((p) =>
      `${p.id},${p.site},${fmtDate(p.timestamp)},${p.blast_type},${p.outputs.risk_level},${p.outputs.bisf_score},${p.outputs.ppv},${p.outputs.confidence}`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'blast_predictions.csv';
    a.click();
  };

  const columns = [
    { key: 'id', label: 'ID', render: (v) => <span className="text-slate-500 font-mono text-xs">{v.slice(-8)}</span> },
    { key: 'site', label: 'Site Name', render: (v) => <span className="text-white font-medium">{v}</span> },
    { key: 'timestamp', label: 'Date', render: (v) => <span className="text-slate-400 text-xs">{fmtDate(v)}</span> },
    { key: 'blast_type', label: 'Blast Type', render: (v) => <span className="text-slate-300 text-xs">{v || 'Surface Blast'}</span> },
    { key: 'outputs', label: 'Risk', render: (v) => <RiskBadge level={v.risk_level} /> },
    { key: 'outputs', label: 'BISF Score', render: (v) => <span className="text-white font-semibold">{v.bisf_score?.toFixed(1)}</span> },
    { key: 'outputs', label: 'PPV', render: (v) => <span className="text-slate-300">{v.ppv}</span> },
    { key: 'outputs', label: 'Confidence', render: (v) => <span className="text-slate-400 text-xs">{(v.confidence * 100).toFixed(0)}%</span> },
  ];

  const toggleRisk = (r) => setRiskFilter((p) => p.includes(r) ? p.filter((x) => x !== r) : [...p, r]);

  return (
    <div className="space-y-4 max-w-screen-xl">
      <Card>
        <CardHeader title="Prediction History" subtitle={`${filtered.length} predictions found`}
          action={<Button size="sm" icon={Download} onClick={exportCSV} variant="outline">Export CSV</Button>} />
        <CardBody>
          {/* Search + filter bar */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by site name..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
            </div>
            <Button size="sm" variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
              Filters {riskFilter.length + (siteFilter ? 1 : 0) + (blastFilter ? 1 : 0) > 0 ?
                `(${riskFilter.length + (siteFilter ? 1 : 0) + (blastFilter ? 1 : 0)})` : ''}
            </Button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mb-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Risk Level</label>
                  <div className="flex flex-wrap gap-1">
                    {RISK_LEVELS.map((r) => (
                      <button key={r} onClick={() => { toggleRisk(r); setPage(1); }}
                        className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${riskFilter.includes(r) ? 'text-white border-blue-500 bg-blue-500/20' : 'text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Site</label>
                  <select value={siteFilter} onChange={(e) => { setSiteFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none">
                    <option value="">All Sites</option>
                    {SITES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Date From</label>
                  <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Date To</label>
                  <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none" />
                </div>
              </div>
              <button onClick={() => { setRiskFilter([]); setSiteFilter(''); setBlastFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
                className="mt-3 text-xs text-blue-400 hover:text-blue-300">Clear all filters</button>
            </div>
          )}

          <Table columns={columns} data={paged} onRowClick={setSelected}
            emptyMessage="No predictions found. Try adjusting filters or run a new prediction." />
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </CardBody>
      </Card>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Prediction Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RiskBadge level={selected.outputs.risk_level} pulse />
              <div>
                <p className="font-semibold text-white">{selected.site}</p>
                <p className="text-xs text-slate-400">{fmtDateTime(selected.timestamp)}</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <Gauge value={selected.outputs.bisf_score} size={130} />
              <div className="grid grid-cols-2 gap-2 flex-1">
                {[
                  ['PPV', `${selected.outputs.ppv} mm/s`], ['Air OP', `${selected.outputs.air_overpressure} dB`],
                  ['Probability', `${(selected.outputs.probability * 100).toFixed(1)}%`],
                  ['Failure Mode', selected.outputs.failure_mode],
                  ['Confidence', `${(selected.outputs.confidence * 100).toFixed(1)}%`],
                  ['Fragmentation', selected.outputs.fragmentation_index.toFixed(3)],
                ].map(([l, v]) => (
                  <div key={l} className="p-2 rounded-lg" style={{ background: '#0F172A' }}>
                    <p className="text-xs text-slate-400">{l}</p>
                    <p className="text-sm font-bold text-white">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Input Parameters</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(selected.inputs || {}).slice(0, 12).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg" style={{ background: '#0F172A' }}>
                    <p className="text-[10px] text-slate-500 capitalize">{k.replace(/_/g, ' ')}</p>
                    <p className="text-xs font-semibold text-white">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Recommendations</p>
              <ul className="space-y-1">
                {selected.outputs.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-slate-400 flex gap-2"><span className="text-blue-400">•</span>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
