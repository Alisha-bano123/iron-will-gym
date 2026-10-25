import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import Home        from './pages/Home';
import Login       from './pages/Login';
import PendingPage from './pages/PendingPage';

// Owner pages
import OwnerLayout        from './pages/owner/OwnerLayout';
import OwnerDashboard     from './pages/owner/OwnerDashboard';
import Members            from './pages/owner/Members';
import PendingRequests    from './pages/owner/PendingRequests';
import ExpiringPlans      from './pages/owner/ExpiringPlans';
import AttendanceOwner    from './pages/owner/AttendanceOwner';
import FeedbackApproval   from './pages/owner/FeedbackApproval';
import Payments           from './pages/owner/Payments';
import OwnerAnnouncements from './pages/owner/OwnerAnnouncements';

// Client pages
import ClientLayout        from './pages/client/ClientLayout';
import ClientDashboard     from './pages/client/ClientDashboard';
import DietPlan            from './pages/client/DietPlan';
import WorkoutPlan         from './pages/client/WorkoutPlan';
import WorkoutLogPage      from './pages/client/WorkoutLogPage';
import Streak              from './pages/client/Streak';
import WeightTracker       from './pages/client/WeightTracker';
import ClientAnnouncements from './pages/client/ClientAnnouncements';
import FeedbackClient      from './pages/client/FeedbackClient';
import ProgressNotes       from './pages/client/ProgressNotes';

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center h-screen bg-dark">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
      <p className="text-gray-400 text-sm">Loading…</p>
    </div>
  </div>
);

// ── Owner Guard ───────────────────────────────────────────────────────────────
const OwnerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)             return <Navigate to="/login" replace />;
  if (user.role !== 'owner') return <Navigate to="/" replace />;
  return children;
};

// ── Client Guard ──────────────────────────────────────────────────────────────
const ClientRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)                      return <Navigate to="/login" replace />;
  if (user.role === 'owner')      return <Navigate to="/owner/dashboard" replace />;
  if (user.status !== 'approved') return <Navigate to="/pending" replace />;
  return children;
};

// ── Login with redirect if already logged in ──────────────────────────────────
const LoginRedirect = () => {
  const { user, loading } = useAuth();
  if (loading)                     return <Spinner />;
  if (user?.role === 'owner')      return <Navigate to="/owner/dashboard" replace />;
  if (user?.status === 'approved') return <Navigate to="/client/dashboard" replace />;
  if (user?.status === 'pending')  return <Navigate to="/pending" replace />;
  return <Login />;
};

// ── All Routes ────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/"        element={<Home />} />
    <Route path="/login"   element={<LoginRedirect />} />
    <Route path="/pending" element={<PendingPage />} />

    {/* Owner */}
    <Route path="/owner" element={<OwnerRoute><OwnerLayout /></OwnerRoute>}>
      <Route index                element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard"     element={<OwnerDashboard />} />
      <Route path="members"       element={<Members />} />
      <Route path="pending"       element={<PendingRequests />} />
      <Route path="expiring"      element={<ExpiringPlans />} />
      <Route path="attendance"    element={<AttendanceOwner />} />
      <Route path="payments"      element={<Payments />} />
      <Route path="announcements" element={<OwnerAnnouncements />} />
      <Route path="feedbacks"     element={<FeedbackApproval />} />
    </Route>

    {/* Client */}
    <Route path="/client" element={<ClientRoute><ClientLayout /></ClientRoute>}>
      <Route index                 element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard"      element={<ClientDashboard />} />
      <Route path="diet"           element={<DietPlan />} />
      <Route path="workout"        element={<WorkoutPlan />} />
      <Route path="workoutlog"     element={<WorkoutLogPage />} />
      <Route path="streak"         element={<Streak />} />
      <Route path="weight"         element={<WeightTracker />} />
      <Route path="announcements"  element={<ClientAnnouncements />} />
      <Route path="feedback"       element={<FeedbackClient />} />
      <Route path="notes"          element={<ProgressNotes />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#16213E',
              color: '#fff',
              border: '1px solid #FF6B35',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}