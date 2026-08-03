import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ToastContainer from '../components/Toast.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';

export default function PublicLayout({ children }) {
  return (
    <ThemeProvider>
      <div className="public-layout">
        <header className="public-header">
          <div className="public-header-brand">
            <span className="public-header-logo">SRA</span>
            <span className="public-header-name">Smart Resource Allocator</span>
          </div>
          <Link to="/register-volunteer" className="public-register-link">
            Register as a Volunteer
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </header>
        <main className="public-main">
          {children}
          <ToastContainer />
        </main>
      </div>
    </ThemeProvider>
  );
}
