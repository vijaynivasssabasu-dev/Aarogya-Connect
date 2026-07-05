import { useState, useEffect } from 'react';
import { Pill, Plus, Clock, Check, BellRing, Calendar, Trash2, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MedicineReminders() {
  const [reminders, setReminders] = useState([]);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [note, setNote] = useState('');

  // Initial mock loading
  useEffect(() => {
    const saved = localStorage.getItem('mock_medicine_reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    } else {
      const initial = [
        { id: 1, name: 'Cetirizine 10mg', dosage: '1 tablet', time: '09:00 PM', taken: false, note: 'Before bed' },
        { id: 2, name: 'Fluticasone Nasal Spray', dosage: '1 spray', time: '08:00 AM', taken: false, note: 'Daily morning' },
        { id: 3, name: 'Amlodipine 5mg', dosage: '1 pill', time: '09:00 AM', taken: false, note: 'Blood Pressure' }
      ];
      setReminders(initial);
      localStorage.setItem('mock_medicine_reminders', JSON.stringify(initial));
    }
  }, []);

  const saveToLocal = (newReminders) => {
    setReminders(newReminders);
    localStorage.setItem('mock_medicine_reminders', JSON.stringify(newReminders));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!medName.trim() || !dosage.trim()) return toast.error('Please fill in the medicine name and dosage');

    const newReminder = {
      id: Date.now(),
      name: medName.trim(),
      dosage: dosage.trim(),
      time: time,
      note: note.trim(),
      taken: false
    };

    const updated = [...reminders, newReminder];
    saveToLocal(updated);
    toast.success('Medicine reminder added!');
    
    setMedName('');
    setDosage('');
    setNote('');
  };

  const toggleTaken = (id) => {
    const updated = reminders.map(r => {
      if (r.id === id) {
        const nextState = !r.taken;
        if (nextState) toast.success(`Took ${r.name}! Great job staying compliant.`);
        return { ...r, taken: nextState };
      }
      return r;
    });
    saveToLocal(updated);
  };

  const handleDelete = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    saveToLocal(updated);
    toast.success('Reminder removed');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-header !mb-1">Medicine Reminders</h1>
        <p className="text-sm text-gray-500">Track and schedule daily medication doses, log compliance, and configure alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Reminders List */}
        <div className="md:col-span-2 space-y-4">
          <div className="card !p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary-600" /> Today's Med Plan
            </h2>
            
            {reminders.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center italic">No active medicine reminders scheduled. Set one up on the right!</p>
            ) : (
              <div className="space-y-3">
                {reminders.map(r => (
                  <div 
                    key={r.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      r.taken 
                        ? 'bg-green-50/40 border-green-100 opacity-60' 
                        : 'bg-gray-50/50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${r.taken ? 'bg-green-100 text-green-700' : 'bg-primary-50 text-primary-600'}`}>
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${r.taken ? 'line-through text-gray-400' : 'text-gray-900'}`}>{r.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" /> {r.time}
                          <span className="text-gray-300">•</span>
                          <span>{r.dosage}</span>
                          {r.note && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="italic text-gray-400">"{r.note}"</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleTaken(r.id)}
                        className={`p-2 rounded-xl transition-all ${
                          r.taken 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-600'
                        }`}
                        title={r.taken ? 'Mark Untaken' : 'Mark Taken'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="p-2 text-gray-450 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Setup Form */}
        <div className="card space-y-4 !p-5">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
            <BellRing className="w-5 h-5 text-primary-600" /> Add Reminder
          </h2>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Medicine Name</label>
              <input 
                type="text" 
                value={medName}
                onChange={e => setMedName(e.target.value)}
                placeholder="e.g. Paracetamol, Insulin" 
                className="input-field text-xs" 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Dosage Size</label>
              <input 
                type="text" 
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                placeholder="e.g. 1 tablet, 5ml, 2 drops" 
                className="input-field text-xs" 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Alert Timing</label>
              <select 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                className="input-field text-xs"
              >
                {['06:00 AM', '08:00 AM', '09:00 AM', '12:00 PM', '02:00 PM', '05:00 PM', '07:00 PM', '09:00 PM', '10:00 PM'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Special Intake Notes</label>
              <input 
                type="text" 
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. After meals, avoid milk" 
                className="input-field text-xs" 
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Save Reminder Schedule
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
