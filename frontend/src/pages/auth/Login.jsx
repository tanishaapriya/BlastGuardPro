import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { loginSchema } from '../../utils/validators';
import BISFLogo from '../../components/ui/BISFLogo';
import GlobeCanvas from '../../components/ui/GlobeCanvas';

const DEMO = [
  { role: 'Admin',    email: 'admin@blastguard.com',    pw: 'admin123',   color: '#3B82F6' },
  { role: 'Engineer', email: 'engineer@blastguard.com', pw: 'eng123',     color: '#22C55E' },
  { role: 'Analyst',  email: 'analyst@blastguard.com',  pw: 'analyst123', color: '#A78BFA' },
];

const STATS = [
  { value: '50K+',  label: 'Predictions run'  },
  { value: '99.2%', label: 'Model accuracy'   },
  { value: '140+',  label: 'Active mine sites' },
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [focusField, setFocusField] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = async ({ email, password, remember }) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const res = login(email, password, remember);
    if (res.ok) { toast.success('Welcome back!'); nav('/dashboard'); }
    else toast.error(res.error);
    setLoading(false);
  };

  const quickFill = d => { setValue('email', d.email); setValue('password', d.pw); };

  const INPUT = (field, hasError) => ({
    display: 'block',
    width: '100%',
    padding: '13px 18px',
    background: 'rgba(11,22,40,0.8)',
    border: `1.5px solid ${focusField === field ? '#3B82F6' : hasError ? '#EF4444' : '#1E2D45'}`,
    borderRadius: 12,
    color: '#E2EAF4',
    fontSize: 14,
    outline: 'none',
    boxShadow: focusField === field ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    backdropFilter: 'blur(8px)',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#060C14' }}>

      {/* ── Left panel — Globe ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:flex-col"
        style={{
          width: '55%',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #050B15 0%, #07101F 50%, #060C18 100%)',
        }}
      >
        {/* Globe centered */}

        {/* Globe centered */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}>
          <GlobeCanvas width={520} height={520} />
        </div>

        {/* Content overlay */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          height: '100%', padding: '48px 52px',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto' }}>
            <BISFLogo size={38} showText />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Drag hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              style={{
                fontSize: 11, color: 'rgba(99,179,237,0.6)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>🌐</span> Drag to rotate the globe
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.55 }}
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#60A5FA' }}
            >
              Geotechnical Intelligence
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.55 }}
              style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, color: '#F1F5F9', margin: 0 }}
            >
              Predict blast risks{' '}
              <span style={{
                background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                before
              </span>
              <br />they happen.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.55 }}
              style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(148,163,184,0.85)', maxWidth: 340, margin: 0 }}
            >
              Advanced ML-powered slope stability analysis trusted by mining engineers worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              style={{ display: 'flex', gap: 40, paddingTop: 8 }}
            >
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#E2EAF4', margin: 0 }}>{value}</p>
                  <p style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(71,85,105,0.6)' }}>
            © 2026 BlastGuard Pro · BISF Prediction Platform
          </p>
        </div>
      </motion.div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#060C14', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '56px 40px',
          }}
        >
          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 44 }}
            >
              <BISFLogo size={40} />
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#E2EAF4', margin: 0, lineHeight: 1.3 }}>
                  BlastGuard Pro
                </p>
                <p style={{ fontSize: 12, color: '#3D5470', margin: 0, lineHeight: 1.3 }}>
                  BISF Prediction Platform
                </p>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              style={{ marginBottom: 36 }}
            >
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#E2EAF4', margin: '0 0 8px' }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 14, color: '#5A7A9A', margin: 0 }}>
                Sign in to your workspace to continue
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.32 }}
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
            >
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#7A92AE', marginBottom: 9 }}>
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
                  onFocus={() => setFocusField('email')}
                  onBlur={() => setFocusField('')}
                  style={INPUT('email', !!errors.email)}
                />
                {errors.email && (
                  <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#7A92AE' }}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: 12, color: '#3B82F6', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#60A5FA'}
                    onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    {...register('password')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    onFocus={() => setFocusField('password')}
                    onBlur={() => setFocusField('')}
                    style={{ ...INPUT('password', !!errors.password), paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#3D5470', display: 'flex', alignItems: 'center', padding: 4,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#7A92AE'}
                    onMouseLeave={e => e.currentTarget.style.color = '#3D5470'}
                  >
                    {showPw ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>{errors.password.message}</p>
                )}
              </div>

              {/* Remember me */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  {...register('remember')}
                  type="checkbox"
                  style={{ width: 15, height: 15, accentColor: '#3B82F6', flexShrink: 0 }}
                />
                <span style={{ fontSize: 14, color: '#5A7A9A' }}>Keep me signed in</span>
              </label>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.015, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.985 } : {}}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#fff',
                  background: loading ? '#1A2942' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 6px 24px rgba(59,130,246,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  letterSpacing: '0.02em',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin" style={{
                      width: 18, height: 18,
                      border: '2px solid rgba(255,255,255,0.25)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                    }} />
                    Signing in…
                  </>
                ) : (
                  <>Sign In <ArrowRight style={{ width: 17, height: 17 }} /></>
                )}
              </motion.button>
            </motion.form>

            {/* Demo section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={{ marginTop: 36 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #131F30)' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#243450', letterSpacing: '0.10em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Demo access
                </span>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #131F30)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DEMO.map(d => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => quickFill(d)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '13px 16px',
                      borderRadius: 12,
                      border: `1px solid ${d.color}22`,
                      background: d.color + '08',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background 0.18s, border-color 0.18s, transform 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = d.color + '16';
                      e.currentTarget.style.borderColor = d.color + '45';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = d.color + '08';
                      e.currentTarget.style.borderColor = d.color + '22';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: d.color + '1E', border: `1px solid ${d.color}38`,
                      color: d.color, fontSize: 13, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {d.role.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#A8C0D6', margin: 0 }}>{d.role}</p>
                      <p style={{ fontSize: 12, color: '#3D5470', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.email}
                      </p>
                    </div>
                    <span style={{ fontSize: 16, color: d.color + '90', flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Register */}
            <p style={{ textAlign: 'center', fontSize: 14, color: '#3D5470', marginTop: 32 }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#60A5FA'}
                onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}
              >
                Create one
              </Link>
            </p>

          </div>
        </motion.div>
      </div>

    </div>
  );
}
