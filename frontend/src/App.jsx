import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import PatientList from './pages/patients/PatientList';
import PatientForm from './pages/patients/PatientForm';
import PatientProfile from './pages/patients/PatientProfile';
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentForm from './pages/appointments/AppointmentForm';
import MedicalRecordForm from './pages/medical-records/MedicalRecordForm';
import BillingDashboard from './pages/billing/BillingDashboard';
import InvoiceGenerator from './pages/billing/InvoiceGenerator';
import PaymentProcessor from './pages/billing/PaymentProcessor';
import InsuranceClaims from './pages/billing/InsuranceClaims';
import NotificationSettings from './pages/notifications/NotificationSettings';

const Unauthorized = () => (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
        <h1>Unauthorized</h1>
        <p>You do not have permission to view this page.</p>
    </div>
);

const HomeRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    switch (user.role) {
        case 'admin': return <Navigate to="/admin" replace />;
        case 'doctor': return <Navigate to="/doctor" replace />;
        case 'patient': return <Navigate to="/patient" replace />;
        default: return <Navigate to="/login" replace />;
    }
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/patients" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}>
                            <PatientList />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/patients/new" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                            <PatientForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/patients/:id" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor', 'nurse']}>
                            <PatientProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/patients/:id/edit" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                            <PatientForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/patients/:id/medical-records/new" element={
                        <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                            <MedicalRecordForm />
                        </ProtectedRoute>
                    } />
                    
                    {/* Appointments */}
                    <Route path="/admin/appointments" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}>
                            <AppointmentList />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/appointments/new" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist', 'patient']}>
                            <AppointmentForm />
                        </ProtectedRoute>
                    } />

                    {/* Billing & Payments */}
                    <Route path="/admin/billing" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                            <BillingDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/billing/new-invoice" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                            <InvoiceGenerator />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/billing/invoice/:id" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist', 'patient']}>
                            <InvoiceGenerator />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/billing/process/:id" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                            <PaymentProcessor />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/billing/insurance" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                            <InsuranceClaims />
                        </ProtectedRoute>
                    } />
                    
                    {/* Settings / Notifications */}
                    <Route path="/admin/notifications/settings" element={
                        <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor', 'nurse', 'patient']}>
                            <NotificationSettings />
                        </ProtectedRoute>
                    } />

                    {/* Doctor */}
                    <Route path="/doctor" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    {/* Patient */}
                    <Route path="/patient" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    {/* Root */}
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            </Router>
        </AuthProvider>
    );
}

export default App;
