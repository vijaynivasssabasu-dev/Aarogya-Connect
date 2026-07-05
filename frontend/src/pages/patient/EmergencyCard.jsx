import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Printer, Save, Plus, X, Phone, UserCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmergencyCard() {
  const { user } = useAuth();
  
  // Local profile states, binding to localStorage mock patients
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState([]);
  const [chronic, setChronic] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // Helpers to add lists
  const [newAllergy, setNewAllergy] = useState('');
  const [newChronic, setNewChronic] = useState('');

  useEffect(() => {
    // Read from mock patient database if available
    const mockP = JSON.parse(localStorage.getItem('mock_patients')) || [];
    const active = mockP.find(p => p.email === user?.email || p.phone === user?.phone) || user;
    if (active) {
      setBloodGroup(active.bloodGroup || 'O+');
      setAllergies(active.allergies || ['Penicillin', 'Dust']);
      setChronic(active.chronicConditions || ['Hypertension (mild)']);
      setContactName(active.emergencyContact?.name || 'Anil Teja');
      setContactRelation(active.emergencyContact?.relation || 'Brother');
      setContactPhone(active.emergencyContact?.phone || '+91 99887 76655');
    }
  }, [user]);

  const addAllergy = (e) => {
    e.preventDefault();
    if (!newAllergy.trim()) return;
    setAllergies([...allergies, newAllergy.trim()]);
    setNewAllergy('');
  };

  const removeAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addChronic = (e) => {
    e.preventDefault();
    if (!newChronic.trim()) return;
    setChronic([...chronic, newChronic.trim()]);
    setNewChronic('');
  };

  const removeChronic = (index) => {
    setChronic(chronic.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const mockP = JSON.parse(localStorage.getItem('mock_patients')) || [];
    const idx = mockP.findIndex(p => p.email === user?.email || p.phone === user?.phone);
    if (idx !== -1) {
      mockP[idx].bloodGroup = bloodGroup;
      mockP[idx].allergies = allergies;
      mockP[idx].chronicConditions = chronic;
      mockP[idx].emergencyContact = {
        name: contactName,
        relation: contactRelation,
        phone: contactPhone
      };
      localStorage.setItem('mock_patients', JSON.stringify(mockP));
      toast.success('Emergency Card details saved successfully!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header !mb-1">Emergency Health Card</h1>
          <p className="text-sm text-gray-500">Maintain critical safety profiles accessible by first-responders during emergency situations.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="btn-secondary flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm"
        >
          <Printer className="w-4 h-4" /> Print Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card preview */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Preview Card (Wallet Sized)</p>
          
          <div id="printable-emergency-card" className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-red-500 bg-white shadow-xl relative">
            {/* Header branding */}
            <div className="bg-red-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 fill-white" />
                <div>
                  <h2 className="font-bold text-sm leading-tight uppercase tracking-wider">MedCare Emergency</h2>
                  <p className="text-[10px] text-red-150 font-semibold">Lifetime Health Profile</p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-white/20 rounded-md">SOS</span>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Patient</p>
                  <p className="font-extrabold text-gray-900 text-lg leading-tight mt-0.5">{user?.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">DOB: {user?.dob || '1990-05-15'}</p>
                </div>
                <div className="bg-red-100 border border-red-200 text-red-700 font-black w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[9px] font-bold uppercase text-red-500">BLOOD</span>
                  <span className="text-xl leading-none">{bloodGroup}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Allergies</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {allergies.length > 0 ? allergies.map(a => (
                      <span key={a} className="text-[9px] px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded font-bold">{a}</span>
                    )) : (
                      <span className="text-xs text-gray-500 italic">None reported</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Chronic Conditions</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {chronic.length > 0 ? chronic.map(c => (
                      <span key={c} className="text-[9px] px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-100 rounded font-semibold">{c}</span>
                    )) : (
                      <span className="text-xs text-gray-500 italic">None</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Emergency Contact</p>
                  <p className="font-bold text-sm text-gray-800 mt-0.5">{contactName} ({contactRelation})</p>
                  <p className="text-xs font-bold text-primary-600 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {contactPhone}
                  </p>
                </div>
                <div className="flex flex-col items-center bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                  <div className="grid grid-cols-5 gap-0.5 w-14 h-14 bg-gray-100 p-0.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`w-full h-full ${i % 3 === 0 || i % 7 === 0 || i === 0 || i === 4 || i === 20 || i === 24 ? 'bg-gray-900' : 'bg-white'}`} />
                    ))}
                  </div>
                  <span className="text-[7px] text-gray-400 font-black mt-1 tracking-wider">SCAN SOS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Fields Form */}
        <div className="card space-y-5">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
            <ShieldAlert className="w-5 h-5 text-red-500" /> Edit Emergency Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Blood Group</label>
              <select 
                value={bloodGroup} 
                onChange={e => setBloodGroup(e.target.value)} 
                className="input-field text-sm"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Allergies</label>
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  value={newAllergy}
                  onChange={e => setNewAllergy(e.target.value)}
                  placeholder="e.g. Sulfa, Peanuts, Pollen" 
                  className="input-field text-xs flex-1" 
                />
                <button onClick={addAllergy} className="px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {allergies.map((a, i) => (
                  <span key={i} className="text-xxs font-semibold bg-red-50 text-red-800 border border-red-100 py-1 px-2 rounded-lg flex items-center gap-1">
                    {a} <button type="button" onClick={() => removeAllergy(i)}><X className="w-3 h-3 text-red-500 hover:text-red-700" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Chronic Illnesses</label>
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  value={newChronic}
                  onChange={e => setNewChronic(e.target.value)}
                  placeholder="e.g. Asthma, Diabetes, Epilepsy" 
                  className="input-field text-xs flex-1" 
                />
                <button onClick={addChronic} className="px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {chronic.map((c, i) => (
                  <span key={i} className="text-xxs font-semibold bg-gray-50 text-gray-700 border border-gray-200 py-1 px-2 rounded-lg flex items-center gap-1">
                    {c} <button type="button" onClick={() => removeChronic(i)}><X className="w-3 h-3 text-gray-500 hover:text-gray-700" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase">Emergency Contact Info</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Contact Name</label>
                  <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="input-field text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Relation</label>
                  <input type="text" value={contactRelation} onChange={e => setContactRelation(e.target.value)} className="input-field text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Contact Phone</label>
                <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="input-field text-xs" />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
            >
              <Save className="w-4 h-4" /> Save emergency parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
