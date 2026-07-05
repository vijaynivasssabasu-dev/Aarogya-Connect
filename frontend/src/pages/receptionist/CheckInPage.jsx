import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { UserCheck, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckInPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const fetchAppointments = () => {
    api.get(`/appointments/hospital?date=${today}`).then(({ data }) => setAppointments(data.appointments)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCheckIn = async (id) => {
    try {
      await api.patch(`/appointments/${id}/check-in`);
      toast.success('Patient checked in!');
      fetchAppointments();
    } catch (err) {
      toast.error('Check-in failed');
    }
  };

  const filtered = appointments.filter(a =>
    !a.checkedInAt && a.status === 'booked' &&
    (a.patient?.name?.toLowerCase().includes(search.toLowerCase()) || a.patient?.phone?.includes(search))
  );

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <h1 className="page-header">Patient Check-in</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search by name or phone..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={UserCheck} title="No patients waiting" description="All booked patients have been checked in" />
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div key={appt._id} className="card !p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">{appt.patient?.name?.charAt(0)}</div>
              <div className="flex-1">
                <p className="font-semibold">{appt.patient?.name}</p>
                <p className="text-sm text-gray-500">{appt.patient?.phone} • {appt.slotTime} • Dr. {appt.doctor?.name}</p>
              </div>
              <button onClick={() => handleCheckIn(appt._id)} className="btn-primary !py-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Check In
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
