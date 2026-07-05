import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Calendar, Users, Building2, FolderHeart, CreditCard, Bot, Bell, FileBarChart, ClipboardList, LogOut, Menu, X, Stethoscope, UserCheck, Heart } from 'lucide-react';

const NAV_ITEMS = {
  patient: [
    { to: '/patient', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patient/book', icon: Calendar, label: 'Book Appointment' },
    { to: '/patient/appointments', icon: ClipboardList, label: 'My Appointments' },
    { to: '/patient/records', icon: FolderHeart, label: 'Medical Records' },
    { to: '/patient/emergency', icon: Heart, label: 'Emergency Card' },
    { to: '/patient/reminders', icon: Bell, label: 'Medicine Reminders' },
    { to: '/patient/insurance', icon: CreditCard, label: 'Insurance & Claims' },
    { to: '/patient/assistant', icon: Bot, label: 'Health Assistant' },
  ],
  doctor: [
    { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/doctor/records', icon: FolderHeart, label: 'Medical Records' },
  ],
  receptionist: [
    { to: '/receptionist', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/receptionist/checkin', icon: UserCheck, label: 'Check-in' },
    { to: '/receptionist/appointments', icon: Calendar, label: 'Appointments' },
  ],
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/hospitals', icon: Building2, label: 'Hospitals' },
    { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/reports', icon: FileBarChart, label: 'Reports' },
  ],
};
const ROLE_COLORS = { patient: 'from-primary-600 to-primary-800', doctor: 'from-teal-600 to-teal-800', receptionist: 'from-purple-600 to-purple-800', admin: 'from-slate-700 to-slate-900' };
const ROLE_LABELS = { patient: 'Patient Portal', doctor: 'Doctor Portal', receptionist: 'Reception Desk', admin: 'Admin Dashboard' };

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const items = NAV_ITEMS[role] || [];
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`h-full flex flex-col bg-gradient-to-b ${ROLE_COLORS[role] || ROLE_COLORS.patient} text-white`}>
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"><Heart className="w-6 h-6" /></div>
            <div><h1 className="font-bold text-lg leading-tight">MedCare AI</h1><p className="text-xs text-white/70">{ROLE_LABELS[role]}</p></div>
            <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {items.map((item) => { const Icon = item.icon; const isActive = location.pathname === item.to; return (
              <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />{item.label}
              </Link>
            ); })}
          </nav>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold text-sm">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user?.name || 'User'}</p><p className="text-xs text-white/60 truncate">{user?.email || user?.phone}</p></div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"><LogOut className="w-4 h-4" />Sign Out</button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div className="flex-1" />
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"><Bell className="w-5 h-5 text-gray-500" /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
