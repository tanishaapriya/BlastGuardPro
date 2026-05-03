import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const LABELS = {
  dashboard: 'Dashboard', predict: 'New Prediction', history: 'History',
  sites: 'Sites', risk: 'Risk Assessment', reports: 'Reports',
  parameters: 'Blast Parameters', analytics: 'Analytics', alerts: 'Alerts',
  admin: 'Admin Panel', settings: 'Settings',
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm mb-5">
      <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {parts.map((part, i) => {
        const path = '/' + parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        const label = LABELS[part] || decodeURIComponent(part);
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-slate-600" />
            {isLast ? (
              <span className="text-slate-300 font-medium">{label}</span>
            ) : (
              <Link to={path} className="text-slate-400 hover:text-white transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
