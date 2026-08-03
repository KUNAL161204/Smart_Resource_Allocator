import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Radio, UserCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import ToastContainer from '../components/Toast.jsx';

const VOLUNTEER_LINKS = [
  { to: '/report', label: 'Field Report', icon: Radio },
  { to: '/volunteer', label: 'My Missions', icon: UserCheck },
];

function VolunteerShell({ children }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => window.dispatchEvent(new Event('resize')), 310);
    return () => clearTimeout(id);
  }, [isOpen]);

  return (
    <div className="portal-root">
      <nav
        className={`portal-nav-sidebar${isOpen ? '' : ' collapsed'}`}
        aria-label="Volunteer navigation"
      >
        <button
          type="button"
          className="portal-sidebar-header"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="portal-sidebar-brand">SRA</span>
          <span className="portal-sidebar-brand-sub">Volunteer Portal</span>
        </button>

        <div className="portal-sidebar-links">
          {VOLUNTEER_LINKS.map((l) => (
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
            <span className="portal-sidebar-user-role">Volunteer</span>
          </div>
          <button onClick={logout} className="portal-sidebar-logout" title="Log out">
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="portal-nav-mobile" aria-label="Volunteer navigation">
        {VOLUNTEER_LINKS.map((l) => (
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

export default function VolunteerLayout({ children }) {
  return (
    <ThemeProvider>
      <VolunteerShell>{children}</VolunteerShell>
    </ThemeProvider>
  );
}
