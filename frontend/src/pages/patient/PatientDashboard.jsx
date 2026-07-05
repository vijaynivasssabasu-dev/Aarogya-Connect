import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, Clock, FolderHeart, Bot, ArrowRight, ShieldAlert, Heart, Clipboard, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [reminders, setReminders] = useState([
    { id: 1, name: 'Cetirizine 10mg', time: '09:00 PM', taken: false, note: 'For Allergies' },
    { id: 2, name: 'Fluticasone Spray', time: '08:00 AM', taken: false, note: 'Morning' },
    { id: 3, name: 'Amlodipine 5mg', time: '09:00 AM', taken: false, note: 'Blood Pressure' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/my'),
      api.get('/medical-records/my')
    ]).then(([apptRes, recRes]) => {
      setAppointments(apptRes.data.appointments);
      setRecords(recRes.data.records || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleReminder = (id) => {
    setReminders(reminders.map(r => {
      if (r.id === id) {
        const nextState = !r.taken;
        if (nextState) toast.success(`${r.name} marked as taken!`);
        return { ...r, taken: nextState };
      }
      return r;
    }));
  };

  const upcoming = appointments.filter(a => ['booked', 'rescheduled'].includes(a.status)).slice(0, 3);
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => ['booked', 'rescheduled'].includes(a.status)).length,
    completed: appointments.filter(a => a.status === 'completed').length
  };

  // Find any active follow-up reminders
  const activeFollowUps = records.filter(r => r.followUpDate && new Date(r.followUpDate) > new Date());

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 lg:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-primary-200">Manage your appointments, health parameters, and records in one place.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/patient/book" className="px-5 py-2.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-sm text-sm">
            Book Appointment
          </Link>
        </div>
      </div>

      {/* Follow-up Alerts */}
      {activeFollowUps.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Upcoming Follow-up Reminders</h3>
            {activeFollowUps.map(f => (
              <p key={f._id} className="text-sm text-amber-700 mt-1">
                📅 Follow-up scheduled for **{f.diagnosis}** on **{new Date(f.followUpDate).toLocaleDateString()}** (Dr. {f.doctor?.name}).
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Stats Counter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Appointments', value: stats.total, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
          { label: 'Upcoming Visits', value: stats.upcoming, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Completed Appointments', value: stats.completed, icon: FolderHeart, color: 'bg-green-50 text-green-600' }
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Layout Grid: Emergency Card / Reminders / Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Appointments & Reminders */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No upcoming appointments. <Link to="/patient/book" className="text-primary-600 font-medium">Book one now</Link></p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <div key={appt._id} className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-primary-600">{new Date(appt.slotDate + 'T00:00').toLocaleDateString('en', { month: 'short' })}</span>
                      <span className="text-lg font-bold text-primary-800 leading-none">{new Date(appt.slotDate + 'T00:00').getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{appt.doctor?.name || 'Doctor'}</p>
                      <p className="text-sm text-gray-500">{appt.slotTime} • {appt.hospital?.name}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medicine Reminders Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Medicine Reminders
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full">Today's Schedule</span>
            </div>
            <div className="space-y-3">
              {reminders.map(r => (
                <div key={r.id} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${r.taken ? 'bg-green-50/50 border-green-100 opacity-70' : 'bg-gray-50/50 border-gray-100'}`}>
                  <div>
                    <p className={`font-semibold text-sm ${r.taken ? 'line-through text-gray-400' : 'text-gray-900'}`}>{r.name}</p>
                    <p className="text-xs text-gray-500">{r.time} • {r.note}</p>
                  </div>
                  <button onClick={() => toggleReminder(r.id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${r.taken ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
                    {r.taken ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                    {r.taken ? 'Taken' : 'Mark Taken'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Emergency Card & Profile Summary */}
        <div className="space-y-6">
          
          {/* Emergency Health Card */}
          <div className="card border-2 border-red-200 relative overflow-hidden bg-gradient-to-br from-red-50/30 to-white">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-8 -mt-8" />
            <div className="flex items-center gap-2 text-red-700 font-bold mb-4 uppercase tracking-wider text-xs">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" /> Emergency Health Card
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Patient Name</p>
                  <p className="font-bold text-gray-900 text-base">{user?.name}</p>
                </div>
                <div className="bg-red-600 text-white font-extrabold w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm">
                  {user?.bloodGroup || 'O+'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Allergies</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(user?.allergies && user.allergies.length > 0) ? user.allergies.map(a => (
                      <span key={a} className="text-xxs px-2 py-0.5 bg-red-100 text-red-800 rounded font-semibold">{a}</span>
                    )) : (
                      <span className="text-xs text-gray-500 italic">None reported</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Chronic Illnesses</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(user?.chronicConditions && user.chronicConditions.length > 0) ? user.chronicConditions.map(c => (
                      <span key={c} className="text-xxs px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-semibold">{c}</span>
                    )) : (
                      <span className="text-xs text-gray-500 italic">None</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">Emergency Contact</p>
                <p className="font-semibold text-sm mt-0.5 text-gray-800">
                  {user?.emergencyContact?.name || 'Anil Teja'} ({user?.emergencyContact?.relation || 'Brother'})
                </p>
                <p className="text-xs text-primary-600 font-bold mt-0.5">
                  {user?.emergencyContact?.phone || '+91 99887 76655'}
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <div className="border border-gray-100 p-2.5 bg-white rounded-xl shadow-inner flex flex-col items-center">
                  {/* Generated QR Code Mockup */}
                  <div className="grid grid-cols-5 gap-0.5 w-24 h-24 bg-gray-100 p-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`w-full h-full ${i % 3 === 0 || i % 7 === 0 || i === 0 || i === 4 || i === 20 || i === 24 ? 'bg-gray-900' : 'bg-white'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wide">Emergency Scan QR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-1.5"><Clipboard className="w-4 h-4" /> Lifetime Record Summary</h3>
            <p className="text-xs text-gray-500 mb-4">You have connected records across multiple clinics and hospitals. The hospitals can automatically fetch your emergency profiles.</p>
            <div className="space-y-2">
              <Link to="/patient/records" className="w-full text-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors block text-xs">
                Manage Lifetime Records
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
