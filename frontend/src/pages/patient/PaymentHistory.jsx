import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { CreditCard } from 'lucide-react';

export default function PaymentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments/my').then(({ data }) => {
      setAppointments(data.appointments.filter(a => a.payment));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <h1 className="page-header">Payment History</h1>
      {appointments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet" description="Your payment history will appear here" />
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Doctor</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.map((appt) => (
                <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{appt.slotDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{appt.doctor?.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{appt.payment?.amount || '-'}</td>
                  <td className="px-6 py-4"><StatusBadge status={appt.payment?.status || 'created'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
