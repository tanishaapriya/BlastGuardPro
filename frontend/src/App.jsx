import { useEffect, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import History from './pages/History';
import Sites from './pages/Sites';
import SiteDetail from './pages/SiteDetail';
import RiskAssessment from './pages/RiskAssessment';
import Reports from './pages/Reports';
import Parameters from './pages/Parameters';
import Analytics from './pages/Analytics';
import Activity from './pages/Activity';
import Alerts from './pages/Alerts';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div className="min-h-screen terrain-bg flex flex-col items-center justify-center text-center p-6">
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6 text-sm max-w-sm">{this.state.error?.message}</p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
          Reload Application
        </button>
      </div>
    );
    return this.props.children;
  }
}

function KeyboardShortcuts() {
  const nav = useNavigate();
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') { e.preventDefault(); nav('/predict'); }
        if (e.key === 'h') { e.preventDefault(); nav('/history'); }
        if (e.key === 'd') { e.preventDefault(); nav('/dashboard'); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nav]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <KeyboardShortcuts />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route element={<Layout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard"  element={<Dashboard />} />
                  <Route path="/predict"    element={<Predict />} />
                  <Route path="/history"    element={<History />} />
                  <Route path="/sites"      element={<Sites />} />
                  <Route path="/sites/:id"  element={<SiteDetail />} />
                  <Route path="/risk"       element={<RiskAssessment />} />
                  <Route path="/reports"    element={<Reports />} />
                  <Route path="/parameters" element={<Parameters />} />
                  <Route path="/analytics"  element={<Analytics />} />
                  <Route path="/activity"   element={<Activity />} />
                  <Route path="/alerts"     element={<Alerts />} />
                  <Route path="/admin"      element={<AdminPanel />} />
                  <Route path="/settings"   element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="dark"
              />
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
