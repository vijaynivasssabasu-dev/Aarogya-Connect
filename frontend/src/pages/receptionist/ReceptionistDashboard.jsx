import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, UserCheck, Clock, ArrowRight } from 'lucide-react';

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get(`/appointments/hospital?date=${today}`).then(({ data }) => setAppointments(data.appointments)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const waitingCheckin = appointments.filter(a => a.status === 'booked' && !a.checkedInAt);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Hello, {user?.name}! 👋</h1>
        <p className="text-purple-200">{waitingCheckin.length} patient{waitingCheckin.length !== 1 ? 's' : ''} waiting to check in today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Today', value: appointments.length, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
          { label: 'Waiting Check-in', value: waitingCheckin.length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Checked In', value: appointments.filter(a => a.checkedInAt).length, icon: UserCheck, color: 'bg-green-50 text-green-600' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-6 h-6" /></div>
            <div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Waiting for Check-in</h2>
          <Link to="/receptionist/checkin" className="text-sm text-primary-600 font-medium flex items-center gap-1">Manage <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {waitingCheckin.length === 0 ? <p className="text-gray-500 text-sm py-4">All patients checked in!</p> : (
          <div className="space-y-3">
            {waitingCheckin.slice(0, 5).map(appt => (
              <div key={appt._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-semibold text-purple-700">{appt.patient?.name?.charAt(0)}</div>
                <div className="flex-1"><p className="font-medium">{appt.patient?.name}</p><p className="text-sm text-gray-500">{appt.slotTime} • Dr. {appt.doctor?.name}</p></div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
