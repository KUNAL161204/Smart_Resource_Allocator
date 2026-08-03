import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ── Existing pages (untouched) ──────────────────────────────────────
import App            from './App.jsx';
import FieldPortal    from './pages/FieldPortal.jsx';
import VolunteerPortal from './pages/VolunteerPortal.jsx';

// ── New auth pages ──────────────────────────────────────────────────
import VolunteerRegister   from './pages/VolunteerRegister.jsx';
import VolunteerLogin      from './pages/VolunteerLogin.jsx';
import AdminLogin          from './pages/AdminLogin.jsx';
import VolunteerManagement from './pages/VolunteerManagement.jsx';

// ── Layouts & guards ───────────────────────────────────────────────
import PublicLayout       from './layouts/PublicLayout.jsx';
import { PrivateRoute }   from './components/ProtectedRoute.jsx';
import { AuthProvider }   from './context/AuthContext.jsx';

import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── PUBLIC PORTAL ────────────────────────────────────────
              Landing page: open incident field-report form.
              Header contains "Register as a Volunteer" link only.     */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <FieldPortal />
              </PublicLayout>
            }
          />

          {/* ── VOLUNTEER REGISTRATION (public, unlinked from nav) ── */}
          <Route path="/register-volunteer" element={<VolunteerRegister />} />

          {/* ── HIDDEN AUTH ROUTES (direct URL only, zero links) ──── */}
          <Route path="/command-volunteer" element={<VolunteerLogin />} />
          <Route path="/command-admin"     element={<AdminLogin />}     />

          {/* ── PROTECTED: Admin only — coordinator command dashboard  */}
          <Route
            path="/dashboard"
            element={<PrivateRoute element={<App />} adminOnly />}
          />

          {/* ── PROTECTED: Admin only — volunteer roster management    */}
          <Route
            path="/admin/volunteers"
            element={<PrivateRoute element={<VolunteerManagement />} adminOnly />}
          />

          {/* ── PROTECTED: Volunteer + Admin — volunteer roster        */}
          <Route
            path="/volunteer"
            element={<PrivateRoute element={<VolunteerPortal />} />}
          />

          {/* ── PROTECTED: Volunteer + Admin — field report (internal) */}
          <Route
            path="/report"
            element={<PrivateRoute element={<FieldPortal />} />}
          />

          {/* ── CATCH-ALL: redirect anything unknown to public portal  */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
