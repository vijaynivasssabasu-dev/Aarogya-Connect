import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'patient', label: 'Patient', color: 'bg-primary-500' },
  { value: 'doctor', label: 'Doctor', color: 'bg-teal-500' },
  { value: 'receptionist', label: 'Receptionist', color: 'bg-purple-500' },
  { value: 'admin', label: 'Admin', color: 'bg-slate-700' },
];

export default function LoginPage() {
  const [role, setRole] = useState('patient');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const data = await login({ role, identifier, password });
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(`/${data.role}`);
    } catch (err) { toast.error(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl" /><div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-400 rounded-full blur-3xl" /></div>
        <div className="relative z-10"><div className="flex items-center gap-3 mb-2"><div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"><Heart className="w-7 h-7" /></div><h1 className="text-3xl font-bold">MedCare AI</h1></div><p className="text-primary-200 text-lg">AI-Powered Healthcare Management</p></div>
        <div className="relative z-10 space-y-4">{['Smart Appointment Booking', 'AI Health Assistant', 'AI Missed Appointment Calls', 'Integrated Payments'].map((f, i) => (<div key={i} className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">{i + 1}</div><span className="text-primary-100">{f}</span></div>))}</div>
        <p className="relative z-10 text-primary-300 text-sm">&copy; 2026 MedCare AI. All rights reserved.</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center"><Heart className="w-6 h-6 text-white" /></div><h1 className="text-2xl font-bold text-gray-900">MedCare AI</h1></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your account to continue</p>
          <div className="grid grid-cols-4 gap-2 mb-6">{ROLES.map((r) => (<button key={r.value} onClick={() => setRole(r.value)} className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all duration-200 ${role === r.value ? `${r.color} text-white shadow-md scale-[1.02]` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{r.label}</button>))}</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Phone</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="input-field pl-10" placeholder="Enter your email or phone" required /></div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 pr-10" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div></div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">{loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : 'Sign In'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">Don't have an account?{' '}<Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
