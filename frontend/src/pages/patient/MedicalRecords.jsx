import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { FolderHeart, FileText, Pill, Activity, Calendar, Sparkles, Building, ChevronRight, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'disease'
  const [aiSummary, setAiSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({});

  useEffect(() => {
    api.get('/medical-records/my').then(({ data }) => setRecords(data.records)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const generateAISummary = async () => {
    setGeneratingSummary(true);
    setSummaryOpen(true);
    try {
      const { data } = await api.get('/medical-records/ai-summary');
      setAiSummary(data.summary);
    } catch {
      toast.error('Failed to generate AI health summary');
      setSummaryOpen(false);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const toggleAccordion = (disease) => {
    setOpenAccordions(prev => ({
      ...prev,
      [disease]: !prev[disease]
    }));
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  // Group records by diagnosis/disease
  const getDiseaseGroupedRecords = () => {
    const groups = {};
    records.forEach(rec => {
      const key = rec.diagnosis;
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    });
    return groups;
  };

  const diseaseGroups = getDiseaseGroupedRecords();

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header !mb-1">Lifetime Patient Records</h1>
          <p className="text-sm text-gray-500">Access your complete health records integrated across all partner hospitals.</p>
        </div>
        
        {records.length > 0 && (
          <button 
            onClick={generateAISummary}
            className="btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md active:scale-[0.98] py-2.5 px-4 rounded-xl text-sm"
          >
            <Sparkles className="w-4 h-4" /> Generate AI Summary
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <EmptyState icon={FolderHeart} title="No medical records" description="Your hospital will create records and upload scan reports after appointments." />
      ) : (
        <div className="space-y-6">
          {/* Toggles for Timeline View vs Disease-wise Grouping */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Chronological Timeline
            </button>
            <button 
              onClick={() => setViewMode('disease')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'disease' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Organize by Disease
            </button>
          </div>

          {/* Render content based on selected view mode */}
          {viewMode === 'timeline' ? (
            <div className="relative pl-4 space-y-6 border-l-2 border-primary-100 ml-4 py-2">
              {records.map((rec) => {
                const dateObj = new Date(rec.createdAt);
                const month = dateObj.toLocaleString('en', { month: 'short' });
                const day = dateObj.getDate();
                const year = dateObj.getFullYear();
                
                return (
                  <div key={rec._id} className="relative pl-8 group">
                    {/* Time Marker Dot with Heartbeat Animation Effect */}
                    <div className="absolute -left-[41px] top-3 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-primary-500 shadow-sm flex items-center justify-center font-bold text-[10px] text-primary-700">
                        {day}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelected(rec)} 
                      className="card w-full text-left !p-5 hover:border-primary-300 hover:shadow-lg hover:scale-[1.005] transition-all flex flex-col sm:flex-row sm:items-start gap-4 border border-gray-100"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        rec.reportType === 'Scan' ? 'bg-purple-50 text-purple-600' : rec.reportType === 'Lab Test' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'
                      }`}>
                        <FileText className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                          <h3 className="font-bold text-gray-950 text-base">{rec.diagnosis}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.reportType === 'Scan' ? 'bg-purple-100 text-purple-800' : rec.reportType === 'Lab Test' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                          }`}>
                            {rec.reportType || 'Prescription'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-gray-400" /> {rec.appointment?.hospital?.name || 'Partner Health Center'}</span>
                          <span className="text-gray-300">•</span>
                          <span className="font-medium">{rec.uploadedBy === 'receptionist' ? 'Uploaded by Receptionist' : `Dr. ${rec.doctor?.name}`}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400">{month} {day}, {year}</span>
                        </div>

                        {rec.notes && (
                          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600 italic">
                            "{rec.notes}"
                          </div>
                        )}

                        {rec.prescription?.length > 0 && (
                          <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-teal-600 bg-teal-50/50 w-fit px-2.5 py-1 rounded-lg">
                            <Pill className="w-3.5 h-3.5" />
                            <span>{rec.prescription.length} medicines prescribed</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="sm:self-center flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(diseaseGroups).map(([disease, groupRecords]) => {
                const isOpen = openAccordions[disease];
                const lastVisited = new Date(groupRecords[0].createdAt).toLocaleDateString();
                const totalVisits = groupRecords.length;

                return (
                  <div key={disease} className="card !p-0 border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Accordion Header */}
                    <button 
                      onClick={() => toggleAccordion(disease)}
                      className="w-full flex items-center justify-between p-5 bg-gray-50 text-left hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                          <Layers className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{disease}</h3>
                          <p className="text-xs text-gray-500">
                            Last visit: {lastVisited} • Total records: {totalVisits}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-90 text-primary-600' : ''}`} />
                    </button>

                    {/* Accordion Contents */}
                    {isOpen && (
                      <div className="p-5 divide-y divide-gray-100 bg-white">
                        {groupRecords.map(rec => (
                          <div key={rec._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  rec.reportType === 'Scan' ? 'bg-purple-100 text-purple-800' : rec.reportType === 'Lab Test' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {rec.reportType || 'Prescription'}
                                </span>
                                <span className="text-xs text-gray-400 font-semibold">{new Date(rec.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-800 mt-1">
                                {rec.uploadedBy === 'receptionist' ? 'Diagnostic Scanning Report' : `Prescribed by Dr. ${rec.doctor?.name}`}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <Building className="w-3.5 h-3.5 text-gray-400" />
                                <span>{rec.appointment?.hospital?.name || 'Clinic Office'}</span>
                              </p>
                            </div>
                            
                            <button 
                              onClick={() => setSelected(rec)}
                              className="px-4 py-1.5 text-xs font-bold text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-xl transition-colors sm:self-center w-fit"
                            >
                              Open Details
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AI Summary Modal */}
      <Modal isOpen={summaryOpen} onClose={() => setSummaryOpen(false)} title="AI Health summary" size="lg">
        {generatingSummary ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-600">Structuring chronological history and scan results...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex gap-3">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-purple-900">MedCare Copilot Summary</h4>
                <p className="text-xs text-purple-700">Synthesized automatically from doctor scripts and diagnostics across multiple hospitals.</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium border border-gray-100 max-h-[60vh] overflow-y-auto">
              {aiSummary}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSummaryOpen(false)} className="btn-secondary text-xs px-4 py-2">Close Summary</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Record details Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Lifetime Medical Record" size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-950">{selected.diagnosis}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selected.reportType === 'Scan' ? 'bg-purple-100 text-purple-800' : selected.reportType === 'Lab Test' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {selected.reportType || 'Prescription'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selected.appointment?.hospital?.name || 'Partner Health Center'}</span>
                  <span>•</span>
                  <span>{selected.uploadedBy === 'receptionist' ? 'Uploaded by Receptionist' : `Dr. ${selected.doctor?.name}`}</span>
                </p>
              </div>
              <span className="text-xs text-gray-400 font-medium">{new Date(selected.createdAt).toLocaleDateString()}</span>
            </div>

            {selected.symptoms?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-gray-500" /> Symptoms</h4>
                <div className="flex flex-wrap gap-1">
                  {selected.symptoms.map((s, i) => <span key={i} className="badge-info text-xs">{s}</span>)}
                </div>
              </div>
            )}

            {selected.vitalSigns && Object.values(selected.vitalSigns).some(v => v) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Vitals Registered</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selected.vitalSigns.bloodPressure && <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><p className="text-[10px] text-gray-400">Blood Pressure</p><p className="font-bold text-gray-800">{selected.vitalSigns.bloodPressure}</p></div>}
                  {selected.vitalSigns.heartRate && <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><p className="text-[10px] text-gray-400">Heart Rate</p><p className="font-bold text-gray-800">{selected.vitalSigns.heartRate} bpm</p></div>}
                  {selected.vitalSigns.temperature && <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><p className="text-[10px] text-gray-400">Temperature</p><p className="font-bold text-gray-800">{selected.vitalSigns.temperature}°F</p></div>}
                  {selected.vitalSigns.oxygenSaturation && <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><p className="text-[10px] text-gray-400">SpO2 (Oxygen)</p><p className="font-bold text-gray-800">{selected.vitalSigns.oxygenSaturation}%</p></div>}
                </div>
              </div>
            )}

            {selected.prescription?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2"><Pill className="w-4 h-4 text-gray-500" /> Medication Plan</h4>
                <div className="space-y-2">
                  {selected.prescription.map((p, i) => (
                    <div key={i} className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{p.medicine}</p>
                        <p className="text-xs text-gray-500">{p.notes || 'No special notes'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-primary-600">{p.dosage}</p>
                        <p className="text-[10px] text-gray-400">{p.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1.5">{selected.reportType === 'Scan' ? 'Radiology Scan Findings' : 'Clinical Summary & Notes'}</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl leading-relaxed italic border border-gray-100">"{selected.notes}"</p>
              </div>
            )}

            {selected.followUpDate && (
              <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl text-amber-800 text-xs font-medium">
                🔔 Recommended Follow-up Appointment Date: **{new Date(selected.followUpDate).toLocaleDateString()}**
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
