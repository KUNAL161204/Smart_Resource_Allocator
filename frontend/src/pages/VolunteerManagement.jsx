import { useEffect, useMemo, useState } from 'react';
import {
  Users, MapPin, Briefcase, Calendar, Mail, Phone,
  RefreshCw, AlertTriangle, Search, ShieldCheck, Navigation,
} from 'lucide-react';
import { adminAPI } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

/* ────────────────────────────────────────────────────────────────────
 * Domain → avatar / accent palette.
 * Drives both the avatar circle hue and the skills chip per volunteer
 * so each card has a clear visual signature without breaking dark mode.
 * ──────────────────────────────────────────────────────────────────── */
const DOMAIN_PALETTE = {
  Medical:               { avatarBg: 'linear-gradient(135deg, #ef4444, #b91c1c)', accent: '#fca5a5' },
  Logistics:             { avatarBg: 'linear-gradient(135deg, #f59e0b, #b45309)', accent: '#fcd34d' },
  Rescue:                { avatarBg: 'linear-gradient(135deg, #ec4899, #be185d)', accent: '#f9a8d4' },
  Education:             { avatarBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', accent: '#c4b5fd' },
  'Water & Sanitation':  { avatarBg: 'linear-gradient(135deg, #0ea5e9, #0369a1)', accent: '#7dd3fc' },
  Shelter:               { avatarBg: 'linear-gradient(135deg, #10b981, #047857)', accent: '#6ee7b7' },
  'Food Security':       { avatarBg: 'linear-gradient(135deg, #f97316, #c2410c)', accent: '#fdba74' },
  Communications:        { avatarBg: 'linear-gradient(135deg, #14b8a6, #0f766e)', accent: '#5eead4' },
  Other:                 { avatarBg: 'linear-gradient(135deg, #64748b, #334155)', accent: '#cbd5e1' },
};
const DEFAULT_PALETTE = { avatarBg: 'linear-gradient(135deg, #06b6d4, #0e7490)', accent: '#67e8f9' };

function paletteFor(vol) {
  return DOMAIN_PALETTE[vol?.domain_knowledge] || DEFAULT_PALETTE;
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatCoords(loc) {
  if (!loc || loc.lat == null || loc.lng == null) return null;
  const lat = Number(loc.lat);
  const lng = Number(loc.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/* ────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */
export default function VolunteerManagement() {
  const { token } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [query,      setQuery]      = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function load(showSpinner = true) {
    if (showSpinner) setLoading(true);
    setError('');
    try {
      const data = await adminAPI.getVolunteers(token);
      setVolunteers(data.volunteers || []);
    } catch (err) {
      setError(err.message || 'Failed to load volunteer roster.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return volunteers;
    return volunteers.filter((v) =>
      [v.name, v.email, v.phone, v.address, v.domain_knowledge]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    );
  }, [volunteers, query]);

  const stats = useMemo(() => {
    const total = volunteers.length;
    const domains = new Set(volunteers.map((v) => v.domain_knowledge).filter(Boolean));
    const geo = volunteers.filter((v) => v.location?.lat != null && v.location?.lng != null).length;
    return { total, domains: domains.size, geo };
  }, [volunteers]);

  return (
    <div style={s.page}>
      <div style={s.scanlines} />

      <div style={s.container}>

        {/* Header */}
        <header style={s.header}>
          <div style={s.headerTop}>
            <div style={s.headerTitleRow}>
              <div style={s.iconRing}>
                <Users size={20} color="#06b6d4" strokeWidth={2} />
              </div>
              <div>
                <h1 style={s.title}>Volunteer Roster</h1>
                <p style={s.subtitle}>Authenticated personnel registered with SRA Command</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setRefreshing(true); load(false); }}
              disabled={refreshing || loading}
              style={{ ...s.refreshBtn, opacity: refreshing || loading ? 0.55 : 1 }}
              title="Refresh roster"
            >
              <RefreshCw
                size={14}
                strokeWidth={2.4}
                style={refreshing ? { animation: 'vm-spin 0.9s linear infinite' } : undefined}
              />
              <span>{refreshing ? 'Syncing…' : 'Refresh'}</span>
            </button>
          </div>

          {/* Stat strip */}
          <div style={s.statStrip}>
            <div style={s.statCard}>
              <span style={s.statLbl}>Total Volunteers</span>
              <span style={s.statVal}>{stats.total}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLbl}>Domains Covered</span>
              <span style={s.statVal}>{stats.domains}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLbl}>GPS Tagged</span>
              <span style={{ ...s.statVal, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Navigation size={15} strokeWidth={2.4} color="#67e8f9" />
                {stats.geo}
              </span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLbl}>System Status</span>
              <span style={{ ...s.statVal, color: '#34d399', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={15} strokeWidth={2.4} />
                Operational
              </span>
            </div>
          </div>

          {/* Search */}
          <div style={s.searchBox}>
            <Search size={14} style={s.searchIco} />
            <input
              type="search"
              placeholder="Filter by name, email, phone, address, domain…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={s.searchInput}
              className="vm-search"
            />
          </div>
        </header>

        {/* Body */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(true)} />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilter={!!query.trim()} />
        ) : (
          <RosterGrid volunteers={filtered} totalCount={volunteers.length} />
        )}

      </div>

      <style>{`
        .vm-search:focus {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.18) !important;
          background: rgba(255, 255, 255, 0.06) !important;
          outline: none;
        }
        .vm-card:hover {
          transform: translateY(-2px);
          border-color: rgba(52, 211, 153, 0.55) !important;
          box-shadow: 0 18px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(52, 211, 153, 0.18) !important;
        }
        @keyframes vm-spin     { to { transform: rotate(360deg); } }
        @keyframes vm-pulse    {
          0%, 100% { opacity: 0.45; }
          50%      { opacity: 1; }
        }
        @keyframes vm-dot-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55); }
          50%      { box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * Roster Grid — tactical card layout under "AVAILABLE ON STANDBY"
 * ──────────────────────────────────────────────────────────────────── */
function RosterGrid({ volunteers, totalCount }) {
  return (
    <section style={s.section}>
      <header style={s.sectionHead}>
        <span style={s.sectionDot} />
        <h2 style={s.sectionTitle}>AVAILABLE ON STANDBY</h2>
        <span style={s.sectionCount}>
          {volunteers.length}{volunteers.length !== totalCount ? ` / ${totalCount}` : ''}
        </span>
      </header>

      <div style={s.grid}>
        {volunteers.map((v) => (
          <VolunteerCard key={v._id || v.email} vol={v} />
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * Volunteer Card — mirrors the "My Missions" tactical aesthetic
 * ──────────────────────────────────────────────────────────────────── */
function VolunteerCard({ vol }) {
  const palette = paletteFor(vol);
  const initial = (vol.name || '?').trim().charAt(0).toUpperCase();
  const coords = formatCoords(vol.location);

  return (
    <article style={s.card} className="vm-card">
      {/* Top row — avatar + status pill */}
      <div style={s.cardTop}>
        <div style={{ ...s.avatar, background: palette.avatarBg }}>{initial}</div>
        <span style={s.statusPill}>
          <span style={s.statusDot} />
          Available
        </span>
      </div>

      {/* Identity */}
      <h3 style={s.cardName}>{vol.name || 'Unnamed Volunteer'}</h3>

      {/* Skills (domain knowledge) */}
      <p style={{ ...s.cardSkills, color: palette.accent }}>
        <Briefcase size={11} strokeWidth={2.4} style={{ flexShrink: 0 }} />
        {vol.domain_knowledge || 'Specialty unspecified'}
      </p>

      {/* Tactical location strip — address + GPS coords */}
      <div style={s.locStrip}>
        <div style={s.locRow}>
          <MapPin size={12} style={s.locIco} />
          <span style={s.locText} title={vol.address || undefined}>
            {vol.address || 'No address on file'}
          </span>
        </div>
        <div style={s.locRow}>
          <Navigation size={12} style={{ ...s.locIco, color: coords ? '#67e8f9' : '#475569' }} />
          <span style={{ ...s.locCoords, color: coords ? '#7dd3fc' : '#475569' }}>
            {coords ? `LAT ${vol.location.lat.toFixed(4)} · LNG ${vol.location.lng.toFixed(4)}` : 'GPS not provided'}
          </span>
        </div>
      </div>

      {/* Footer — contact + join date */}
      <footer style={s.cardFoot}>
        <span style={s.footItem} title={vol.email}>
          <Mail size={11} style={s.footIco} />
          <span style={s.footTxt}>{vol.email || '—'}</span>
        </span>
        {vol.phone && (
          <span style={s.footItem}>
            <Phone size={11} style={s.footIco} />
            <span style={s.footTxt}>{vol.phone}</span>
          </span>
        )}
        <span style={s.footItem}>
          <Calendar size={11} style={s.footIco} />
          <span style={s.footTxt}>{formatDate(vol.created_at)}</span>
        </span>
      </footer>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * Loading / Error / Empty states
 * ──────────────────────────────────────────────────────────────────── */
function LoadingState() {
  return (
    <div style={s.stateBox}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, animation: 'vm-pulse 1.4s ease-in-out infinite' }}>
        <RefreshCw size={16} color="#06b6d4" style={{ animation: 'vm-spin 1.2s linear infinite' }} />
        <span style={s.stateTitle}>LOADING ROSTER…</span>
      </div>
      <span style={s.stateSub}>Synchronizing with command database</span>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ ...s.stateBox, borderColor: 'rgba(239, 68, 68, 0.28)', background: 'rgba(239, 68, 68, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={16} color="#fca5a5" />
        <span style={{ ...s.stateTitle, color: '#fca5a5' }}>ROSTER UNAVAILABLE</span>
      </div>
      <span style={s.stateSub}>{message}</span>
      <button onClick={onRetry} style={s.retryBtn}>Retry</button>
    </div>
  );
}

function EmptyState({ hasFilter }) {
  return (
    <div style={s.stateBox}>
      <span style={s.stateTitle}>{hasFilter ? 'NO MATCHES' : 'NO VOLUNTEERS REGISTERED'}</span>
      <span style={s.stateSub}>
        {hasFilter
          ? 'Try a different search term or clear the filter.'
          : 'Volunteers who register at /register-volunteer will appear here.'}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * Styles — dark Command Center aesthetic, rounded-corner card grid
 * ──────────────────────────────────────────────────────────────────── */
const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace";

const s = {
  page: {
    minHeight: '100vh',
    background: '#060a14',
    padding: '32px 28px 60px',
    fontFamily: "'Inter', -apple-system, sans-serif",
    color: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  scanlines: {
    position: 'absolute', inset: 0,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
    pointerEvents: 'none', zIndex: 0,
  },
  container: { position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto' },

  /* Header */
  header: { marginBottom: 28 },
  headerTop: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 16, marginBottom: 22,
  },
  headerTitleRow: { display: 'flex', alignItems: 'center', gap: 14 },
  iconRing: {
    width: 44, height: 44, borderRadius: 12,
    background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.22)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 22, fontWeight: 700, color: '#f1f5f9',
    margin: '0 0 4px', letterSpacing: '-0.02em',
  },
  subtitle: { fontSize: 13, color: '#64748b', margin: 0, letterSpacing: '0.005em' },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 16px',
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.26)',
    borderRadius: 10, color: '#67e8f9',
    fontSize: 12, fontWeight: 600,
    fontFamily: MONO, letterSpacing: '0.04em', textTransform: 'uppercase',
    cursor: 'pointer', transition: 'background .2s, border-color .2s',
  },

  statStrip: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12, marginBottom: 18,
  },
  statCard: {
    display: 'flex', flexDirection: 'column', gap: 6,
    padding: '14px 16px',
    background: 'rgba(13, 23, 42, 0.7)',
    border: '1px solid rgba(6, 182, 212, 0.14)',
    borderRadius: 12,
  },
  statLbl: {
    fontSize: 10.5, fontWeight: 700, color: '#475569',
    letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: MONO,
  },
  statVal: {
    fontSize: 22, fontWeight: 700, color: '#f1f5f9',
    letterSpacing: '-0.02em', fontFamily: MONO,
  },

  searchBox: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIco: { position: 'absolute', left: 13, color: '#475569', pointerEvents: 'none' },
  searchInput: {
    width: '100%', padding: '11px 14px 11px 38px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 10, color: '#e2e8f0', fontSize: 13.5,
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .2s, box-shadow .2s, background .2s',
  },

  /* Section title — "AVAILABLE ON STANDBY" */
  section: { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionHead: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '4px 2px',
  },
  sectionDot: {
    width: 9, height: 9, borderRadius: '50%',
    background: '#34d399',
    boxShadow: '0 0 0 3px rgba(52, 211, 153, 0.18)',
    animation: 'vm-dot-glow 2s ease-in-out infinite',
    flexShrink: 0,
  },
  sectionTitle: {
    margin: 0, fontSize: 13, fontWeight: 700, color: '#f1f5f9',
    letterSpacing: '0.18em', fontFamily: MONO, textTransform: 'uppercase',
  },
  sectionCount: {
    marginLeft: 6, padding: '3px 10px',
    fontSize: 11, fontWeight: 700, color: '#67e8f9',
    background: 'rgba(6, 182, 212, 0.10)',
    border: '1px solid rgba(6, 182, 212, 0.28)',
    borderRadius: 999,
    fontFamily: MONO, letterSpacing: '0.04em',
  },

  /* Card grid — 2 columns on desktop, fluid down to 1 */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 16,
  },

  /* The card itself */
  card: {
    display: 'flex', flexDirection: 'column', gap: 10,
    padding: '18px 18px 14px',
    background: 'rgba(15, 23, 42, 0.85)',
    border: '1px solid rgba(52, 211, 153, 0.28)',
    borderRadius: 14,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    transition: 'transform .2s, border-color .2s, box-shadow .2s',
    cursor: 'default',
    minWidth: 0,
  },
  cardTop: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, marginBottom: 2,
  },
  avatar: {
    width: 44, height: 44, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 18,
    letterSpacing: '-0.02em',
    boxShadow: '0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
    flexShrink: 0,
  },
  statusPill: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 11px', borderRadius: 999,
    background: 'rgba(52, 211, 153, 0.10)',
    border: '1px solid rgba(52, 211, 153, 0.32)',
    color: '#6ee7b7',
    fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
    fontFamily: MONO,
  },
  statusDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#34d399',
    boxShadow: '0 0 6px rgba(52, 211, 153, 0.7)',
    flexShrink: 0,
  },

  cardName: {
    margin: 0, fontSize: 17, fontWeight: 700,
    color: '#f1f5f9', letterSpacing: '-0.015em',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  cardSkills: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    margin: 0, fontSize: 12.5, fontWeight: 600,
    letterSpacing: '0.01em',
  },

  /* Tactical location strip */
  locStrip: {
    display: 'flex', flexDirection: 'column', gap: 5,
    padding: '10px 12px',
    background: 'rgba(6, 182, 212, 0.04)',
    border: '1px solid rgba(6, 182, 212, 0.14)',
    borderRadius: 10,
    marginTop: 4,
  },
  locRow: { display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 },
  locIco: { color: '#475569', flexShrink: 0 },
  locText: {
    fontSize: 12, color: '#cbd5e1',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    minWidth: 0,
  },
  locCoords: {
    fontSize: 11, fontFamily: MONO, letterSpacing: '0.02em',
    fontWeight: 600,
  },

  /* Footer */
  cardFoot: {
    display: 'flex', flexWrap: 'wrap', gap: '8px 14px',
    paddingTop: 10, marginTop: 4,
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  footItem: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, color: '#64748b',
    minWidth: 0, maxWidth: '100%',
  },
  footIco: { color: '#475569', flexShrink: 0 },
  footTxt: {
    fontFamily: MONO, fontSize: 11,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },

  /* States */
  stateBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 12, padding: '70px 24px',
    background: 'rgba(13, 23, 42, 0.5)',
    border: '1px dashed rgba(6, 182, 212, 0.22)',
    borderRadius: 14, textAlign: 'center',
  },
  stateTitle: {
    fontSize: 12.5, fontWeight: 700, color: '#67e8f9',
    letterSpacing: '0.18em', fontFamily: MONO, textTransform: 'uppercase',
  },
  stateSub: { fontSize: 13, color: '#64748b', maxWidth: 380, lineHeight: 1.55 },
  retryBtn: {
    marginTop: 8, padding: '8px 18px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.32)',
    borderRadius: 10, color: '#fca5a5',
    fontSize: 12, fontWeight: 600, fontFamily: MONO,
    letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
  },
};
