import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, UserCheck, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import ToastContainer from '../components/Toast.jsx';

const ADMIN_LINKS = [
  { to: '/dashboard',         label: 'Command Center', icon: LayoutDashboard },
  { to: '/admin/volunteers',  label: 'Volunteer Mgmt', icon: UserCheck },
  { to: '/report',            label: 'Field Report',   icon: Radio },
];

function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  // Admin portal always renders in dark mode
  useEffect(() => {
    const prev = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = 'dark';
    return () => { document.documentElement.dataset.theme = prev || ''; };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => window.dispatchEvent(new Event('resize')), 310);
    return () => clearTimeout(id);
  }, [isOpen]);

  return (
    <div className="portal-root">
      <nav
        className={`portal-nav-sidebar admin-sidebar${isOpen ? '' : ' collapsed'}`}
        aria-label="Admin navigation"
      >
        <button
          type="button"
          className="portal-sidebar-header"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="portal-sidebar-brand admin-brand">SRA</span>
          <span className="portal-sidebar-brand-sub">Command Center</span>
        </button>

        <div className="portal-sidebar-links">
          {ADMIN_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `portal-sidebar-link ${isActive ? 'active' : ''}`
              }
              title={!isOpen ? l.label : undefined}
            >
              <l.icon size={17} strokeWidth={2.2} />
              <span className="portal-sidebar-link-label">{l.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="portal-sidebar-footer">
          <div className="portal-sidebar-user">
            <span className="portal-sidebar-user-name">{user?.name}</span>
            <span className="portal-sidebar-user-role admin-badge">Admin</span>
          </div>
          <button onClick={logout} className="portal-sidebar-logout" title="Log out">
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="portal-nav-mobile" aria-label="Admin navigation">
        {ADMIN_LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `portal-tab ${isActive ? 'active' : ''}`}
          >
            <l.icon size={20} strokeWidth={2} />
            <span>{l.label}</span>
          </NavLink>
        ))}
        <button className="portal-tab" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>

      <div className="portal-main">
        {children}
        <ToastContainer />
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <ThemeProvider>
      <AdminShell>{children}</AdminShell>
    </ThemeProvider>
  );
}
