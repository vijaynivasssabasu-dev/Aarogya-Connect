import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { FolderHeart, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    patient: '', appointment: '', diagnosis: '', symptoms: '', notes: '',
    prescription: [{ medicine: '', dosage: '', duration: '', notes: '' }],
    vitalSigns: { bloodPressure: '', heartRate: '', temperature: '', weight: '', oxygenSaturation: '' },
  });

  const fetchRecords = () => {
    api.get('/medical-records/doctor').then(({ data }) => setRecords(data.records)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecords(); }, []);

  const openCreateModal = async () => {
    try {
      const { data } = await api.get('/appointments/doctor?status=completed');
      setAppointments(data.appointments);
      setShowCreate(true);
    } catch (err) {
      toast.error('Failed to load appointments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean),
      };
      await api.post('/medical-records', payload);
      toast.success('Record created');
      setShowCreate(false);
      setForm({ patient: '', appointment: '', diagnosis: '', symptoms: '', notes: '', prescription: [{ medicine: '', dosage: '', duration: '', notes: '' }], vitalSigns: { bloodPressure: '', heartRate: '', temperature: '', weight: '', oxygenSaturation: '' } });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create record');
    }
  };

  const addPrescriptionRow = () => {
    setForm({ ...form, prescription: [...form.prescription, { medicine: '', dosage: '', duration: '', notes: '' }] });
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Medical Records</h1>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Create Record</button>
      </div>

      {records.length === 0 ? (
        <EmptyState icon={FolderHeart} title="No records created yet" />
      ) : (
        <div className="grid gap-4">
          {records.map(rec => (
            <div key={rec._id} className="card !p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{rec.diagnosis}</p>
                  <p className="text-sm text-gray-500">Patient: {rec.patient?.name} • {new Date(rec.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {rec.prescription?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {rec.prescription.map((p, i) => <span key={i} className="badge-info">{p.medicine}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Medical Record" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Appointment *</label>
              <select value={form.appointment} onChange={(e) => {
                const appt = appointments.find(a => a._id === e.target.value);
                setForm({ ...form, appointment: e.target.value, patient: appt?.patient?._id || '' });
              }} className="input-field" required>
                <option value="">Choose...</option>
                {appointments.map(a => <option key={a._id} value={a._id}>{a.patient?.name} - {a.slotDate} {a.slotTime}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
              <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (comma separated)</label>
            <input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="input-field" placeholder="Fever, Headache, Cough" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vital Signs</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.keys(form.vitalSigns).map(key => (
                <input key={key} value={form.vitalSigns[key]} onChange={(e) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, [key]: e.target.value } })} className="input-field text-sm" placeholder={key.replace(/([A-Z])/g, ' $1').trim()} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Prescription</label>
              <button type="button" onClick={addPrescriptionRow} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add medicine</button>
            </div>
            {form.prescription.map((p, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input value={p.medicine} onChange={(e) => { const pres = [...form.prescription]; pres[i].medicine = e.target.value; setForm({ ...form, prescription: pres }); }} className="input-field text-sm" placeholder="Medicine" />
                <input value={p.dosage} onChange={(e) => { const pres = [...form.prescription]; pres[i].dosage = e.target.value; setForm({ ...form, prescription: pres }); }} className="input-field text-sm" placeholder="Dosage" />
                <input value={p.duration} onChange={(e) => { const pres = [...form.prescription]; pres[i].duration = e.target.value; setForm({ ...form, prescription: pres }); }} className="input-field text-sm" placeholder="Duration" />
                <input value={p.notes} onChange={(e) => { const pres = [...form.prescription]; pres[i].notes = e.target.value; setForm({ ...form, prescription: pres }); }} className="input-field text-sm" placeholder="Notes" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" rows={3} />
          </div>
          <button type="submit" className="btn-primary w-full">Create Record</button>
        </form>
      </Modal>
    </div>
  );
}
