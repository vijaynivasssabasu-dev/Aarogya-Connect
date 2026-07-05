import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, User, Mail, Phone, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', dob: '', gender: '', bloodGroup: '', address: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP Verification States
  const [step, setStep] = useState('input_details'); // 'input_details' or 'verify_otp'
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (!formData.phone.trim()) return toast.error('Please specify your phone number');

    setLoading(true);
    // Simulate sending OTP via Twilio Verify
    setTimeout(() => {
      setSentOtp('123456'); // Mock OTP code
      setStep('verify_otp');
      setLoading(false);
      toast.success(`Verification code dispatched to ${formData.phone}!`);
    }, 1200);
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (otpCode !== '123456') {
      return toast.error('Invalid OTP Verification Code. Please try again.');
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await register({ ...userData, role: 'patient' });
      toast.success('Phone verified! Account created successfully.');
      navigate('/patient');
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Registration failed'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MedCare AI</h1>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Create Patient Account</h2>
          <p className="text-gray-500 mb-6">Verify your phone number to maintain secure medical records.</p>
          
          {step === 'input_details' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input name="name" value={formData.name} onChange={handleChange} className="input-field pl-10" placeholder="Your full name" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="input-field pl-10" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (with country code) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input name="phone" value={formData.phone} onChange={handleChange} className="input-field pl-10" placeholder="+919876543210" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                  <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field">
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <input name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="Your address" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} className="input-field pl-10" placeholder="Min 6 characters" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} className="input-field pl-10" placeholder="Repeat password" required />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" onChange={() => setShowPassword(!showPassword)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-600">Show passwords</span>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : 'Send Verification SMS'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <div className="bg-primary-50 border border-primary-100 p-4 rounded-2xl flex gap-3">
                <ShieldCheck className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-primary-950 text-sm">Security Verification</h3>
                  <p className="text-xs text-primary-700 mt-0.5">We sent a 6-digit passcode to **{formData.phone}**. Enter it below to complete verification.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Enter Verification Code (OTP)</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    maxLength={6} 
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP code"
                    className="input-field pl-10 tracking-widest text-center text-base font-extrabold focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center text-xs text-gray-500 font-semibold">
                💡 Mock Test Passcode: <span className="text-primary-600 font-extrabold">123456</span>
              </div>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setStep('input_details')}
                  className="btn-secondary w-1/3 text-xs"
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-primary w-2/3 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : 'Verify & Register'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
