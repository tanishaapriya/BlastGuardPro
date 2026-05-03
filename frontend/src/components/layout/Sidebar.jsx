import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Zap, Clock, BarChart2, Activity,
  Bell, Shield, Settings, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import BISFLogo from '../ui/BISFLogo';

/* Only the most essential navigation items */
const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/activity',  label: 'Recent Activity', icon: Activity },
  { path: '/predict',   label: 'Predict',          icon: Zap },
  { path: '/history',   label: 'History',          icon: Clock },
  { path: '/analytics', label: 'Analytics',        icon: BarChart2 },
  { path: '/alerts',    label: 'Alerts',           icon: Bell, badge: true },
  { path: '/admin',     label: 'Admin',            icon: Shield, adminOnly: true },
  { path: '/settings',  label: 'Settings',         icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav('/login'); };
  const visibleItems = NAV_ITEMS.filter(i => !i.adminOnly || isAdmin);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen z-30 flex flex-col overflow-hidden"
      style={{
        background: '#07101C',
        borderRight: '1px solid #131F30',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 shrink-0 overflow-hidden"
        style={{ height: 64, borderBottom: '1px solid #131F30', padding: '0 16px' }}
      >
        <BISFLogo size={34} />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.16 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#E2EAF4' }}>
                BlastGuard Pro
              </p>
              <p className="text-[11px] whitespace-nowrap" style={{ color: '#2D4560' }}>
                BISF Platform
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2.5" style={{ scrollbarWidth: 'none' }}>
        <div className="space-y-1.5">
          {visibleItems.map((item, idx) => {
            const Icon = item.icon;
            const hasBadge = item.badge && unreadCount > 0;
            const isBottomItem = item.path === '/admin' || (item.path === '/settings' && !isAdmin);
            
            return (
              <div key={item.path}>
                {isBottomItem && (
                  <div style={{ margin: '12px 10px 8px', height: 1, background: '#131F30' }} />
                )}
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl transition-all duration-150 ${
                      isActive ? '' : 'hover:bg-[#0D1829]'
                    }`
                  }
                  style={({ isActive }) => ({
                    padding: collapsed ? '12px' : '12px 16px',
                    background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                    color: isActive ? '#93C5FD' : '#5A7A9A',
                  })}
                >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 0, top: 7, bottom: 7,
                          width: 3,
                          borderRadius: '0 3px 3px 0',
                          background: '#3B82F6',
                        }}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative shrink-0">
                      <Icon
                        style={{
                          width: 19, height: 19,
                          color: isActive ? '#60A5FA' : 'inherit',
                          flexShrink: 0,
                        }}
                      />
                      {hasBadge && (
                        <span
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                          style={{ background: '#EF4444', fontSize: 9 }}
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Label */}
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.13 }}
                          className="text-base font-semibold whitespace-nowrap"
                          style={{ color: isActive ? '#93C5FD' : '#7A92AE' }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div
                        className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                        style={{
                          background: '#111E30',
                          border: '1px solid #1E2D45',
                          color: '#E2EAF4',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        }}
                      >
                        {item.label}
                      </div>
                    )}
                  </>
                )}
                </NavLink>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── User footer ── */}
      <div style={{ borderTop: '1px solid #131F30', padding: '10px 10px 12px' }}>
        {/* Email row */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16 }}
              className="overflow-hidden"
            >
              <div className="px-2 py-2 mb-1">
                <p className="text-xs font-semibold truncate" style={{ color: '#5A7A9A' }}>
                  {user?.email}
                </p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: '#2D4560' }}>
                  {user?.role}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className="group flex items-center gap-3 w-full rounded-xl transition-all duration-150"
          style={{
            padding: collapsed ? '12px' : '12px 16px',
            color: '#3D5470',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = '#EF4444';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#3D5470';
          }}
        >
          <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.13 }}
                className="text-sm font-medium"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>

          {/* Tooltip */}
          {collapsed && (
            <div
              className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
              style={{
                background: '#111E30',
                border: '1px solid #1E2D45',
                color: '#E2EAF4',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              Sign Out
            </div>
          )}
        </button>
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={onToggle}
        className="absolute -right-4 top-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-50 group/toggle"
        style={{
          background: '#111E30',
          border: '1px solid #243550',
          color: '#E2EAF4',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#3B82F6';
          e.currentTarget.style.color = '#FFFFFF';
          e.currentTarget.style.boxShadow = '0 0 15px rgba(59,130,246,0.5)';
          e.currentTarget.style.borderColor = '#60A5FA';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#111E30';
          e.currentTarget.style.color = '#E2EAF4';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
          e.currentTarget.style.borderColor = '#243550';
        }}
      >
        {collapsed
          ? <ChevronRight style={{ width: 18, height: 18 }} />
          : <ChevronLeft  style={{ width: 18, height: 18 }} />
        }
      </button>
    </motion.aside>
  );
}
