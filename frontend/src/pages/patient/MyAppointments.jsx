import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { Calendar, XCircle, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [activePaymentId, setActivePaymentId] = useState(null);

  const fetchAppointments = () => {
    api.get('/appointments/my').then(({ data }) => setAppointments(data.appointments)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const handlePay = async (appt) => {
    setPaying(true);
    try {
      const { data } = await api.post('/payments/create-order', {
        appointmentId: appt._id,
        amount: 500,
      });

      setActivePaymentId(data.paymentId);

      // Attempt to load Razorpay Checkout (if valid key and not mock mode)
      if (window.Razorpay && data.keyId !== 'rzp_test_mockkey') {
        const options = {
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "MedCare AI",
          description: "Doctor Appointment Payment",
          order_id: data.order.id,
          handler: async function (response) {
            try {
              await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: data.paymentId,
              });
              toast.success("Payment successful!");
              fetchAppointments();
            } catch (err) {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            name: "Ravi Teja",
            email: "ravi@example.com",
            contact: "+919123456789"
          },
          theme: { color: "#338dff" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback to custom UPI QR Code modal (for mock/demo mode)
        const upiLink = `upi://pay?pa=medcare@oksbi&pn=MedCare%20AI&am=500&cu=INR&tn=Appt_${appt._id}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
        setQrCodeUrl(qrUrl);
        setSelectedAppt(appt);
        setShowQRModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create payment order');
    } finally {
      setPaying(false);
    }
  };

  const verifySimulatedPayment = async () => {
    if (!activePaymentId) return;
    setPaying(true);
    try {
      await api.post('/payments/verify', {
        paymentId: activePaymentId,
        razorpay_payment_id: 'pay_simulated_' + Date.now(),
      });
      toast.success('Payment verified successfully!');
      setShowQRModal(false);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to verify payment');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <h1 className="page-header">My Appointments</h1>
      {appointments.length === 0 ? (
        <EmptyState icon={Calendar} title="No appointments yet" description="Book your first appointment to get started" />
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt._id} className="card !p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-600">{new Date(appt.slotDate + 'T00:00').toLocaleDateString('en', { month: 'short' })}</span>
                <span className="text-lg font-bold text-primary-800 leading-none">{new Date(appt.slotDate + 'T00:00').getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{appt.doctor?.name || 'Doctor'}</p>
                <p className="text-sm text-gray-500">{appt.slotTime} • {appt.hospital?.name}, {appt.hospital?.city}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={appt.status} />
                {appt.status === 'pending_payment' && (
                  <button onClick={() => handlePay(appt)} disabled={paying} className="btn-primary !py-2 !px-3 text-sm flex items-center gap-1.5 bg-accent-600 hover:bg-accent-700">
                    <CreditCard className="w-4 h-4" /> Pay Now
                  </button>
                )}
                {['booked', 'pending_payment', 'rescheduled'].includes(appt.status) && (
                  <button onClick={() => handleCancel(appt._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Cancel">
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPI QR Code Payment Modal */}
      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title="UPI QR Code Checkout" size="sm">
        {selectedAppt && (
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
              <Sparkles className="w-4 h-4" /> Scan with GPay, PhonePe, or Paytm
            </div>
            
            <div className="border border-gray-100 p-4 bg-white rounded-2xl shadow-inner">
              <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-900">₹500.00</p>
              <p className="text-xs text-gray-400 mt-1">To: MedCare AI Healthcare Portal</p>
            </div>

            <div className="w-full bg-gray-50 p-3 rounded-xl text-left text-xs text-gray-500 space-y-1">
              <p><strong>Doctor:</strong> {selectedAppt.doctor?.name}</p>
              <p><strong>Slot:</strong> {selectedAppt.slotDate} • {selectedAppt.slotTime}</p>
            </div>

            <button onClick={verifySimulatedPayment} disabled={paying} className="btn-primary w-full flex items-center justify-center gap-2">
              {paying ? 'Verifying...' : 'Verify Payment Status'} <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
