import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, User, Mail, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', dob: '', gender: '', bloodGroup: '', address: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await register({ ...userData, role: 'patient' });
      toast.success('Account created!'); navigate('/patient');
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 justify-center mb-8"><div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center"><Heart className="w-6 h-6 text-white" /></div><h1 className="text-2xl font-bold text-gray-900">MedCare AI</h1></div>
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Create Patient Account</h2>
          <p className="text-gray-500 mb-6">Join MedCare AI to manage your healthcare</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input name="name" value={formData.name} onChange={handleChange} className="input-field pl-10" placeholder="Your full name" required /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input name="email" type="email" value={formData.email} onChange={handleChange} className="input-field pl-10" placeholder="your@email.com" /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input name="phone" value={formData.phone} onChange={handleChange} className="input-field pl-10" placeholder="+919876543210" required /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label><input name="dob" type="date" value={formData.dob} onChange={handleChange} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label><select name="gender" value={formData.gender} onChange={handleChange} className="input-field"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field"><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}</select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label><input name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="Your address" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} className="input-field pl-10" placeholder="Min 6 characters" required /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} className="input-field pl-10" placeholder="Repeat password" required /></div></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" onChange={() => setShowPassword(!showPassword)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm text-gray-600">Show passwords</span></div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">{loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : 'Create Account'}</button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
