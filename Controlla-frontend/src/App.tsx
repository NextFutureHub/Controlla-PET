import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import { TenantRegistration } from './pages/TenantRegistration';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Contractors from './pages/Contractors';
import ContractorDetails from './pages/ContractorDetails';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import { UserRole } from './types/user';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tenant-registration" element={<TenantRegistration />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route path="projects" element={
                <ProtectedRoute requiredRoles={[UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER]}>
                  <Projects />
                </ProtectedRoute>
              } />
              <Route path="projects/:id" element={
                <ProtectedRoute requiredRoles={[UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER]}>
                  <ProjectDetails />
                </ProtectedRoute>
              } />
              
              <Route path="contractors" element={
                <ProtectedRoute requiredRoles={[UserRole.OWNER, UserRole.ADMIN]}>
                  <Contractors />
                </ProtectedRoute>
              } />
              <Route path="contractors/:id" element={
                <ProtectedRoute requiredRoles={[UserRole.OWNER, UserRole.ADMIN]}>
                  <ContractorDetails />
                </ProtectedRoute>
              } />
              
              <Route path="tasks" element={
                <ProtectedRoute requiredRoles={[UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER]}>
                  <Tasks />
                </ProtectedRoute>
              } />
              
              <Route path="settings" element={
                <ProtectedRoute requiredRoles={[UserRole.OWNER, UserRole.ADMIN]}>
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;