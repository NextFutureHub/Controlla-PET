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
// import Login from '../pages/Login';
import NotFound from '../pages/NotFound';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} /> */}
      
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
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;