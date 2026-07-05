import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { Users, UserCheck, PhoneCall, RefreshCw, AlertCircle, PhoneOff, Mic, Play, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [patients, setPatients] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('patients');

  // Interactive Call Simulator States
  const [simulatingCall, setSimulatingCall] = useState(null); // appointment object
  const [callState, setCallState] = useState('ringing'); // 'ringing', 'answered', 'why_missed', 'ask_reschedule', 'processing', 'completed', 'failed'
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [reasonInput, setReasonInput] = useState('');
  const [rescheduleInput, setRescheduleInput] = useState('');
  const [simLog, setSimLog] = useState([]); // array of { role: 'ai'|'patient', text: string }

  const speakText = (text, langCode = 'en-IN') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startSimulator = (logEntry) => {
    // Find the appointment
    const appointmentId = logEntry.appointment?._id || logEntry.appointment;
    api.get('/appointments/my') // fetch patients' appointments to match
      .then(({ data }) => {
        const match = data.appointments.find(a => a._id === appointmentId);
        if (match) {
          setSimulatingCall(match);
          setCallState('ringing');
          setSimLog([{ role: 'system', text: `Ringing patient ${match.patient?.name}...` }]);
        } else {
          toast.error('Appointment details not found for simulation');
        }
      })
      .catch(() => toast.error('Failed to resolve appointment details'));
  };

  const handleAnswer = () => {
    setCallState('answered');
    const msg = "Press 1 for English. Press 2 for Hindi.";
    setSimLog(prev => [...prev, { role: 'ai', text: msg }]);
    speakText(msg, 'en-IN');
  };

  const handleSelectLanguage = (digit) => {
    const lang = digit === 2 ? 'hi-IN' : 'en-IN';
    setSelectedLang(lang);
    setCallState('why_missed');
    
    const msg = lang === 'hi-IN' 
      ? "Aapne apni appointment miss kar di hai. Kripya bataiye aap kyu nahi aaye."
      : "You have missed your appointment. Please tell me why you were unable to attend.";
      
    setSimLog(prev => [
      ...prev, 
      { role: 'patient', text: digit === 2 ? "Pressed 2 (Hindi)" : "Pressed 1 (English)" },
      { role: 'ai', text: msg }
    ]);
    speakText(msg, lang);
  };

  const handleReasonSubmit = (e) => {
    e.preventDefault();
    if (!reasonInput.trim()) return;
    
    const speech = reasonInput.trim();
    setCallState('ask_reschedule');
    
    const responseMsg = selectedLang === 'hi-IN'
      ? "Hum samajh sakte hain. Aap apni appointment kab reschedule karna chahenge, kripya date aur time batayein."
      : "Thank you for letting us know. When would you like to reschedule your appointment? Please state the preferred date and time.";

    setSimLog(prev => [
      ...prev,
      { role: 'patient', text: speech },
      { role: 'ai', text: responseMsg }
    ]);
    speakText(responseMsg, selectedLang);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleInput.trim()) return;

    const slotText = rescheduleInput.trim();
    setCallState('processing');
    setSimLog(prev => [...prev, { role: 'patient', text: slotText }]);

    // Trigger mock call update to reschedule
    try {
      const { data } = await api.post(`/calls/trigger-noshow/${simulatingCall._id}`);
      
      // Resolve new slot details
      const nextDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
      const confirmMsg = selectedLang === 'hi-IN'
        ? `Aapki appointment ${nextDate} ko 2 PM baje ke liye reschedule ho gayi hai. Dhanyavaad.`
        : `Your appointment has been successfully rescheduled to ${nextDate} at 2:00 PM. Thank you.`;

      setCallState('completed');
      setSimLog(prev => [...prev, { role: 'ai', text: confirmMsg }]);
      speakText(confirmMsg, selectedLang);
      fetchData();
    } catch {
      setCallState('failed');
      const failMsg = "Sorry, I could not complete your reschedule request. Please do so on the website.";
      setSimLog(prev => [...prev, { role: 'ai', text: failMsg }]);
      speakText(failMsg, selectedLang);
    }
  };

  const handleHangUp = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSimulatingCall(null);
    setReasonInput('');
    setRescheduleInput('');
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/patients'),
      api.get('/admin/receptionists'),
      api.get('/calls/logs')
    ])
      .then(([pRes, rRes, cRes]) => {
        setPatients(pRes.data.patients);
        setReceptionists(rRes.data.receptionists);
        setCallLogs(cRes.data.logs || []);
      })
      .catch(() => toast.error('Failed to load portal logs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <h1 className="page-header">Platform Management</h1>
      <div className="flex gap-2 mb-6">
        {[
          { key: 'patients', label: `Patients (${patients.length})`, icon: Users },
          { key: 'receptionists', label: `Receptionists (${receptionists.length})`, icon: UserCheck },
          { key: 'call_logs', label: `AI No-Show Logs (${callLogs.length})`, icon: PhoneCall }
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab !== 'call_logs' ? (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Phone</th>
                {tab === 'patients' && <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Blood Group</th>}
                {tab === 'receptionists' && <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Hospital</th>}
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(tab === 'patients' ? patients : receptionists).map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email || '—'}</td>
                  <td className="px-6 py-4 text-sm">{u.phone || '—'}</td>
                  {tab === 'patients' && <td className="px-6 py-4 text-sm">{u.bloodGroup || '—'}</td>}
                  {tab === 'receptionists' && <td className="px-6 py-4 text-sm">{u.hospital?.name || '—'}</td>}
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Patient</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Missed Reason</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Lang</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Reschedule Slot</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Call Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {callLogs.map(log => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-950">{log.patient?.name}</p>
                    <p className="text-xs text-gray-400">{log.patient?.phone}</p>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-gray-700 italic">"{log.missedReason || 'No reason specified'}"</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">{log.languageSelected === 'hi-IN' ? 'Hindi' : 'English'}</td>
                  <td className="px-6 py-4">
                    {log.rescheduledToDate ? (
                      <div>
                        <p className="text-sm font-semibold text-primary-600">{log.rescheduledToDate}</p>
                        <p className="text-xs text-gray-500">{log.rescheduledToTime}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> App Fallback</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={log.callStatus} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => startSimulator(log)}
                      className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1 text-xs font-bold"
                      title="Trigger conversational call simulation"
                    >
                      <Play className="w-3.5 h-3.5" /> Run Runtime Call
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Real-time Voice Call Simulator Modal */}
      {simulatingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-gray-900 text-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-800">
            {/* Phone Screen Header */}
            <div className="bg-gray-850 p-6 border-b border-gray-800 text-center relative">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block mr-2 animate-pulse" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Outbound Call Simulator</span>
              <h2 className="text-lg font-bold mt-2 text-white">{simulatingCall.patient?.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{simulatingCall.patient?.phone}</p>
            </div>

            {/* Conversation Log screen */}
            <div className="p-5 h-64 overflow-y-auto space-y-3 bg-gray-950 font-mono text-xs text-green-400">
              {simLog.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-gray-600 font-bold">[{log.role === 'ai' ? 'ROBOT' : log.role === 'system' ? 'SYS' : 'USER'}]:</span>
                  <span className={log.role === 'ai' ? 'text-blue-300 font-sans' : log.role === 'system' ? 'text-gray-500 italic' : 'text-green-300 font-sans'}>
                    {log.text}
                  </span>
                </div>
              ))}
              {callState === 'processing' && <p className="text-gray-500 animate-pulse">🤖 AI Engine processing rescheduling request...</p>}
            </div>

            {/* Interactive keypad and inputs */}
            <div className="p-6 bg-gray-900 border-t border-gray-800 space-y-4">
              
              {/* RINGING STATE */}
              {callState === 'ringing' && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs text-gray-400 font-medium animate-bounce">📱 Incoming Call ringing on patient's device...</p>
                  <button 
                    onClick={handleAnswer}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-5 h-5" /> Answer Phone Call
                  </button>
                </div>
              )}

              {/* ANSWERED / SELECT LANGUAGE */}
              {callState === 'answered' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400 text-center font-semibold">Select Language (Press Digit Keypad):</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleSelectLanguage(1)} className="py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 border border-gray-700">
                      Press 1 (English)
                    </button>
                    <button onClick={() => handleSelectLanguage(2)} className="py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 border border-gray-700">
                      Press 2 (Hindi)
                    </button>
                  </div>
                </div>
              )}

              {/* WHY MISSED INPUT */}
              {callState === 'why_missed' && (
                <form onSubmit={handleReasonSubmit} className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Speak/Type Reason for Missing Appointment</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={reasonInput}
                      onChange={e => setReasonInput(e.target.value)}
                      placeholder={selectedLang === 'hi-IN' ? "e.g. Traffic me phans gaya tha" : "e.g. I was stuck in a meeting"}
                      className="input-field flex-1 !bg-gray-950 !text-white !border-gray-800 text-xs focus:!border-purple-500"
                      required
                    />
                    <button type="submit" className="p-2.5 bg-primary-600 hover:bg-primary-700 rounded-xl">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">Press enter or arrow to speak response to the robot.</p>
                </form>
              )}

              {/* ASK RESCHEDULE INPUT */}
              {callState === 'ask_reschedule' && (
                <form onSubmit={handleRescheduleSubmit} className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Speak/Type Rescheduling Preference</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={rescheduleInput}
                      onChange={e => setRescheduleInput(e.target.value)}
                      placeholder={selectedLang === 'hi-IN' ? "e.g. Parso dopehar 2 baje" : "e.g. Day after tomorrow at 2 PM"}
                      className="input-field flex-1 !bg-gray-950 !text-white !border-gray-800 text-xs focus:!border-purple-500"
                      required
                    />
                    <button type="submit" className="p-2.5 bg-primary-600 hover:bg-primary-700 rounded-xl">
                      <Sparkles className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">Press enter or arrow to verify automatic rescheduling updates in portal.</p>
                </form>
              )}

              {/* END CALLS */}
              <div className="pt-2">
                <button 
                  onClick={handleHangUp}
                  className="w-full py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <PhoneOff className="w-4 h-4" /> Disconnect Call
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
