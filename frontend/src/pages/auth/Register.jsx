import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { registerSchema, passwordStrength } from '../../utils/validators';
import { ROLES } from '../../utils/constants';
import BISFLogo from '../../components/ui/BISFLogo';

/* ── Floating particle system ─────────────────────────────── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 6,
  duration: 5 + Math.random() * 7,
  opacity: 0.15 + Math.random() * 0.35,
}));

export default function Register() {
  const { register: authRegister } = useAuth();
  const nav = useNavigate();
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [pw, setPw]           = useState('');
  const [focusField, setFocusField] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const strength = passwordStrength(pw);

  const onSubmit = async (data) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const res = authRegister(data);
    if (res.ok) {
      toast.success('Account created! Please sign in.');
      nav('/login');
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  const INPUT = (field, hasError) => ({
    display: 'block', width: '100%',
    padding: '10px 13px',
    background: '#0d1526',
    border: `1px solid ${focusField === field ? 'rgba(59,130,246,0.6)' : hasError ? '#EF4444' : '#1E2D45'}`,
    borderRadius: 10,
    color: '#E2EAF4',
    fontSize: 13.5,
    outline: 'none',
    boxShadow: focusField === field ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  });

  return (
    <div className="min-h-screen flex" style={{ background: '#060C14' }}>

      {/* ── Left panel – particles ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55 }}
        className="hidden lg:flex lg:w-[46%] flex-col relative overflow-hidden"
        style={{ background: '#05091200' }}
      >
        {/* Deep gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #050B17 0%, #0A1628 50%, #060C14 100%)',
          }}
        />
        {/* Blue radial glow */}
        <div
          className="absolute"
          style={{
            top: '35%', left: '50%',
            width: 520, height: 520,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.04) 50%, transparent 70%)',
          }}
        />
        {/* Secondary glow */}
        <div
          className="absolute"
          style={{
            bottom: '15%', left: '30%',
            width: 280, height: 280,
            background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)',
          }}
        />

        {/* Floating particles */}
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.id % 3 === 0 ? '#3B82F6' : p.id % 3 === 1 ? '#6366F1' : '#60A5FA',
              opacity: p.opacity,
              animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}

        {/* Grid lines overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          <BISFLogo size={36} showText />

          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.25)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#3B82F6' }}
              />
              <span className="text-xs font-medium" style={{ color: '#60A5FA' }}>
                Secure Platform
              </span>
            </div>

            <h1
              className="text-[40px] font-black leading-[1.1]"
              style={{ color: '#E2EAF4' }}
            >
              Join the{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                future
              </span>
              <br />of mine safety.
            </h1>

            <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#5A7A9A' }}>
              Create your account to access ML-powered blast predictions, real-time slope monitoring, and compliance reports.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['ML Prediction', 'SVG Visualizer', 'PDF Reports', 'Multi-Site', 'Audit Logs'].map(f => (
                <span
                  key={f}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.18)',
                    color: '#7AA8D4',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs" style={{ color: '#1E2D45' }}>
            © 2026 BlastGuard Pro · All rights reserved
          </p>
        </div>
      </motion.div>

      {/* ── Right panel – form ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, delay: 0.07 }}
        className="flex-1 flex items-center justify-center p-8 overflow-y-auto"
        style={{ background: '#060C14' }}
      >
        <div className="w-full max-w-[400px] py-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden mb-8">
            <BISFLogo size={32} showText />
          </div>

          <div className="mb-8">
            <h2 className="text-[24px] font-bold mb-1.5" style={{ color: '#E2EAF4' }}>Create account</h2>
            <p className="text-sm" style={{ color: '#5A7A9A' }}>Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name + Org */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A92AE' }}>Full Name</label>
                <input
                  {...register('name')}
                  placeholder="John Doe"
                  onFocus={() => setFocusField('name')}
                  onBlur={() => setFocusField('')}
                  style={INPUT('name', !!errors.name)}
                />
                {errors.name && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A92AE' }}>Organization</label>
                <input
                  {...register('org')}
                  placeholder="Company"
                  onFocus={() => setFocusField('org')}
                  onBlur={() => setFocusField('')}
                  style={INPUT('org', !!errors.org)}
                />
                {errors.org && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.org.message}</p>}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A92AE' }}>Role</label>
              <select
                {...register('role')}
                onFocus={() => setFocusField('role')}
                onBlur={() => setFocusField('')}
                style={{ ...INPUT('role', !!errors.role), cursor: 'pointer' }}
              >
                <option value="" style={{ background: '#0D1829' }}>Select your role…</option>
                {ROLES.map(r => (
                  <option key={r} value={r} style={{ background: '#0D1829' }}>{r}</option>
                ))}
              </select>
              {errors.role && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.role.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A92AE' }}>Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@company.com"
                onFocus={() => setFocusField('email')}
                onBlur={() => setFocusField('')}
                style={INPUT('email', !!errors.email)}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A92AE' }}>Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  onChange={e => setPw(e.target.value)}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField('')}
                  style={{ ...INPUT('password', !!errors.password), paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#3D5470' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#7A92AE'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3D5470'}
                >
                  {showPw ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
              {pw && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(s => (
                      <div
                        key={s}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: s <= strength.score ? strength.color : '#1E2D45' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A92AE' }}>Confirm Password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                onFocus={() => setFocusField('confirmPassword')}
                onBlur={() => setFocusField('')}
                style={INPUT('confirmPassword', !!errors.confirmPassword)}
              />
              {errors.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                {...register('terms')}
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded shrink-0"
                style={{ accentColor: '#3B82F6' }}
              />
              <span className="text-xs leading-relaxed" style={{ color: '#5A7A9A' }}>
                I agree to the{' '}
                <button type="button" className="transition-colors" style={{ color: '#3B82F6' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#60A5FA'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}
                >
                  Terms & Conditions
                </button>
                {' '}and{' '}
                <button type="button" className="transition-colors" style={{ color: '#3B82F6' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#60A5FA'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}
                >
                  Privacy Policy
                </button>
              </span>
            </label>
            {errors.terms && <p className="text-xs" style={{ color: '#EF4444' }}>{errors.terms.message}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-semibold transition-all mt-2"
              style={{
                height: 44,
                borderRadius: 11,
                fontSize: 14,
                color: '#fff',
                background: loading ? '#1E2D45' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(59,130,246,0.3)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
            >
              {loading ? (
                <>
                  <div
                    className="animate-spin"
                    style={{
                      width: 15, height: 15,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                    }}
                  />
                  Creating Account…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#3D5470' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium transition-colors"
              style={{ color: '#3B82F6' }}
              onMouseEnter={e => e.currentTarget.style.color = '#60A5FA'}
              onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
