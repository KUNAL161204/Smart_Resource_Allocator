import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import VolunteerLayout from '../layouts/VolunteerLayout.jsx';

/**
 * Wraps a protected page element with the correct role-aware layout.
 * - Not authenticated → redirect to /
 * - adminOnly + non-admin role → redirect to /
 * - Admin user → AdminLayout
 * - Volunteer user → VolunteerLayout
 */
export function PrivateRoute({ element, adminOnly = false }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;

  const Layout = user?.role === 'admin' ? AdminLayout : VolunteerLayout;
  return <Layout>{element}</Layout>;
}
