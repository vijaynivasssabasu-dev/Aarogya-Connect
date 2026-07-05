import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MedicalRecords from './pages/patient/MedicalRecords';
import EmergencyCard from './pages/patient/EmergencyCard';
import MedicineReminders from './pages/patient/MedicineReminders';
import PaymentHistory from './pages/patient/PaymentHistory';
import HealthAssistant from './pages/patient/HealthAssistant';
import InsuranceModule from './pages/patient/InsuranceModule';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorRecords from './pages/doctor/DoctorRecords';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import CheckInPage from './pages/receptionist/CheckInPage';
import ReceptionistAppointments from './pages/receptionist/ReceptionistAppointments';
import AdminDashboard from './pages/admin/AdminDashboard';
import HospitalManagement from './pages/admin/HospitalManagement';
import DoctorManagement from './pages/admin/DoctorManagement';
import UserManagement from './pages/admin/UserManagement';
import ReportsPage from './pages/admin/ReportsPage';

function LayoutRoute({ children, allowedRoles }) {
  return <ProtectedRoute allowedRoles={allowedRoles}><Layout>{children}</Layout></ProtectedRoute>;
}

export default function App() {
  return (
    <BrowserRouter><AuthProvider>
      <Toaster position="top-right" toastOptions={{ className: 'toast-custom', duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/patient" element={<LayoutRoute allowedRoles={['patient']}><PatientDashboard /></LayoutRoute>} />
        <Route path="/patient/book" element={<LayoutRoute allowedRoles={['patient']}><BookAppointment /></LayoutRoute>} />
        <Route path="/patient/appointments" element={<LayoutRoute allowedRoles={['patient']}><MyAppointments /></LayoutRoute>} />
        <Route path="/patient/records" element={<LayoutRoute allowedRoles={['patient']}><MedicalRecords /></LayoutRoute>} />
        <Route path="/patient/emergency" element={<LayoutRoute allowedRoles={['patient']}><EmergencyCard /></LayoutRoute>} />
        <Route path="/patient/reminders" element={<LayoutRoute allowedRoles={['patient']}><MedicineReminders /></LayoutRoute>} />
        <Route path="/patient/insurance" element={<LayoutRoute allowedRoles={['patient']}><InsuranceModule /></LayoutRoute>} />
        <Route path="/patient/assistant" element={<LayoutRoute allowedRoles={['patient']}><HealthAssistant /></LayoutRoute>} />
        <Route path="/doctor" element={<LayoutRoute allowedRoles={['doctor']}><DoctorDashboard /></LayoutRoute>} />
        <Route path="/doctor/appointments" element={<LayoutRoute allowedRoles={['doctor']}><DoctorAppointments /></LayoutRoute>} />
        <Route path="/doctor/records" element={<LayoutRoute allowedRoles={['doctor']}><DoctorRecords /></LayoutRoute>} />
        <Route path="/receptionist" element={<LayoutRoute allowedRoles={['receptionist']}><ReceptionistDashboard /></LayoutRoute>} />
        <Route path="/receptionist/checkin" element={<LayoutRoute allowedRoles={['receptionist']}><CheckInPage /></LayoutRoute>} />
        <Route path="/receptionist/appointments" element={<LayoutRoute allowedRoles={['receptionist']}><ReceptionistAppointments /></LayoutRoute>} />
        <Route path="/admin" element={<LayoutRoute allowedRoles={['admin']}><AdminDashboard /></LayoutRoute>} />
        <Route path="/admin/hospitals" element={<LayoutRoute allowedRoles={['admin']}><HospitalManagement /></LayoutRoute>} />
        <Route path="/admin/doctors" element={<LayoutRoute allowedRoles={['admin']}><DoctorManagement /></LayoutRoute>} />
        <Route path="/admin/users" element={<LayoutRoute allowedRoles={['admin']}><UserManagement /></LayoutRoute>} />
        <Route path="/admin/reports" element={<LayoutRoute allowedRoles={['admin']}><ReportsPage /></LayoutRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider></BrowserRouter>
  );
}
