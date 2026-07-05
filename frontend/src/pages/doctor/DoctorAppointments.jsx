import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Calendar, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  const fetchAppointments = () => {
    const params = dateFilter ? `?date=${dateFilter}` : '';
    api.get(`/appointments/doctor${params}`).then(({ data }) => setAppointments(data.appointments)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, [dateFilter]);

  const markComplete = async (id) => {
    try {
      await api.patch(`/appointments/${id}/complete`);
      toast.success('Marked as completed');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input-field w-auto" />
      </div>
      {appointments.length === 0 ? (
        <EmptyState icon={Calendar} title="No appointments found" />
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt._id} className="card !p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-teal-600">{appt.slotTime}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{appt.patient?.name}</p>
                <p className="text-sm text-gray-500">{appt.slotDate} • {appt.patient?.phone}</p>
              </div>
              <StatusBadge status={appt.status} />
              {appt.status === 'booked' && (
                <button onClick={() => markComplete(appt._id)} className="btn-primary !py-2 !px-3 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Complete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
