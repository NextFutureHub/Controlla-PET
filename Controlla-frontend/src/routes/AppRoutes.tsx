import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import Contractors from '../pages/Contractors';
import ContractorDetails from '../pages/ContractorDetails';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import TimeTracking from '../pages/TimeTracking';
import Finance from '../pages/Finance';
import TenantSettings from '../pages/TenantSettings';
import Reports from '../pages/Reports';
import Messages from '../pages/Messages';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { TenantRegistration } from '../pages/TenantRegistration';
import NotFound from '../pages/NotFound';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tenant-registration" element={<TenantRegistration />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="contractors/:id" element={<ContractorDetails />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="time-tracking" element={<TimeTracking />} />
        <Route path="finance" element={<Finance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="messages" element={<Messages />} />
        <Route path="tenant-settings" element={<TenantSettings />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;