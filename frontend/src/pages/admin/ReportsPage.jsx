import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FileBarChart, IndianRupee, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ReportsPage() {
  const [appointmentData, setAppointmentData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/reports/appointments'), api.get('/reports/revenue')])
      .then(([aRes, rRes]) => { setAppointmentData(aRes.data); setRevenueData(rRes.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-8">
      <h1 className="page-header">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center"><IndianRupee className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-xl font-bold">₹{(revenueData?.totalRevenue || 0).toLocaleString()}</p><p className="text-xs text-gray-500">Total Revenue</p></div>
        </div>
        <div className="stat-card">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center"><Calendar className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-xl font-bold">{revenueData?.totalPayments || 0}</p><p className="text-xs text-gray-500">Total Payments</p></div>
        </div>
        <div className="stat-card">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center"><FileBarChart className="w-5 h-5 text-purple-600" /></div>
          <div><p className="text-xl font-bold">{appointmentData?.byDoctor?.length || 0}</p><p className="text-xs text-gray-500">Active Doctors</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Appointments by Status</h2>
          {appointmentData?.byStatus?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appointmentData.byStatus.map(s => ({ name: s._id, count: s.count }))}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis /><Tooltip />
                <Bar dataKey="count" fill="#338dff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm">No data</p>}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          {revenueData?.byMonth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData.byMonth.map(m => ({ month: m._id, revenue: m.total }))}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#1aae62" strokeWidth={2} dot={{ fill: '#1aae62' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm">No data</p>}
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Top Doctors by Appointments</h2>
          {appointmentData?.byDoctor?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appointmentData.byDoctor.map(d => ({ name: d.doctorName || 'Unknown', count: d.count }))} layout="vertical">
                <XAxis type="number" /><YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={150} /><Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm">No data</p>}
        </div>
      </div>
    </div>
  );
}
