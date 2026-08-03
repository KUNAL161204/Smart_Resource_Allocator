import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, MapPin, Phone, Briefcase,
  ArrowRight, Heart, Zap, MapPinned, Eye, EyeOff,
  Navigation, CheckCircle, AlertTriangle, Loader,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const DOMAIN_OPTIONS = [
  'Medical', 'Logistics', 'Rescue', 'Education',
  'Water & Sanitation', 'Shelter', 'Food Security', 'Communications', 'Other',
];

const STATS = [
  { icon: Heart,     value: '2,400+', label: 'Volunteers',    color: '#f87171' },
  { icon: Zap,       value: '48hr',   label: 'Avg Response',  color: '#fbbf24' },
  { icon: MapPinned, value: '15',     label: 'Active Cities', color: '#34d399' },
];

const TEXT_FIELDS = [
  { id: 'name',     label: 'Full Name',       icon: User,   type: 'text',     placeholder: 'Your full name',      required: true  },
  { id: 'email',    label: 'Email Address',   icon: Mail,   type: 'email',    placeholder: 'you@example.com',     required: true  },
  { id: 'password', label: 'Password',        icon: Lock,   type: 'password', placeholder: 'Min. 8 characters',   required: true  },
  { id: 'address',  label: 'Address',         icon: MapPin, type: 'text',     placeholder: 'City, State',         required: false },
  { id: 'phone',    label: 'Phone Number',    icon: Phone,  type: 'tel',      placeholder: '+91 XXXXX XXXXX',     required: false },
];

/* ── Framer Motion variants ───────────────────────────────────────── */
const heroStagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
};
const heroItem = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};
const formSlide = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 } },
};
const fieldFade = (i) => ({
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.4 + i * 0.06 } },
});

/* ── Component ───────────────────────────────────────────────────── */
export default function VolunteerRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '', email: '', password: '', address: '', phone: '', domain_knowledge: '',
    location: { lat: null, lng: null },
  });
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState('');

  // GPS state machine: idle | fetching | success | error
  const [gpsState, setGpsState] = useState('idle');
  const [gpsMsg,   setGpsMsg]   = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) setError('');
  }

  // Fetch high-accuracy GPS via HTML5 Geolocation API. Handles permission denial,
  // unavailable hardware, and timeouts so the field worker gets a clear message
  // instead of a silent failure.
  function handleUseGps() {
    if (!('geolocation' in navigator)) {
      setGpsState('error');
      setGpsMsg('GPS not supported on this device.');
      return;
    }
    setGpsState('fetching');
    setGpsMsg('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((p) => ({ ...p, location: { lat: latitude, lng: longitude } }));
        setGpsState('success');
        setGpsMsg(`Location acquired · ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      (err) => {
        const msg =
          err.code === 1 ? 'Permission denied — enable location access in your browser.' :
          err.code === 2 ? 'Location unavailable — check device GPS / network.' :
          err.code === 3 ? 'Location request timed out. Please try again.' :
                           'Could not retrieve location.';
        setGpsState('error');
        setGpsMsg(msg);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Only ship location when coords were actually captured — backend ignores nullish.
      const { location, ...rest } = form;
      const payload = (location?.lat != null && location?.lng != null)
        ? { ...rest, location }
        : rest;

      const res  = await fetch(`${BASE}/api/auth/register-volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed.'); return; }
      login(data.token, data.user);
      navigate('/volunteer');
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pg.page}>
      {/* ambient glow orbs — kept on a single unified background */}
      <div style={pg.orb1} />
      <div style={pg.orb2} />
      <div style={pg.orb3} />

      <div style={pg.shell}>

        {/* ══ HERO (top) ═════════════════════════════════════════════════ */}
        <motion.section style={pg.hero} variants={heroStagger} initial="hidden" animate="visible">

          <motion.div variants={heroItem} style={pg.brandRow}>
            <span style={pg.brandLogo}>SRA</span>
            <span style={pg.brandSub}>Smart Resource Allocator</span>
          </motion.div>

          <motion.div variants={heroItem} style={pg.mottos}>
            <h1 style={pg.motto}>Be a part of the greater good.</h1>
            <p  style={pg.mottoSub}>Step up when it matters most.</p>
            <p  style={pg.mottoTer}>Your skills. Your community. Your moment.</p>
          </motion.div>

          <motion.div variants={heroItem} style={pg.divider} />

          <motion.div variants={heroItem} style={pg.statsRow}>
            {STATS.map(({ icon: Icon, value, label, color }) => (
              <div key={label} style={pg.statCard}>
                <Icon size={17} style={{ color, flexShrink: 0 }} strokeWidth={2} />
                <div>
                  <div style={{ ...pg.statVal, color }}>{value}</div>
                  <div style={pg.statLbl}>{label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.p variants={heroItem} style={pg.trust}>
            Trusted by emergency response agencies across 6 states
          </motion.p>

        </motion.section>

        {/* ══ FORM (bottom) ══════════════════════════════════════════════ */}
        <motion.section style={pg.formCard} variants={formSlide} initial="hidden" animate="visible">

          <div style={pg.formHead}>
            <h2 style={pg.formTitle}>Join the Response Network</h2>
            <p  style={pg.formSub}>Register your skills and be deployed where you're needed most.</p>
          </div>

          <form onSubmit={handleSubmit} style={pg.form}>

            <div style={pg.grid}>
              {TEXT_FIELDS.map((f, i) => (
                <motion.div
                  key={f.id}
                  variants={fieldFade(i)}
                  initial="hidden"
                  animate="visible"
                  style={f.id === 'address' || f.id === 'name' ? pg.groupWide : pg.group}
                >
                  <label htmlFor={f.id} style={pg.lbl}>
                    {f.label}{f.required && <span style={pg.req}> *</span>}
                  </label>
                  <div style={pg.inputBox}>
                    <f.icon size={14} style={pg.inputIco} />
                    <input
                      id={f.id}
                      name={f.id}
                      type={f.id === 'password' ? (showPwd ? 'text' : 'password') : f.type}
                      placeholder={f.placeholder}
                      value={form[f.id]}
                      onChange={handleChange}
                      required={f.required}
                      autoComplete={f.id === 'password' ? 'new-password' : 'on'}
                      style={f.id === 'address' ? { ...pg.input, paddingRight: 124 } : pg.input}
                      className="reg-input"
                    />
                    {f.id === 'password' && (
                      <button type="button" onClick={() => setShowPwd((v) => !v)} style={pg.eyeBtn}>
                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                    {f.id === 'address' && (
                      <button
                        type="button"
                        onClick={handleUseGps}
                        disabled={gpsState === 'fetching'}
                        style={{
                          ...pg.gpsBtn,
                          ...(gpsState === 'success' ? pg.gpsBtnOk    : null),
                          ...(gpsState === 'error'   ? pg.gpsBtnErr   : null),
                          ...(gpsState === 'fetching'? pg.gpsBtnBusy  : null),
                        }}
                        title="Use GPS to capture coordinates"
                      >
                        {gpsState === 'fetching'
                          ? <><Loader size={12} style={{ animation: 'reg-spin 0.9s linear infinite' }} /> Locating</>
                          : gpsState === 'success'
                            ? <><CheckCircle size={12} /> GPS Set</>
                            : <><Navigation size={12} /> Use GPS</>}
                      </button>
                    )}
                  </div>

                  {/* GPS feedback row — sits inside the address field group */}
                  {f.id === 'address' && gpsState !== 'idle' && (
                    <div
                      style={{
                        ...pg.gpsStatus,
                        ...(gpsState === 'success' ? pg.gpsStatusOk  : null),
                        ...(gpsState === 'error'   ? pg.gpsStatusErr : null),
                      }}
                    >
                      {gpsState === 'success' && <CheckCircle size={12} style={{ flexShrink: 0 }} />}
                      {gpsState === 'error'   && <AlertTriangle size={12} style={{ flexShrink: 0 }} />}
                      {gpsState === 'fetching'&& <Loader size={12} style={{ flexShrink: 0, animation: 'reg-spin 0.9s linear infinite' }} />}
                      <span>
                        {gpsState === 'fetching' ? 'Acquiring location signal…' : gpsMsg}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Domain Knowledge dropdown */}
              <motion.div
                variants={fieldFade(TEXT_FIELDS.length)}
                initial="hidden"
                animate="visible"
                style={pg.groupWide}
              >
                <label htmlFor="domain_knowledge" style={pg.lbl}>Domain Knowledge</label>
                <div style={pg.inputBox}>
                  <Briefcase size={14} style={pg.inputIco} />
                  <select
                    id="domain_knowledge"
                    name="domain_knowledge"
                    value={form.domain_knowledge}
                    onChange={handleChange}
                    style={{ ...pg.input, ...pg.select }}
                    className="reg-input"
                  >
                    <option value="">Select your specialty…</option>
                    {DOMAIN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </motion.div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={pg.errBox}>
                {error}
              </motion.div>
            )}

            <motion.button
              variants={fieldFade(TEXT_FIELDS.length + 1)}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{ ...pg.submitBtn, opacity: loading ? 0.75 : 1 }}
            >
              {loading
                ? <span style={pg.spinner} />
                : <><span>Register as Volunteer</span><ArrowRight size={16} strokeWidth={2.5} /></>
              }
            </motion.button>

          </form>

          <div style={pg.foot}>
            <p style={pg.footTxt}>
              Already registered?{' '}
              <Link to="/command-volunteer" style={pg.footLink}>Sign in here</Link>
            </p>
            <Link to="/" style={pg.backLink}>← Back to Portal</Link>
          </div>

        </motion.section>
      </div>

      <style>{`
        .reg-input:focus {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.20) !important;
          background: rgba(255, 255, 255, 0.07) !important;
          outline: none;
        }
        .reg-input option { background: #0f172a; color: #f1f5f9; }
        @keyframes reg-spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .reg-grid-mobile { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const pg = {
  /* Single unified deep-blue background — no split partition. */
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(ellipse 70% 60% at 28% 10%, #0d1b3e 0%, transparent 60%), ' +
      'radial-gradient(ellipse 80% 70% at 72% 90%, #0a1733 0%, transparent 65%), ' +
      '#060a14',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, sans-serif",
    padding: '48px 24px',
  },

  /* Ambient glow orbs spread across the whole canvas */
  orb1: {
    position: 'absolute', top: '-120px', left: '-80px',
    width: '520px', height: '520px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.13) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-120px', right: '-80px',
    width: '460px', height: '460px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.10) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute', top: '40%', left: '50%',
    width: '320px', height: '320px', borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  /* Centered, max-width column — hero on top, form below, single bg. */
  shell: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '780px',
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
  },

  /* Hero (no contrasting panel — sits directly on page bg) */
  hero: {
    display: 'flex', flexDirection: 'column',
    textAlign: 'center', alignItems: 'center',
    padding: '24px 8px 0',
  },
  brandRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '12px', marginBottom: '32px',
  },
  brandLogo: { fontSize: '20px', fontWeight: '800', color: '#06b6d4', letterSpacing: '-0.02em' },
  brandSub:  { fontSize: '11px', fontWeight: '600', color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' },
  mottos:    { marginBottom: '28px', maxWidth: '640px' },
  motto:     {
    fontSize: 'clamp(30px, 5vw, 42px)',
    fontWeight: '700', color: '#f1f5f9', lineHeight: 1.18,
    margin: '0 0 14px', letterSpacing: '-0.03em',
  },
  mottoSub:  { fontSize: '19px', fontWeight: '500', color: '#93c5fd', margin: '0 0 8px', letterSpacing: '-0.015em' },
  mottoTer:  { fontSize: '14px', fontWeight: '400', color: '#64748b', margin: 0 },
  divider:   {
    width: '64px', height: '2px',
    background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
    borderRadius: '2px', margin: '0 auto 28px',
  },
  statsRow: {
    display: 'flex', gap: '12px', flexWrap: 'wrap',
    marginBottom: '24px', justifyContent: 'center',
  },
  statCard: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px', backdropFilter: 'blur(6px)',
    minWidth: '150px',
  },
  statVal: { fontSize: '17px', fontWeight: '700', lineHeight: 1, letterSpacing: '-0.02em', textAlign: 'left' },
  statLbl: { fontSize: '11px', color: '#475569', fontWeight: '500', marginTop: '2px', textAlign: 'left' },
  trust:   { fontSize: '12px', color: '#475569', fontWeight: '500', margin: 0 },

  /* Form card — subtle elevated surface, same blue family, NO hard partition */
  formCard: {
    background: 'rgba(13, 23, 42, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '20px',
    padding: '36px 36px 32px',
    backdropFilter: 'blur(14px)',
    boxShadow:
      '0 24px 60px rgba(0, 0, 0, 0.45), 0 0 60px rgba(6, 182, 212, 0.04)',
  },
  formHead: { marginBottom: '24px', textAlign: 'center' },
  formTitle: {
    fontSize: '24px', fontWeight: '700', color: '#f1f5f9',
    margin: '0 0 8px', letterSpacing: '-0.025em',
  },
  formSub: { fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.55 },
  form:    { display: 'flex', flexDirection: 'column', gap: '18px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  group:     { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 },
  groupWide: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, gridColumn: '1 / -1' },
  lbl:       { fontSize: '11.5px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' },
  req:       { color: '#f87171' },
  inputBox:  { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIco:  { position: 'absolute', left: '13px', color: '#475569', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '11px 13px 11px 38px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    color: '#f1f5f9', fontSize: '13.5px',
    fontFamily: 'inherit',
    transition: 'border-color .2s, box-shadow .2s, background .2s',
    outline: 'none',
  },
  select: { appearance: 'none', cursor: 'pointer' },
  eyeBtn: {
    position: 'absolute', right: '12px',
    background: 'none', border: 'none', color: '#475569',
    cursor: 'pointer', padding: '4px',
    display: 'flex', alignItems: 'center',
  },

  /* GPS pill — sits inside the address inputBox on the right edge */
  gpsBtn: {
    position: 'absolute', right: '8px',
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '5px 10px', borderRadius: '8px',
    background: 'rgba(6, 182, 212, 0.10)',
    border: '1px solid rgba(6, 182, 212, 0.32)',
    color: '#67e8f9',
    fontSize: '11px', fontWeight: '600', letterSpacing: '0.02em',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'background .15s, border-color .15s, color .15s, opacity .15s',
    whiteSpace: 'nowrap',
  },
  gpsBtnOk:   { background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.38)', color: '#6ee7b7' },
  gpsBtnErr:  { background: 'rgba(239, 68, 68, 0.12)',  border: '1px solid rgba(239, 68, 68, 0.36)',  color: '#fca5a5' },
  gpsBtnBusy: { opacity: 0.75, cursor: 'wait' },

  /* Inline status row underneath address field */
  gpsStatus: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    marginTop: '4px',
    fontSize: '11.5px', fontWeight: '500',
    color: '#94a3b8',
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace",
    letterSpacing: '0.01em',
  },
  gpsStatusOk:  { color: '#6ee7b7' },
  gpsStatusErr: { color: '#fca5a5' },

  errBox: {
    padding: '10px 14px',
    background: 'rgba(239, 68, 68, 0.10)',
    border: '1px solid rgba(239, 68, 68, 0.24)',
    borderRadius: '10px', color: '#fca5a5',
    fontSize: '13px', fontWeight: '500',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    padding: '13px 22px',
    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    color: '#fff', fontSize: '14.5px', fontWeight: '600',
    border: 'none', borderRadius: '12px', cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 4px 18px rgba(6, 182, 212, 0.32)',
    letterSpacing: '-0.01em', fontFamily: 'inherit',
  },
  spinner: {
    width: '18px', height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'reg-spin .75s linear infinite',
    display: 'inline-block',
  },
  foot: { marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' },
  footTxt:  { fontSize: '13px', color: '#475569', margin: 0 },
  footLink: { color: '#06b6d4', fontWeight: '600', textDecoration: 'none' },
  backLink: { fontSize: '13px', color: '#475569', textDecoration: 'none' },
};
