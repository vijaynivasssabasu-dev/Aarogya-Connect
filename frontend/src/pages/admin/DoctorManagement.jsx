import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Stethoscope, Building2 } from 'lucide-react';

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/doctors'), api.get('/admin/categories')])
      .then(([dRes, cRes]) => { setDoctors(dRes.data.doctors); setCategories(cRes.data.categories); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <h1 className="page-header">Doctors & Categories</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Categories ({categories.length})</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => <span key={c._id} className="badge-info text-sm px-3 py-1.5">{c.categoryName}</span>)}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Doctors ({doctors.length})</h2>
      {doctors.length === 0 ? <EmptyState icon={Stethoscope} title="No doctors registered" /> : (
        <div className="grid gap-4">
          {doctors.map(d => (
            <div key={d._id} className="card !p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center font-bold text-teal-600">{d.name.charAt(0)}</div>
              <div className="flex-1">
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-gray-500">{d.category?.categoryName} • {d.email}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><Building2 className="w-3 h-3" /> {d.hospital?.name}, {d.hospital?.city}</div>
              </div>
              <span className={`badge ${d.availabilityStatus === 'available' ? 'badge-success' : 'badge-warning'}`}>{d.availabilityStatus}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
