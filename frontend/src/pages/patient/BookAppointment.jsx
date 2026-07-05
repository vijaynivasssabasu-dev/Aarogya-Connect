import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Search, Stethoscope, Building2, Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];

export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/appointments/categories').then(({ data }) => setCategories(data.categories)).finally(() => setLoading(false));
  }, []);

  const loadDoctors = async (categoryId) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    try {
      const { data } = await api.get(`/appointments/available-doctors?categoryId=${categoryId}`);
      setDoctors(data.doctors);
      setStep(2);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(3);
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return toast.error('Please select date and time');
    setBooking(true);
    try {
      const { data } = await api.post('/appointments/book', {
        doctorId: selectedDoctor._id,
        hospitalId: selectedDoctor.hospital._id,
        slotDate: selectedDate,
        slotTime: selectedTime,
      });
      toast.success('Appointment booked! Proceed to payment.');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  const getFilteredTimeSlots = () => {
    if (selectedDate !== minDate) return TIME_SLOTS;
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    return TIME_SLOTS.filter(slot => {
      const [slotHours, slotMinutes] = slot.split(':').map(Number);
      if (slotHours > currentHours) return true;
      if (slotHours === currentHours && slotMinutes > currentMinutes) return true;
      return false;
    });
  };

  const filteredSlots = getFilteredTimeSlots();

  if (loading && step === 1) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="page-header">Book an Appointment</h1>

      <div className="flex items-center gap-2 mb-8">
        {['Category', 'Doctor', 'Date & Time'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step > i + 1 ? 'bg-accent-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{i + 1}</div>
            <span className={`text-sm font-medium hidden sm:inline ${step >= i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button key={cat._id} onClick={() => loadDoctors(cat._id)} className="card !p-4 text-center hover:border-primary-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
                <Stethoscope className="w-6 h-6 text-primary-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">{cat.categoryName}</p>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <button onClick={() => setStep(1)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">← Back to categories</button>
          {loading ? <LoadingSpinner /> : doctors.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">No available doctors in this category</div>
          ) : (
            <div className="grid gap-4">
              {doctors.map((doc) => (
                <button key={doc._id} onClick={() => selectDoctor(doc)} className="card !p-4 flex items-center gap-4 text-left hover:border-primary-300 hover:shadow-md transition-all">
                  <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-teal-600">{doc.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.category?.categoryName}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Building2 className="w-3 h-3" />
                      {doc.hospital?.name}, {doc.hospital?.city}
                    </div>
                  </div>
                  <span className="badge-success">Available</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <button onClick={() => setStep(2)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">← Back to doctors</button>
          
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-teal-600">{selectedDoctor.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold">{selectedDoctor.name}</p>
                <p className="text-sm text-gray-500">{selectedDoctor.hospital?.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Date</label>
                <input type="date" min={minDate} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot</label>
                {filteredSlots.length === 0 ? (
                  <p className="text-sm text-red-500 py-2">No remaining time slots for today. Please select a future date.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {filteredSlots.map((time) => (
                      <button key={time} onClick={() => setSelectedTime(time)} className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        selectedTime === time ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleBook} disabled={booking || !selectedDate || !selectedTime} className="btn-primary w-full mt-4">
                {booking ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
