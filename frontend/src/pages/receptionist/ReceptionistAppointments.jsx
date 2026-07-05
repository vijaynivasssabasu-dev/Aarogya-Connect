import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { Calendar, FileUp, ClipboardList, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  
  // Report Upload States
  const [uploadTarget, setUploadTarget] = useState(null);
  const [reportType, setReportType] = useState('Scan');
  const [testName, setTestName] = useState('');
  const [findings, setFindings] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAppointments = () => {
    const params = dateFilter ? `?date=${dateFilter}` : '';
    api.get(`/appointments/hospital${params}`).then(({ data }) => setAppointments(data.appointments)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [dateFilter]);

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!testName.trim() || !findings.trim()) {
      return toast.error('Please enter the report title and clinical findings');
    }
    
    setSaving(true);
    try {
      await api.post('/medical-records', {
        patient: uploadTarget.patient._id || uploadTarget.patient,
        appointment: uploadTarget._id,
        doctor: uploadTarget.doctor._id || uploadTarget.doctor,
        diagnosis: testName,
        notes: findings,
        uploadedBy: 'receptionist',
        reportType: reportType
      });
      toast.success('Diagnostic report uploaded successfully!');
      setUploadTarget(null);
      setTestName('');
      setFindings('');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to save clinical report');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Appointments</h1>
          <p className="text-xs text-gray-500">View bookings and upload scanning/lab reports for completed visits.</p>
        </div>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input-field w-auto" />
      </div>
      
      {appointments.length === 0 ? <EmptyState icon={Calendar} title="No appointments found" /> : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Patient</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Doctor</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Time</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Checked In</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.map(a => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{a.patient?.name}</p>
                    <p className="text-[10px] text-gray-400">{a.patient?.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">Dr. {a.doctor?.name}</td>
                  <td className="px-6 py-4 text-sm">{a.slotDate}</td>
                  <td className="px-6 py-4 text-sm">{a.slotTime}</td>
                  <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                  <td className="px-6 py-4 text-sm">{a.checkedInAt ? '✅ Checked In' : '—'}</td>
                  <td className="px-6 py-4">
                    {a.status === 'completed' || a.checkedInAt ? (
                      <button 
                        onClick={() => setUploadTarget(a)}
                        className="flex items-center gap-1 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FileUp className="w-3.5 h-3.5" /> Upload Report
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Awaiting Check-in</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Upload Dialog Modal */}
      <Modal 
        isOpen={!!uploadTarget} 
        onClose={() => setUploadTarget(null)} 
        title={`Upload Diagnostic Report — ${uploadTarget?.patient?.name}`}
        size="md"
      >
        {uploadTarget && (
          <form onSubmit={handleUploadReport} className="space-y-4">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex gap-2">
              <ClipboardList className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-800">Visit Summary</p>
                <p className="text-xxs text-gray-400">Dr. {uploadTarget.doctor?.name} • {uploadTarget.slotDate} @ {uploadTarget.slotTime}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Report Classification</label>
              <div className="grid grid-cols-2 gap-2">
                {['Scan', 'Lab Test'].map(type => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setReportType(type)}
                    className={`py-2 px-3 text-sm font-semibold rounded-xl border transition-all ${
                      reportType === type ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {type === 'Scan' ? '🎥 Radiology Scan' : '🧪 Laboratory Test'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Report Title / Test Name</label>
              <input 
                type="text" 
                value={testName}
                onChange={e => setTestName(e.target.value)}
                placeholder="e.g. MRI Brain, Chest X-Ray, Blood Glucose Profiling"
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Clinical Findings & Summary</label>
              <textarea 
                value={findings}
                onChange={e => setFindings(e.target.value)}
                placeholder="Describe scan observations, reference ranges, or specific pathological findings..."
                rows={4}
                className="input-field text-sm"
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setUploadTarget(null)}
                className="btn-secondary text-xs px-4 py-2"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary text-xs px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 flex items-center gap-1"
                disabled={saving}
              >
                <CheckCircle className="w-3.5 h-3.5" /> {saving ? 'Uploading...' : 'Save Diagnostic Report'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
