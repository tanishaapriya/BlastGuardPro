import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen terrain-bg flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #EF4444)' }}>
        <Shield className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-8xl font-black text-slate-700 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-slate-400 mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <Button icon={ArrowLeft} onClick={() => nav('/dashboard')}>Return to Dashboard</Button>
    </div>
  );
}
