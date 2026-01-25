import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Loading from '../components/Loading';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import Dashboard from '../pages/Dashboard';
import Appointments from '../pages/Appointments';
import NewAppointment from '../pages/NewAppointment';
import Donations from '../pages/Donations';
import AvailabilitySlots from '../pages/admin/AvailabilitySlots';
import MySlots from '../pages/therapy/MySlots';
import RecurringAvailability from '../pages/therapy/RecurringAvailability';
import TherapyAppointments from '../pages/therapy/TherapyAppointments';
import CalendarView from '../pages/therapy/CalendarView';
import TherapistProfilePage from '../pages/therapy/TherapistProfile';
import AppointmentCalendar from '../pages/AppointmentCalendar';
import ClientProfile from '../pages/ClientProfile';
import DonationProfile from '../pages/donation/DonationProfile';
import DonationProjects from '../pages/donation/DonationProjects';
import ProjectDocuments from '../pages/donation/ProjectDocuments';
import MultiDonations from '../pages/MultiDonations';

// Route protégée
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Route admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Route therapy
const TherapyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier les rôles : d'abord via roles[], puis via role
  const hasRole = (roleSlug: string): boolean => {
    if (!user) return false;
    if (user.roles && user.roles.includes(roleSlug)) return true;
    return user.role === roleSlug;
  };

  if (!hasRole('therapy') && !hasRole('admin') && !hasRole('superadmin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Route publique (redirige si déjà connecté)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PublicRoute>
              <VerifyEmail />
            </PublicRoute>
          }
        />

        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Layout>
                <Appointments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/therapy/appointments"
          element={
            <TherapyRoute>
              <Layout>
                <TherapyAppointments />
              </Layout>
            </TherapyRoute>
          }
        />
        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute>
              <Layout>
                <NewAppointment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donations"
          element={
            <ProtectedRoute>
              <Layout>
                <Donations />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donations/multi"
          element={
            <ProtectedRoute>
              <Layout>
                <MultiDonations />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/availability-slots"
          element={
            <AdminRoute>
              <Layout>
                <AvailabilitySlots />
              </Layout>
            </AdminRoute>
          }
        />

        {/* Routes Therapy */}
        <Route
          path="/therapy/slots"
          element={
            <TherapyRoute>
              <Layout>
                <MySlots />
              </Layout>
            </TherapyRoute>
          }
        />
        <Route
          path="/therapy/availability"
          element={
            <TherapyRoute>
              <Layout>
                <RecurringAvailability />
              </Layout>
            </TherapyRoute>
          }
        />
        <Route
          path="/therapy/calendar"
          element={
            <TherapyRoute>
              <Layout>
                <CalendarView />
              </Layout>
            </TherapyRoute>
          }
        />
        <Route
          path="/therapy/profile"
          element={
            <TherapyRoute>
              <Layout>
                <TherapistProfilePage />
              </Layout>
            </TherapyRoute>
          }
        />
        <Route
          path="/appointments/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <AppointmentCalendar />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Profils utilisateurs */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ClientProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donation/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <DonationProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donation/projects"
          element={
            <ProtectedRoute>
              <Layout>
                <DonationProjects />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donation/projects/:id/documents"
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectDocuments />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Route par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
