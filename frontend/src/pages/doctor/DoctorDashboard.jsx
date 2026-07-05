import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get('/appointments/doctor').then(({ data }) => setAppointments(data.appointments)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const todaysAppts = appointments.filter(a => a.slotDate === today);
  const stats = {
    today: todaysAppts.length,
    upcoming: appointments.filter(a => a.slotDate >= today && ['booked', 'rescheduled'].includes(a.status)).length,
    completed: appointments.filter(a => a.status === 'completed').length,
    total: appointments.length,
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-6 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Good day, Dr. {user?.name?.split(' ').pop()}! 🩺</h1>
        <p className="text-teal-200">You have {stats.today} appointment{stats.today !== 1 ? 's' : ''} today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's", value: stats.today, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
          { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
          { label: 'Total', value: stats.total, icon: Users, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>
        {todaysAppts.length === 0 ? <p className="text-gray-500 text-sm py-4">No appointments today</p> : (
          <div className="space-y-3">
            {todaysAppts.map(appt => (
              <div key={appt._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center font-semibold text-teal-700">
                  {appt.patient?.name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{appt.patient?.name}</p>
                  <p className="text-sm text-gray-500">{appt.slotTime}</p>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
