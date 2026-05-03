import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { resetSchema, passwordStrength } from '../../utils/validators';

export default function ResetPassword() {
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(resetSchema) });
  const strength = passwordStrength(pw);

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Password reset successfully!');
    nav('/login');
  };

  return (
    <div className="min-h-screen terrain-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #EF4444)' }}>
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">BlastGuard Pro</h1>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-2">Set new password</h2>
          <p className="text-slate-400 text-sm mb-6">Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pw && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((s) => (
                      <div key={s} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: s <= strength.score ? strength.color : '#334155' }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</> : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            <Link to="/login" className="text-blue-400 hover:text-blue-300">← Back to Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
