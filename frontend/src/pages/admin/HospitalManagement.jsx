import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HospitalManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', city: '', address: '', phone: '' });

  const fetch = () => { api.get('/admin/hospitals').then(({ data }) => setHospitals(data.hospitals)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', city: '', address: '', phone: '' }); setShowModal(true); };
  const openEdit = (h) => { setEditing(h); setForm({ name: h.name, city: h.city, address: h.address || '', phone: h.phone || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/admin/hospitals/${editing._id}`, form); toast.success('Hospital updated'); }
      else { await api.post('/admin/hospitals', form); toast.success('Hospital created'); }
      setShowModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this hospital?')) return;
    try { await api.delete(`/admin/hospitals/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hospital Management</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Hospital</button>
      </div>
      <div className="grid gap-4">
        {hospitals.map(h => (
          <div key={h._id} className="card !p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center"><Building2 className="w-6 h-6 text-primary-600" /></div>
            <div className="flex-1"><p className="font-semibold">{h.name}</p><p className="text-sm text-gray-500">{h.city} • {h.address}</p></div>
            <button onClick={() => openEdit(h)} className="p-2 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-500" /></button>
            <button onClick={() => handleDelete(h._id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Hospital' : 'Add Hospital'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input-field" /></div>
          <button type="submit" className="btn-primary w-full">{editing ? 'Update' : 'Create'}</button>
        </form>
      </Modal>
    </div>
  );
}
