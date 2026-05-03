import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import ParticleBackground from '../ui/ParticleBackground';

export default function Layout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const sidebarW = collapsed ? 80 : 280;

  return (
    <div className="flex min-h-screen" style={{ background: '#060C14', position: 'relative' }}>
      {/* Animated particle background — sits behind everything */}
      <ParticleBackground />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

      <div
        className="flex-1 flex flex-col transition-all duration-[260ms]"
        style={{ marginLeft: sidebarW, position: 'relative', zIndex: 1 }}
      >
        <Header />

        <main className="flex-1 overflow-auto" style={{ paddingTop: 64 }}>
          <div style={{
            padding: '80px 80px 120px 80px',
            maxWidth: 1800,
            width: '100%',
          }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
