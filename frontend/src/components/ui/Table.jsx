export function Table({ columns, data, onRowClick, emptyMessage = 'No data available' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid #334155' }}>
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-slate-500">{emptyMessage}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-slate-800/50 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-800/50' : ''}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
      <span className="text-xs text-slate-400">
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
      </span>
      <div className="flex gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="px-3 py-1 text-xs rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors">
          ← Prev
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
          return (
            <button key={p} onClick={() => onChange(p)}
              className={`w-7 h-7 text-xs rounded-lg transition-colors ${p === page ? 'text-white' : 'text-slate-400 hover:bg-slate-700'}`}
              style={p === page ? { background: '#3B82F6' } : {}}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="px-3 py-1 text-xs rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}
