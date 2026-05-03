import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { initials, fmtRelative } from '../../utils/formatters';
import BISFLogo from '../ui/BISFLogo';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/predict':   'New Prediction',
  '/history':   'Prediction History',
  '/sites':     'Site Management',
  '/risk':      'Risk Assessment',
  '/reports':   'Reports & Export',
  '/parameters':'Blast Parameters',
  '/analytics': 'Analytics',
  '/alerts':    'Alerts',
  '/admin':     'Admin Panel',
  '/settings':  'Settings',
};

const ALERT_TYPE_COLORS = {
  critical: '#EF4444',
  high:     '#FB923C',
  warning:  '#F59E0B',
  info:     '#3B82F6',
  system:   '#8B5CF6',
};

export default function Header() {
  const { user, logout } = useAuth();
  const { alerts, unreadCount, markRead } = useNotifications();
  const nav = useNavigate();
  const loc = useLocation();

  const [showUser, setShowUser]   = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const userRef  = useRef();
  const notifRef = useRef();

  const matchKey = Object.keys(PAGE_TITLES).find(k => loc.pathname.startsWith(k)) || '';
  const title    = PAGE_TITLES[matchKey] || 'BlastGuard Pro';

  useEffect(() => {
    const handler = e => {
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className="fixed top-0 right-0 left-0 z-20 flex items-center px-6 gap-4"
      style={{
        height: 64,
        background: 'rgba(6,12,20,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #131F30',
      }}
    >
      {/* Page title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="hidden lg:block" style={{ opacity: 0.7 }}>
          <BISFLogo size={26} />
        </div>
        <div style={{ width: 1, height: 18, background: '#1E2D45' }} className="hidden lg:block" />
        <h1 className="text-2xl font-black truncate" style={{ color: '#E2EAF4' }}>{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(v => !v)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: '#5A7A9A' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0D1829'; e.currentTarget.style.color = '#E2EAF4'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5A7A9A'; }}
          >
            <Bell style={{ width: 17, height: 17 }} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: '#EF4444' }}
              />
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <DropdownPanel right>
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid #1A2942' }}
                >
                  <span className="text-sm font-semibold" style={{ color: '#E2EAF4' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(59,130,246,0.12)',
                        border: '1px solid rgba(59,130,246,0.25)',
                        color: '#60A5FA',
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
                  {alerts.slice(0, 8).map((a, i) => (
                    <button
                      key={a.id}
                      onClick={() => markRead(a.id)}
                      className="w-full flex gap-3 px-4 py-3 text-left transition-colors"
                      style={{
                        borderBottom: i < 7 ? '1px solid #0D1829' : 'none',
                        background: !a.read ? 'rgba(30,45,69,0.3)' : 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#111E30'}
                      onMouseLeave={e => e.currentTarget.style.background = !a.read ? 'rgba(30,45,69,0.3)' : 'transparent'}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                        style={{ background: ALERT_TYPE_COLORS[a.type] || '#7A92AE' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#E2EAF4' }}>{a.title}</p>
                        <p className="text-xs line-clamp-1 mt-0.5" style={{ color: '#5A7A9A' }}>{a.desc}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#3D5470' }}>{fmtRelative(a.ts)}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { nav('/alerts'); setShowNotif(false); }}
                  className="w-full py-2.5 text-center text-xs font-medium transition-colors"
                  style={{ color: '#3B82F6', borderTop: '1px solid #1A2942' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; e.currentTarget.style.color = '#60A5FA'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3B82F6'; }}
                >
                  View all notifications →
                </button>
              </DropdownPanel>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUser(v => !v)}
            className="flex items-center gap-2.5 pl-1 pr-2.5 py-1.5 rounded-xl transition-all"
            style={{ color: '#E2EAF4' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0D1829'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
            >
              {initials(user?.name)}
            </div>

            {/* Role pill – blue outline */}
            <span
              className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                border: '1px solid rgba(59,130,246,0.4)',
                color: '#60A5FA',
                background: 'rgba(59,130,246,0.08)',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.role}
            </span>

            <ChevronDown style={{ width: 13, height: 13, color: '#3D5470' }} />
          </button>

          <AnimatePresence>
            {showUser && (
              <DropdownPanel right>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #1A2942' }}>
                  <p className="text-base font-bold" style={{ color: '#E2EAF4' }}>{user?.name}</p>
                  <p className="text-sm mt-1" style={{ color: '#5A7A9A' }}>{user?.email}</p>
                </div>

                {[
                  { icon: User,     label: 'Profile',  path: '/settings' },
                  { icon: Settings, label: 'Settings', path: '/settings' },
                ].map(({ icon: Icon, label, path }) => (
                  <button
                    key={label}
                    onClick={() => { nav(path); setShowUser(false); }}
                    className="flex items-center gap-4 w-full px-5 py-3.5 text-base transition-colors"
                    style={{ color: '#7A92AE' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#111E30'; e.currentTarget.style.color = '#E2EAF4'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A92AE'; }}
                  >
                    <Icon style={{ width: 17, height: 17 }} />
                    {label}
                  </button>
                ))}

                <div style={{ borderTop: '1px solid #1A2942' }}>
                  <button
                    onClick={() => { logout(); nav('/login'); }}
                    className="flex items-center gap-4 w-full px-5 py-3.5 text-base transition-colors"
                    style={{ color: '#EF4444' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut style={{ width: 17, height: 17 }} />
                    Sign Out
                  </button>
                </div>
              </DropdownPanel>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

/* ── Sub-components ── */
function DropdownPanel({ children, right }) {
  return (
      <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`absolute top-full mt-3 z-50 overflow-hidden ${right ? 'right-0' : 'left-0'}`}
      style={{
        width: 300,
        background: '#0D1829',
        border: '1px solid #1E2D45',
        borderRadius: 18,
        boxShadow: '0 12px 50px rgba(0,0,0,0.7)',
      }}
    >
      {children}
    </motion.div>
  );
}
