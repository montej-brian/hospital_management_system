import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Placeholder Dashboard Components
const AdminDashboard = () => <div className="p-8"><h1>Admin Dashboard</h1><p>Welcome, Admin!</p></div>;
const DoctorDashboard = () => <div className="p-8"><h1>Doctor Dashboard</h1><p>Welcome, Doctor!</p></div>;
const PatientDashboard = () => <div className="p-8"><h1>Patient Dashboard</h1><p>Welcome, Patient!</p></div>;
const Unauthorized = () => <div className="p-8 text-red-600"><h1>Unauthorized</h1><p>You do not have permission to view this page.</p></div>;

// Helper to redirect "/" to the correct dashboard
const HomeRedirect = () => {
    const { user, loading } = useAuth();
    
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    
    switch (user.role) {
        case 'admin': return <Navigate to="/admin" replace />;
        case 'doctor': return <Navigate to="/doctor" replace />;
        case 'patient': return <Navigate to="/patient" replace />;
        default: return <Navigate to="/unauthorized" replace />;
    }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Role-Based Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/*" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/*" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Root Redirect based on role */}
          <Route path="/" element={<HomeRedirect />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
