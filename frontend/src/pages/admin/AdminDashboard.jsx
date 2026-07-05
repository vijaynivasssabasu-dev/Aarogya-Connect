import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { Users, Stethoscope, Calendar, IndianRupee } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#338dff', '#1aae62', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!stats) return <p className="text-gray-500">Failed to load dashboard</p>;

  const statusData = Object.entries(stats.statusCounts || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-slate-300">Welcome back, {user?.name}. Here's your platform overview.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Patients', value: stats.counts.patients, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Doctors', value: stats.counts.doctors, icon: Stethoscope, color: 'bg-teal-50 text-teal-600' },
          { label: 'Appointments', value: stats.counts.appointments, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
          { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'bg-green-50 text-green-600' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Appointment Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm">No data yet</p>}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
          <div className="space-y-3">
            {(stats.recentAppointments || []).slice(0, 5).map(appt => (
              <div key={appt._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm font-medium">{appt.patient?.name} → Dr. {appt.doctor?.name}</p>
                  <p className="text-xs text-gray-500">{appt.slotDate} {appt.slotTime}</p>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
