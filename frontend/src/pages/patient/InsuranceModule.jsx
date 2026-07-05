import { useState, useEffect } from 'react';
import { ShieldCheck, FileUp, Sparkles, Building2, HeartCrack, Calculator, Volume2, PhoneCall, PhoneOff, ArrowRight, UserCog, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InsuranceModule() {
  const [hospitals, setHospitals] = useState([]);
  const [insuranceCard, setInsuranceCard] = useState(null); // uploaded card details
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('Heart Attack');
  const [quotedAmount, setQuotedAmount] = useState('300000'); // 3 Lakhs default
  const [brokerNumber, setBrokerNumber] = useState('+91 98765 43210'); // Broker contact number
  
  // Calculation outputs
  const [coveragePercent, setCoveragePercent] = useState(0);
  const [reimbursedAmount, setReimbursedAmount] = useState(0);
  const [outOfPocket, setOutOfPocket] = useState(0);
  const [policyNotes, setPolicyNotes] = useState('');

  // AI Claims Agent states
  const [callActive, setCallActive] = useState(false);
  const [callLogs, setCallLogs] = useState([]);
  const [callProgress, setCallProgress] = useState('idle'); // 'ringing', 'speaking', 'negotiating', 'done'
  const [negotiationStage, setNegotiationStage] = useState(1);

  // Pre-load hospitals
  useEffect(() => {
    const mockH = JSON.parse(localStorage.getItem('mock_hospitals')) || [];
    setHospitals(mockH);
    if (mockH.length > 0) setSelectedHospital(mockH[0]._id);
  }, []);

  // Update calculator logic when inputs change
  useEffect(() => {
    if (!selectedHospital || !quotedAmount) return;
    const amount = Number(quotedAmount) || 0;
    
    let rate = 70; // fallback percent
    let limit = 5000000; // max policy limit
    let notes = '';

    const hosp = hospitals.find(h => h._id === selectedHospital);
    const hospName = hosp ? hosp.name : '';

    if (selectedDisease === 'Heart Attack') {
      if (hospName.includes('Apollo')) {
        rate = 90;
        notes = "Apollo Health Center is a Tier-1 Cashless Partner for Cardiac Care. 90% reimbursement applies.";
      } else if (hospName.includes('City General')) {
        rate = 80;
        notes = "City General Hospital has a co-pay arrangement for Cardiology. 80% reimbursement applies.";
      } else {
        rate = 75;
        notes = "Standard network reimbursement rates of 75% apply at Care Hospitals.";
      }
    } else if (selectedDisease === 'Appendicitis') {
      limit = 100000; // Cap limit for appendicitis
      rate = 85;
      notes = `Appendectomy treatments are capped at maximum limit of 1,00,000 INR. Reimbursement rate: 85% at ${hospName || 'this hospital'}.`;
    } else if (selectedDisease === 'Covid Treatment') {
      rate = 95;
      notes = "Special pandemic policy rider covers 95% of room rent and medical overheads.";
    } else {
      rate = 70;
      notes = "Custom treatment category. General policy co-pay terms (70% coverage) apply.";
    }

    let estReimbursed = Math.min((amount * rate) / 100, limit);
    let estOutOfPocket = amount - estReimbursed;

    setCoveragePercent(rate);
    setReimbursedAmount(estReimbursed);
    setOutOfPocket(estOutOfPocket);
    setPolicyNotes(notes);
  }, [selectedHospital, selectedDisease, quotedAmount, hospitals]);

  const handleMockUpload = (e) => {
    e.preventDefault();
    setInsuranceCard({
      provider: 'Star Health Insurance',
      policyNumber: 'SH-99887754',
      coverageLimit: '50,00,000 INR',
      expiry: '2028-12-31',
      holder: 'Ravi Teja',
      type: 'Super Premium Gold Card'
    });
    toast.success('Star Health Premium Card uploaded and verified!');
  };

  const speakVoice = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const startAICall = () => {
    if (!brokerNumber.trim()) {
      return toast.error('Please enter a valid broker or adjuster phone number');
    }
    setCallActive(true);
    setCallProgress('ringing');
    setCallLogs([{ role: 'system', text: `Initiating claim negotiation desk call to ${brokerNumber}...` }]);

    // Ringing timeout
    setTimeout(() => {
      setCallProgress('speaking');
      const hospObj = hospitals.find(h => h._id === selectedHospital);
      const textToSpeak = `Hello, I am the MedCare AI claims assistant representing Patient Ravi Teja, Policy number S H 99887754. The patient requires treatment for ${selectedDisease} at ${hospObj?.name || 'partner hospital'}. The hospital has quoted a medical bill of ${quotedAmount} rupees. Based on the patient's critical parameters and cardiac severity logs, we request expedited cashless clearance for the estimated ${reimbursedAmount} rupees. Thank you.`;
      
      setCallLogs(prev => [
        ...prev,
        { role: 'system', text: `Call answered by Broker desk (${brokerNumber}).` },
        { role: 'ai', text: textToSpeak }
      ]);
      speakVoice(textToSpeak);
      setNegotiationStage(1);
    }, 2000);
  };

  // Interactive Negotiation Actions representing Broker Responses
  const handleBrokerOffer = (offerPercent) => {
    setCallProgress('negotiating');
    const originalRate = coveragePercent;
    const proposedRate = offerPercent;
    const finalProposedAmount = (Number(quotedAmount) * proposedRate) / 100;
    
    const brokerText = `We checked the cardiology logs. The diagnosis details support emergency classification, but we can only clear a maximum of ${proposedRate}% of the quoted bill under standard policy codes. That equals ₹${finalProposedAmount.toLocaleString()}.`;
    
    // AI Counter response negotiating for maximum
    const counterRate = Math.min(100, proposedRate + 10);
    const counterAmount = (Number(quotedAmount) * counterRate) / 100;
    
    const aiResponseText = `Given that patient Ravi Teja has a history of mild Hypertension with active symptoms of headache, hospitalizing him immediately was a clinical necessity. Under Tier-1 Cashless co-pay schedules, standard limits should be bypassed for emergency diagnostics. We request that you increase the approved coverage to at least ${counterRate}% or ₹${counterAmount.toLocaleString()} to avoid out-of-pocket distress.`;

    setCallLogs(prev => [
      ...prev,
      { role: 'officer', text: brokerText },
      { role: 'ai', text: aiResponseText }
    ]);
    speakVoice(aiResponseText);
    setNegotiationStage(2);
  };

  const handleFinalBrokerApproval = (acceptHigher) => {
    setCallProgress('done');
    let finalPercent = coveragePercent;
    let finalMsg = '';

    if (acceptHigher) {
      finalPercent = Math.min(100, coveragePercent - 5); // agreed higher rate
      const finalAmount = (Number(quotedAmount) * finalPercent) / 100;
      finalMsg = `Fine. Considering the emergency vitals and active diagnostics, we will authorize a special waiver. Pre-authorization approved for ₹${finalAmount.toLocaleString()} (${finalPercent}% coverage). Pre-Auth Code: PreAuth-STAR-8812.`;
    } else {
      finalPercent = Math.max(50, coveragePercent - 15); // standard low rate
      const finalAmount = (Number(quotedAmount) * finalPercent) / 100;
      finalMsg = `We can only proceed with standard approvals. Pre-authorization cleared for ₹${finalAmount.toLocaleString()} (${finalPercent}% coverage). Pre-Auth Code: PreAuth-STAR-7711.`;
    }

    setCallLogs(prev => [
      ...prev,
      { role: 'officer', text: finalMsg },
      { role: 'system', text: `Negotiation completed. Pre-authorization status: APPROVED. Final coverage: ${finalPercent}%.` }
    ]);
    speakVoice(finalMsg);
  };

  const endAICall = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCallActive(false);
    setCallProgress('idle');
    setCallLogs([]);
    setNegotiationStage(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-header !mb-1">Insurance Pre-Auth & Broker Negotiation</h1>
        <p className="text-sm text-gray-500">Provide broker phone numbers and engage in voice negotiations to maximize reimbursement rates based on diagnostic severity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Upload Card & Calculator */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card Uploader */}
          <div className="card !p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-green-600" /> Upload Health Insurance Card
            </h2>
            
            {!insuranceCard ? (
              <button 
                onClick={handleMockUpload}
                className="w-full border-2 border-dashed border-gray-200 hover:border-primary-400 py-10 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <div className="w-12 h-12 bg-gray-50 group-hover:bg-primary-50 rounded-xl flex items-center justify-center transition-colors">
                  <FileUp className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Mock Upload Insurance Card</p>
                  <p className="text-xs text-gray-400">Click to upload Star Health Gold Card mockup</p>
                </div>
              </button>
            ) : (
              <div className="p-5 bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl relative overflow-hidden shadow-lg border border-teal-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight uppercase tracking-wider">{insuranceCard.provider}</h3>
                    <p className="text-[10px] text-teal-150 font-bold tracking-wide mt-0.5">{insuranceCard.type}</p>
                  </div>
                  <span className="text-[10px] bg-white/20 border border-white/30 px-2 py-0.5 rounded font-black tracking-widest uppercase">PRE-AUTH ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-teal-200 uppercase font-black">Policy Holder</p>
                    <p className="text-sm font-bold mt-0.5">{insuranceCard.holder}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-teal-200 uppercase font-black">Policy Number</p>
                    <p className="text-sm font-mono mt-0.5">{insuranceCard.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-teal-200 uppercase font-black">Coverage Cap Limit</p>
                    <p className="text-sm font-bold mt-0.5">{insuranceCard.coverageLimit}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-teal-200 uppercase font-black">Valid Upto</p>
                    <p className="text-sm font-bold mt-0.5">{insuranceCard.expiry}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Coverage Estimator */}
          <div className="card !p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <Calculator className="w-5 h-5 text-primary-600" /> Coverage & Recovery Estimator
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Select Hospital</label>
                  <select 
                    value={selectedHospital} 
                    onChange={e => setSelectedHospital(e.target.value)}
                    className="input-field text-xs"
                  >
                    {hospitals.map(h => (
                      <option key={h._id} value={h._id}>{h.name} ({h.city})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Select Ailment / Disease</label>
                  <select 
                    value={selectedDisease} 
                    onChange={e => setSelectedDisease(e.target.value)}
                    className="input-field text-xs"
                  >
                    {['Heart Attack', 'Appendicitis', 'Covid Treatment', 'General Consultation / Custom'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Quoted Bill Amount (INR)</label>
                <input 
                  type="number" 
                  value={quotedAmount}
                  onChange={e => setQuotedAmount(e.target.value)}
                  placeholder="Enter quoted package bill (e.g. 300000)" 
                  className="input-field text-xs font-bold text-gray-800"
                />
              </div>

              {/* Recovery metrics box */}
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Estimated Coverage</p>
                  <p className="text-lg font-black text-green-600 mt-1">{coveragePercent}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Will Recover</p>
                  <p className="text-lg font-black text-primary-700 mt-1">₹{reimbursedAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Out of Pocket</p>
                  <p className="text-lg font-black text-red-600 mt-1">₹{outOfPocket.toLocaleString()}</p>
                </div>
              </div>

              {policyNotes && (
                <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl text-xs text-blue-700 font-medium">
                  ℹ️ {policyNotes}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Claims Representative & Broker Negotiation */}
        <div className="space-y-6">
          <div className="card border-2 border-purple-200 relative overflow-hidden bg-gradient-to-br from-purple-50/20 to-white">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8" />
            <div className="flex items-center gap-1.5 text-purple-700 font-bold mb-4 uppercase tracking-wider text-xs">
              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" /> AI Voice Claims Negotiator
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Adjuster/Broker Phone Number</label>
                <input 
                  type="text" 
                  value={brokerNumber}
                  onChange={e => setBrokerNumber(e.target.value)}
                  placeholder="Enter adjuster number" 
                  className="input-field text-xs font-bold text-gray-800"
                  disabled={callActive}
                />
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed">
                Connect the AI directly to your broker desk. The AI will verbally present vital diagnostics and negotiate cashless approval caps.
              </p>

              {!insuranceCard ? (
                <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl text-xs text-amber-700 font-medium">
                  ⚠️ Please upload your health insurance card first to enable pre-authorization dialer.
                </div>
              ) : !callActive ? (
                <button 
                  onClick={startAICall}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <PhoneCall className="w-5 h-5" /> Dial Broker & Negotiate
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Simulated Dialer screen */}
                  <div className="bg-gray-950 p-4 h-56 overflow-y-auto space-y-3 font-mono text-[9px] text-green-400 rounded-2xl border border-gray-850 shadow-inner">
                    {callLogs.map((log, i) => (
                      <div key={i} className="flex gap-1.5">
                        <span className="text-gray-600">[{log.role === 'ai' ? 'AI' : log.role === 'officer' ? 'BROKER' : 'SYS'}]:</span>
                        <span className={log.role === 'ai' ? 'text-blue-350 font-sans' : log.role === 'officer' ? 'text-green-300 font-sans' : 'text-gray-500 italic'}>
                          {log.text}
                        </span>
                      </div>
                    ))}
                    {callProgress === 'ringing' && <p className="animate-pulse text-gray-400">📱 Connecting claim line...</p>}
                    {callProgress === 'speaking' && <p className="animate-pulse text-purple-400">🔊 Speaking patient severity profile...</p>}
                    {callProgress === 'negotiating' && <p className="animate-pulse text-yellow-400">💡 AI counter-negotiating for higher pre-auth cap...</p>}
                  </div>

                  {/* Interactive Negotiation Actions */}
                  {callProgress === 'speaking' && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Broker Response (Select for simulation):</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button 
                          type="button"
                          onClick={() => handleBrokerOffer(60)}
                          className="py-2 bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-800 rounded-lg"
                        >
                          Offer 60% Coverage
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleBrokerOffer(75)}
                          className="py-2 bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-800 rounded-lg"
                        >
                          Offer 75% Coverage
                        </button>
                      </div>
                    </div>
                  )}

                  {callProgress === 'negotiating' && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Final Adjuster Verdict:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button 
                          type="button"
                          onClick={() => handleFinalBrokerApproval(true)}
                          className="py-2 bg-green-600 hover:bg-green-700 text-[10px] font-bold text-white rounded-lg"
                        >
                          Accept AI Counter (+10%)
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleFinalBrokerApproval(false)}
                          className="py-2 bg-gray-600 hover:bg-gray-700 text-[10px] font-bold text-white rounded-lg"
                        >
                          Stick to Original Offer
                        </button>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={endAICall}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors text-xs"
                  >
                    <PhoneOff className="w-4 h-4" /> Disconnect Call
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
