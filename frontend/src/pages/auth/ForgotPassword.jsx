import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, CheckCircle } from 'lucide-react';
import { forgotSchema } from '../../utils/validators';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
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
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">We've sent a password reset link to your email address.</p>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                ← Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Reset password</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input {...register('email')} type="email" placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</> : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-sm text-slate-400 mt-5">
                <Link to="/login" className="text-blue-400 hover:text-blue-300">← Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
