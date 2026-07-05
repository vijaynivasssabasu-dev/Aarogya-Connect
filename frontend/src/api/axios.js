import axios from 'axios';

// Switch this to true to enable Mock Mode
const USE_MOCK = true;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

if (USE_MOCK) {
  // Initialize mock data store in localStorage if not exists
  const initLocalStorage = () => {
    if (!localStorage.getItem('mock_initialized_v4')) {
      const hospitals = [
        { _id: "h1", name: "City General Hospital", city: "Hyderabad", address: "Road No. 1, Banjara Hills", phone: "+914023456789" },
        { _id: "h2", name: "Apollo Health Center", city: "Hyderabad", address: "Jubilee Hills", phone: "+914034567890" },
        { _id: "h3", name: "Care Hospitals", city: "Hyderabad", address: "Hitech City", phone: "+914045678901" },
      ];
      const categories = [
        { _id: "c1", categoryName: "Cardiology" },
        { _id: "c2", categoryName: "Dermatology" },
        { _id: "c3", categoryName: "Orthopedics" },
        { _id: "c4", categoryName: "Pediatrics" },
        { _id: "c5", categoryName: "General Medicine" },
        { _id: "c6", categoryName: "Neurology" },
        { _id: "c7", categoryName: "Ophthalmology" },
        { _id: "c8", categoryName: "ENT" },
      ];
      const doctors = [
        { _id: "d1", name: "Dr. Rajesh Kumar", email: "rajesh@healthcare.com", phone: "+919876543210", hospital: hospitals[0], category: categories[0], availabilityStatus: "available" },
        { _id: "d2", name: "Dr. Priya Sharma", email: "priya@healthcare.com", phone: "+919876543211", hospital: hospitals[0], category: categories[1], availabilityStatus: "available" },
        { _id: "d3", name: "Dr. Amit Patel", email: "amit@healthcare.com", phone: "+919876543212", hospital: hospitals[1], category: categories[2], availabilityStatus: "available" },
        { _id: "d4", name: "Dr. Sneha Reddy", email: "sneha@healthcare.com", phone: "+919876543213", hospital: hospitals[1], category: categories[3], availabilityStatus: "available" },
        { _id: "d5", name: "Dr. Vikram Singh", email: "vikram@healthcare.com", phone: "+919876543214", hospital: hospitals[2], category: categories[4], availabilityStatus: "available" },
      ];
      const patients = [
        { 
          _id: "p1", 
          name: "Ravi Teja", 
          email: "ravi@example.com", 
          phone: "+919123456789", 
          dob: "1990-05-15", 
          gender: "Male", 
          bloodGroup: "O+", 
          address: "Hyderabad",
          allergies: ["Penicillin", "Dust"],
          chronicConditions: ["Hypertension (mild)"],
          emergencyContact: { name: "Anil Teja", relation: "Brother", phone: "+919988776655" }
        },
        { 
          _id: "p2", 
          name: "Ananya Iyer", 
          email: "ananya@example.com", 
          phone: "+919123456790", 
          dob: "1985-08-22", 
          gender: "Female", 
          bloodGroup: "A+", 
          address: "Hyderabad",
          allergies: ["Peanuts"],
          chronicConditions: [],
          emergencyContact: { name: "Vikas Iyer", relation: "Spouse", phone: "+919988776644" }
        },
      ];
      const receptionists = [
        { _id: "r1", name: "Meena Kumari", email: "meena@healthcare.com", phone: "+919876000001", hospital: hospitals[0] },
        { _id: "r2", name: "Suresh Babu", email: "suresh@healthcare.com", phone: "+919876000002", hospital: hospitals[1] },
      ];
      const admins = [
        { _id: "a1", name: "System Admin", email: "admin@healthcare.com", phone: "+919999999999", isSuperAdmin: true },
      ];
      
      const payments = [
        { _id: "pay1", patient: "p1", amount: 500, status: "success", razorpayPaymentId: "pay_mock1", createdAt: new Date().toISOString() },
        { _id: "pay2", patient: "p2", amount: 500, status: "success", razorpayPaymentId: "pay_mock2", createdAt: new Date().toISOString() }
      ];

      const appointments = [
        {
          _id: "appt1",
          patient: patients[0],
          doctor: doctors[0],
          hospital: hospitals[0],
          slotDate: new Date().toISOString().split('T')[0],
          slotTime: "10:00",
          status: "booked",
          isEmergency: false,
          checkedInAt: null,
          noShowCallTriggered: false,
          payment: payments[0],
          createdAt: new Date().toISOString(),
        },
        {
          _id: "appt2",
          patient: patients[1],
          doctor: doctors[1],
          hospital: hospitals[1], // Different hospital to show lifetime records!
          slotDate: new Date().toISOString().split('T')[0],
          slotTime: "11:30",
          status: "completed",
          isEmergency: false,
          checkedInAt: new Date().toISOString(),
          noShowCallTriggered: false,
          payment: payments[1],
          createdAt: new Date().toISOString(),
        }
      ];
      
      const records = [
        {
          _id: "rec1",
          patient: patients[1],
          doctor: doctors[1],
          appointment: appointments[1],
          diagnosis: "Seasonal Allergies",
          symptoms: ["Sneezing", "Runny nose", "Itchy eyes"],
          prescription: [
            { medicine: "Cetirizine 10mg", dosage: "1 tablet daily", duration: "10 days", notes: "Before sleep" },
            { medicine: "Fluticasone Nasal Spray", dosage: "1 spray each nostril daily", duration: "30 days", notes: "Morning" }
          ],
          notes: "Advised to avoid outdoor dust and pollen.",
          vitalSigns: { bloodPressure: "118/76", heartRate: 68, temperature: 98.4, weight: 62, oxygenSaturation: 99 },
          followUpDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days later
          uploadedBy: "doctor",
          reportType: "Prescription",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        },
        {
          _id: "rec2",
          patient: patients[0],
          doctor: doctors[0],
          appointment: appointments[0],
          diagnosis: "Hypertension Checkup",
          symptoms: ["Mild headache"],
          prescription: [
            { medicine: "Amlodipine 5mg", dosage: "1 tablet daily", duration: "30 days", notes: "Morning after food" }
          ],
          notes: "Patient advised to reduce salt intake and monitor BP twice weekly.",
          vitalSigns: { bloodPressure: "135/85", heartRate: 74, temperature: 98.6, weight: 78, oxygenSaturation: 98 },
          followUpDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days later
          uploadedBy: "doctor",
          reportType: "Prescription",
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        }
      ];

      const callLogs = [
        {
          _id: "log1",
          appointment: appointments[0],
          patient: patients[0],
          twilioCallSid: "CA_mock123",
          callStatus: "completed",
          languageSelected: "en-IN",
          missedReason: "Stuck in heavy traffic on main road",
          rawSpeechTranscript: "reschedule it for next Friday morning at 10 AM",
          rescheduledToDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          rescheduledToTime: "10:00",
          createdAt: new Date().toISOString(),
        }
      ];

      localStorage.setItem('mock_hospitals', JSON.stringify(hospitals));
      localStorage.setItem('mock_categories', JSON.stringify(categories));
      localStorage.setItem('mock_doctors', JSON.stringify(doctors));
      localStorage.setItem('mock_patients', JSON.stringify(patients));
      localStorage.setItem('mock_receptionists', JSON.stringify(receptionists));
      localStorage.setItem('mock_admins', JSON.stringify(admins));
      localStorage.setItem('mock_appointments', JSON.stringify(appointments));
      localStorage.setItem('mock_payments', JSON.stringify(payments));
      localStorage.setItem('mock_records', JSON.stringify(records));
      localStorage.setItem('mock_call_logs', JSON.stringify(callLogs));
      localStorage.setItem('mock_initialized_v4', 'true');
    }
  };

  initLocalStorage();

  const getLocal = (key) => JSON.parse(localStorage.getItem(key)) || [];
  const setLocal = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  api.interceptors.request.use((config) => {
    const url = config.url;
    const method = config.method.toUpperCase();
    const data = config.data ? JSON.parse(JSON.stringify(config.data)) : null;

    const mockResponse = (responseData, status = 200) => {
      config.adapter = () => Promise.resolve({
        data: responseData,
        status,
        statusText: 'OK',
        headers: {},
        config,
      });
      return config;
    };

    const mockError = (message, status = 400) => {
      config.adapter = () => Promise.reject({
        response: {
          data: { error: message },
          status,
          statusText: 'Bad Request',
          headers: {},
          config,
        }
      });
      return config;
    };

    // --- Authentication ---
    if (url.includes('/auth/login')) {
      const { role, identifier } = data;
      let userList = [];
      if (role === 'patient') userList = getLocal('mock_patients');
      else if (role === 'doctor') userList = getLocal('mock_doctors');
      else if (role === 'receptionist') userList = getLocal('mock_receptionists');
      else if (role === 'admin') userList = getLocal('mock_admins');

      const user = userList.find(u => u.email === identifier || u.phone === identifier);
      if (!user) return mockError('User not found', 404);
      return mockResponse({ token: 'mock-token', role, user });
    }

    if (url.includes('/auth/register')) {
      const { role, name, phone, email, ...rest } = data;
      let userList = getLocal('mock_patients');
      const newUser = { 
        _id: 'p_' + Date.now(), 
        name, 
        phone, 
        email, 
        allergies: [], 
        chronicConditions: [], 
        emergencyContact: { name: 'None', relation: '', phone: '' }, 
        ...rest 
      };
      userList.push(newUser);
      setLocal('mock_patients', userList);
      return mockResponse({ token: 'mock-token', role: 'patient', user: newUser });
    }

    if (url.includes('/auth/me')) {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token || !role) return mockError('Unauthorized', 401);

      let userList = [];
      if (role === 'patient') userList = getLocal('mock_patients');
      else if (role === 'doctor') userList = getLocal('mock_doctors');
      else if (role === 'receptionist') userList = getLocal('mock_receptionists');
      else if (role === 'admin') userList = getLocal('mock_admins');

      const user = userList[0];
      return mockResponse({ role, user });
    }

    // --- Categories & Hospitals ---
    if (url.includes('/appointments/categories')) {
      return mockResponse({ categories: getLocal('mock_categories') });
    }

    if (url.includes('/appointments/hospitals')) {
      return mockResponse({ hospitals: getLocal('mock_hospitals') });
    }

    if (url.includes('/appointments/available-doctors')) {
      return mockResponse({ doctors: getLocal('mock_doctors') });
    }

    // --- Book Appointment ---
    if (url.includes('/appointments/book')) {
      const { doctorId, hospitalId, slotDate, slotTime } = data;
      const appts = getLocal('mock_appointments');
      const patients = getLocal('mock_patients');
      const doctors = getLocal('mock_doctors');
      const hospitals = getLocal('mock_hospitals');

      const newAppt = {
        _id: 'appt_' + Date.now(),
        patient: patients[0],
        doctor: doctors.find(d => d._id === doctorId),
        hospital: hospitals.find(h => h._id === hospitalId),
        slotDate,
        slotTime,
        status: 'pending_payment',
        isEmergency: false,
        checkedInAt: null,
        noShowCallTriggered: false,
        payment: null,
        createdAt: new Date().toISOString(),
      };
      appts.push(newAppt);
      setLocal('mock_appointments', appts);
      return mockResponse({ appointment: newAppt }, 201);
    }

    // --- Payments ---
    if (url.includes('/payments/create-order')) {
      const { appointmentId, amount } = data;
      const payments = getLocal('mock_payments');

      const newPayment = {
        _id: 'pay_' + Date.now(),
        appointment: appointmentId,
        patient: 'p1',
        amount,
        status: 'created',
        razorpayOrderId: 'order_' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      payments.push(newPayment);
      setLocal('mock_payments', payments);

      return mockResponse({
        order: { id: newPayment.razorpayOrderId, amount: amount * 100, currency: 'INR' },
        paymentId: newPayment._id,
        keyId: 'rzp_test_mockkey'
      });
    }

    if (url.includes('/payments/verify')) {
      const { paymentId } = data;
      const payments = getLocal('mock_payments');
      const appts = getLocal('mock_appointments');

      const payIdx = payments.findIndex(p => p._id === paymentId);
      if (payIdx !== -1) {
        payments[payIdx].status = 'success';
        payments[payIdx].razorpayPaymentId = 'pay_succ_' + Date.now();
        setLocal('mock_payments', payments);

        const apptIdx = appts.findIndex(a => a._id === payments[payIdx].appointment);
        if (apptIdx !== -1) {
          appts[apptIdx].status = 'booked';
          appts[apptIdx].payment = payments[payIdx];
          setLocal('mock_appointments', appts);
        }
        return mockResponse({ success: true });
      }
      return mockError('Payment not found', 404);
    }

    // --- AI Calls & Logs ---
    if (url.includes('/calls/logs')) {
      return mockResponse({ logs: getLocal('mock_call_logs') });
    }

    if (url.match(/\/calls\/trigger-noshow\/.*/)) {
      const apptId = url.split('/').pop();
      const appts = getLocal('mock_appointments');
      const callLogs = getLocal('mock_call_logs');
      const idx = appts.findIndex(a => a._id === apptId);

      if (idx !== -1) {
        appts[idx].status = 'rescheduled';
        appts[idx].noShowCallTriggered = true;
        
        const nextDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
        appts[idx].slotDate = nextDate;
        appts[idx].slotTime = "14:00";
        setLocal('mock_appointments', appts);

        const newLog = {
          _id: 'log_' + Date.now(),
          appointment: appts[idx],
          patient: appts[idx].patient,
          twilioCallSid: 'CA_trigger_' + Date.now(),
          callStatus: 'completed',
          languageSelected: 'en-IN',
          missedReason: 'Forgot the scheduled time slot',
          rawSpeechTranscript: 'please change it to day after tomorrow afternoon at 2 PM',
          rescheduledToDate: nextDate,
          rescheduledToTime: '14:00',
          createdAt: new Date().toISOString(),
        };
        callLogs.push(newLog);
        setLocal('mock_call_logs', callLogs);

        return mockResponse({ success: true, callSid: newLog.twilioCallSid });
      }
      return mockError('Appointment not found', 404);
    }

    if (url.includes('/appointments/my')) {
      return mockResponse({ appointments: getLocal('mock_appointments') });
    }

    if (url.includes('/appointments/doctor')) {
      return mockResponse({ appointments: getLocal('mock_appointments') });
    }

    if (url.includes('/appointments/hospital')) {
      return mockResponse({ appointments: getLocal('mock_appointments') });
    }

    if (url.match(/\/appointments\/.*\/check-in/)) {
      const apptId = url.split('/')[2];
      const appts = getLocal('mock_appointments');
      const idx = appts.findIndex(a => a._id === apptId);
      if (idx !== -1) {
        appts[idx].checkedInAt = new Date().toISOString();
        setLocal('mock_appointments', appts);
        return mockResponse({ appointment: appts[idx] });
      }
      return mockError('Appointment not found', 404);
    }

    if (url.match(/\/appointments\/.*\/complete/)) {
      const apptId = url.split('/')[2];
      const appts = getLocal('mock_appointments');
      const idx = appts.findIndex(a => a._id === apptId);
      if (idx !== -1) {
        appts[idx].status = 'completed';
        setLocal('mock_appointments', appts);
        return mockResponse({ appointment: appts[idx] });
      }
      return mockError('Appointment not found', 404);
    }

    if (url.match(/\/appointments\/.*\/cancel/)) {
      const apptId = url.split('/')[2];
      const appts = getLocal('mock_appointments');
      const idx = appts.findIndex(a => a._id === apptId);
      if (idx !== -1) {
        appts[idx].status = 'cancelled';
        setLocal('mock_appointments', appts);
        return mockResponse({ appointment: appts[idx] });
      }
      return mockError('Appointment not found', 404);
    }

    // --- Medical Records & Scanning Reports ---
    if (url.includes('/medical-records/my')) {
      return mockResponse({ records: getLocal('mock_records') });
    }

    if (url.includes('/medical-records/doctor')) {
      return mockResponse({ records: getLocal('mock_records') });
    }

    if (url === '/medical-records' && method === 'POST') {
      const { patient, appointment, diagnosis, symptoms, prescription, notes, vitalSigns, uploadedBy, reportType } = data;
      const records = getLocal('mock_records');
      const patients = getLocal('mock_patients');
      const doctors = getLocal('mock_doctors');
      const appts = getLocal('mock_appointments');

      const targetAppt = appts.find(a => a._id === appointment);
      const linkedDoctor = targetAppt?.doctor || doctors[0];

      const newRec = {
        _id: 'rec_' + Date.now(),
        patient: patients.find(p => p._id === patient) || patients[0],
        doctor: linkedDoctor,
        appointment: targetAppt || null,
        diagnosis,
        symptoms: symptoms || [],
        prescription: prescription || [],
        notes,
        vitalSigns: vitalSigns || {},
        uploadedBy: uploadedBy || 'doctor',
        reportType: reportType || 'Prescription',
        createdAt: new Date().toISOString(),
      };
      records.push(newRec);
      setLocal('mock_records', records);
      return mockResponse({ record: newRec }, 201);
    }

    // --- AI Medical Summary Generation ---
    if (url.includes('/medical-records/ai-summary')) {
      const records = getLocal('mock_records');
      if (records.length === 0) {
        return mockResponse({ summary: "No medical history recorded yet." });
      }
      
      const summaryText = "### MedCare AI — Health History Summary\n\n" +
        `* **Total Diagnostic Visits**: ${records.filter(r => r.reportType === 'Prescription').length}\n` +
        `* **Lab & Scan Reports**: ${records.filter(r => r.reportType !== 'Prescription').length}\n\n` +
        "#### Timeline & Diagnoses:\n" +
        records.map(r => {
          const uBy = r.uploadedBy === 'receptionist' ? `Receptionist (${r.appointment?.hospital?.name || 'Hospital'})` : `Dr. ${r.doctor?.name}`;
          return `- **${new Date(r.createdAt).toLocaleDateString()}**: ${r.diagnosis} (Type: ${r.reportType}, by ${uBy}).\n  *Notes:* ${r.notes || 'None'}`;
        }).join('\n') +
        "\n\n#### Advice:\nPatient has mild Hypertension history. Advised regular salt monitoring and BP checks.";

      return mockResponse({ summary: summaryText });
    }

    // --- Admin Stats ---
    if (url.includes('/admin/stats')) {
      const patients = getLocal('mock_patients');
      const doctors = getLocal('mock_doctors');
      const appts = getLocal('mock_appointments');
      const hospitals = getLocal('mock_hospitals');
      const payments = getLocal('mock_payments');

      const totalRevenue = payments.filter(p => p.status === 'success').reduce((acc, curr) => acc + curr.amount, 0);

      return mockResponse({
        counts: { patients: patients.length, doctors: doctors.length, appointments: appts.length, hospitals: hospitals.length },
        totalRevenue,
        statusCounts: { booked: appts.filter(a => a.status === 'booked').length, completed: appts.filter(a => a.status === 'completed').length, cancelled: appts.filter(a => a.status === 'cancelled').length },
        recentAppointments: appts.slice(0, 5),
      });
    }

    if (url.includes('/admin/hospitals')) {
      if (method === 'POST') {
        const list = getLocal('mock_hospitals');
        const newItem = { _id: 'h_' + Date.now(), ...data };
        list.push(newItem);
        setLocal('mock_hospitals', list);
        return mockResponse({ hospital: newItem }, 201);
      }
      if (method === 'PUT') {
        const id = url.split('/').pop();
        const list = getLocal('mock_hospitals');
        const idx = list.findIndex(item => item._id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...data };
          setLocal('mock_hospitals', list);
          return mockResponse({ hospital: list[idx] });
        }
      }
      if (method === 'DELETE') {
        const id = url.split('/').pop();
        let list = getLocal('mock_hospitals');
        list = list.filter(item => item._id !== id);
        setLocal('mock_hospitals', list);
        return mockResponse({ success: true });
      }
      return mockResponse({ hospitals: getLocal('mock_hospitals') });
    }

    if (url.includes('/admin/categories')) {
      return mockResponse({ categories: getLocal('mock_categories') });
    }

    if (url.includes('/admin/patients')) {
      return mockResponse({ patients: getLocal('mock_patients') });
    }

    if (url.includes('/admin/doctors')) {
      return mockResponse({ doctors: getLocal('mock_doctors') });
    }

    if (url.includes('/admin/receptionists')) {
      return mockResponse({ receptionists: getLocal('mock_receptionists') });
    }

    // --- Reports ---
    if (url.includes('/reports/appointments')) {
      const appts = getLocal('mock_appointments');
      return mockResponse({
        byStatus: [
          { _id: 'booked', count: appts.filter(a => a.status === 'booked').length },
          { _id: 'completed', count: appts.filter(a => a.status === 'completed').length },
          { _id: 'cancelled', count: appts.filter(a => a.status === 'cancelled').length },
        ],
        byDoctor: [
          { doctorName: 'Dr. Rajesh Kumar', count: 8 },
          { doctorName: 'Dr. Priya Sharma', count: 6 },
          { doctorName: 'Dr. Amit Patel', count: 4 },
        ],
        byMonth: [
          { _id: '2026-05', count: 15 },
          { _id: '2026-06', count: 22 },
          { _id: '2026-07', count: appts.length },
        ],
      });
    }

    if (url.includes('/reports/revenue')) {
      const payments = getLocal('mock_payments').filter(p => p.status === 'success');
      const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);
      return mockResponse({
        byMonth: [
          { _id: '2026-05', total: 7500, count: 15 },
          { _id: '2026-06', total: 11000, count: 22 },
          { _id: '2026-07', total: totalRevenue - 18500, count: payments.length - 37 },
        ],
        totalRevenue,
        totalPayments: payments.length,
      });
    }

    // --- AI Health Assistant (personalized based on past records!) ---
    if (url.includes('/health-assistant/chat')) {
      const records = getLocal('mock_records');
      const latestRecord = records[0]; // get patient's diagnosis
      
      const replies = [
        `I see in your Lifetime Patient Records that you were recently diagnosed with "${latestRecord?.diagnosis || 'Seasonal Allergies'}" on ${new Date(latestRecord?.createdAt).toLocaleDateString()}. For this condition, it is recommended to stay hydrated and follow the dosage of your prescribed medications. Do you have any specific symptoms today?`,
        `Referring to your health timeline, you have a record of "${latestRecord?.diagnosis || 'Seasonal Allergies'}". Common self-care includes resting, monitoring your symptoms, and contacting your doctor if you experience difficulty breathing or a spike in fever.`,
        "Based on your diagnostic logs, your last recorded blood pressure was 135/85 mmHg. This is slightly elevated, so I recommend reducing salt intake, staying stress-free, and monitoring it twice a week as advised in your history."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      return mockResponse({ reply: randomReply });
    }

    return config;
  });
}

export default api;
