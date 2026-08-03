import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Terminal, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login }  = useAuth();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Authentication failed.'); return; }
      if (data.user.role !== 'admin') {
        setError('Access denied. Administrator credentials required.');
        return;
      }
      login(data.token, data.user);
      navigate('/dashboard');
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      {/* scanline texture */}
      <div style={s.scanlines} />

      {/* top classified bar */}
      <div style={s.topBar}>
        <span style={s.topDot} />
        <span style={s.topTxt}>SECURE COMMAND CHANNEL · AUTHORIZED ACCESS ONLY</span>
        <span style={s.topDot} />
      </div>

      <div style={s.card}>

        <div style={s.head}>
          <span style={s.logo}>SRA</span>
          <div style={s.iconRing}>
            <Terminal size={22} color="#06b6d4" strokeWidth={1.8} />
          </div>
          <h1 style={s.title}>Command Access</h1>
          <p  style={s.sub}>Authenticate to enter the control center.</p>
        </div>

        {/* warning badge */}
        <div style={s.warn}>
          <AlertTriangle size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <span>Restricted system — all access is logged and monitored.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>

          <div style={s.group}>
            <label htmlFor="adm-email" style={s.lbl}>
              <span style={s.dot} />Email Address
            </label>
            <div style={s.inputBox}>
              <Mail size={15} style={s.ico} />
              <input
                id="adm-email" name="email" type="email"
                placeholder="admin@sra.gov"
                value={form.email} onChange={handleChange}
                required autoComplete="email"
                style={s.input} className="adm-input"
              />
            </div>
          </div>

          <div style={s.group}>
            <label htmlFor="adm-pwd" style={s.lbl}>
              <span style={s.dot} />Access Code
            </label>
            <div style={s.inputBox}>
              <Lock size={15} style={s.ico} />
              <input
                id="adm-pwd" name="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={form.password} onChange={handleChange}
                required autoComplete="current-password"
                style={s.input} className="adm-input"
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} style={s.eye}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={s.err}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ ...s.submit, opacity: loading ? 0.75 : 1 }}
          >
            {loading
              ? <span style={s.spin} />
              : <><Terminal size={15} strokeWidth={2} /><span>Authenticate</span></>
            }
          </button>

        </form>

        <div style={s.foot}>
          <Link to="/" style={s.back}>← Return to Public Portal</Link>
        </div>

      </div>

      <div style={s.build}>SRA Command Sys · Build 2025.1 · Encrypted</div>

      <style>{`
        .adm-input:focus {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 3px rgba(6,182,212,0.18) !important;
          background: rgba(255,255,255,0.07) !important;
          outline: none;
        }
        @keyframes adm-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', background: '#060a14',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative', overflow: 'hidden',
  },
  scanlines: {
    position: 'absolute', inset: 0,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
    pointerEvents: 'none', zIndex: 0,
  },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '36px',
    background: 'rgba(6,182,212,0.055)', borderBottom: '1px solid rgba(6,182,212,0.14)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', zIndex: 2,
  },
  topDot: { width: '5px', height: '5px', borderRadius: '50%', background: '#06b6d4', display: 'inline-block' },
  topTxt: { fontSize: '10px', fontWeight: '700', color: '#06b6d4', letterSpacing: '0.12em' },
  card: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: '420px',
    background: 'rgba(13,23,42,0.95)', border: '1px solid rgba(6,182,212,0.16)',
    borderRadius: '16px', padding: '40px 36px',
    boxShadow: '0 0 60px rgba(6,182,212,0.07), 0 24px 60px rgba(0,0,0,0.6)',
  },
  head:    { textAlign: 'center', marginBottom: '22px' },
  logo:    { fontSize: '16px', fontWeight: '800', color: '#06b6d4', letterSpacing: '-0.02em', display: 'block', marginBottom: '20px' },
  iconRing:{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  title:   { fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.025em' },
  sub:     { fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: '1.5' },
  warn:    { display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', background: 'rgba(251,191,36,0.055)', border: '1px solid rgba(251,191,36,0.16)', borderRadius: '8px', fontSize: '11.5px', color: '#78716c', fontWeight: '500', marginBottom: '22px', letterSpacing: '0.01em' },
  form:    { display: 'flex', flexDirection: 'column', gap: '18px' },
  group:   { display: 'flex', flexDirection: 'column', gap: '6px' },
  lbl:     { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' },
  dot:     { width: '4px', height: '4px', borderRadius: '50%', background: '#06b6d4', display: 'inline-block', flexShrink: 0 },
  inputBox:{ position: 'relative', display: 'flex', alignItems: 'center' },
  ico:     { position: 'absolute', left: '13px', color: '#334155', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '11px 13px 11px 38px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', color: '#e2e8f0', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', transition: 'border-color .2s, box-shadow .2s, background .2s',
  },
  eye:     { position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
  err:     { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', fontWeight: '500' },
  submit: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '13px 24px',
    background: 'linear-gradient(135deg, #0e7490, #06b6d4)',
    color: '#fff', fontSize: '15px', fontWeight: '600',
    border: 'none', borderRadius: '12px', cursor: 'pointer',
    boxShadow: '0 4px 18px rgba(6,182,212,0.28)', fontFamily: 'inherit',
    letterSpacing: '-0.01em', marginTop: '4px',
  },
  spin:    { width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'adm-spin .75s linear infinite', display: 'inline-block' },
  foot:    { marginTop: '24px', textAlign: 'center' },
  back:    { fontSize: '13px', color: '#334155', textDecoration: 'none' },
  build:   { position: 'absolute', bottom: '14px', fontSize: '10px', color: '#1e293b', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', zIndex: 1 },
};
