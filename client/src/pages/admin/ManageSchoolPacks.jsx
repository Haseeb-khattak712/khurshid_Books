import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Package, School } from 'lucide-react';
import api from '../../services/api.js';
import Spinner from '../../components/Spinner.jsx';
import SchoolPackForm from './SchoolPackForm.jsx';
import { toast } from 'react-hot-toast';

const ManageSchoolPacks = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPack, setEditingPack] = useState(null);

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/school-packs');
      if (data.success) setPacks(data.data);
    } catch (error) {
      toast.error('Failed to load school packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete pack "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/school-packs/${id}`);
      toast.success(`"${name}" deleted`);
      fetchPacks();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete pack');
    }
  };

  const handleEdit = (pack) => {
    setEditingPack(pack);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingPack(null);
    setShowForm(true);
  };

  const handleSave = (savedPack) => {
    if (editingPack) {
      setPacks((prev) =>
        prev.map((p) => (p._id === savedPack._id ? savedPack : p))
      );
    } else {
      setPacks((prev) => [savedPack, ...prev]);
    }
  };

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C] min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-[var(--brass)] hover:underline text-sm flex items-center gap-1">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="font-serif text-2xl font-semibold text-[#1A2744]">School Packs</h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {packs.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="btn-primary py-2 px-5 text-sm flex items-center gap-1.5"
          >
            <Plus size={15} /> New Pack
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : packs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Package size={40} className="mx-auto mb-4 text-slate-200" />
            <p className="text-[var(--text-muted)]">No school packs created yet.</p>
            <button onClick={handleCreate} className="btn-primary mt-4 py-2 px-5 text-sm">
              Create First Pack
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => (
              <div
                key={pack._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A017]/10">
                      <School size={18} className="text-[#D4A017]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A2744]">{pack.name}</h3>
                      <p className="text-xs text-slate-400">{pack.school} • {pack.grade}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      pack.isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {pack.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{pack.description}</p>

                <div className="space-y-2 mb-4">
                  {pack.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" />
                      <span className="text-slate-600 truncate">
                        {item.quantity}x {item.product?.name || item.name}
                      </span>
                    </div>
                  ))}
                  {pack.items?.length > 3 && (
                    <p className="text-xs text-slate-400 pl-3.5">+{pack.items.length - 3} more items</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-lg font-bold text-[#1A2744]">
                      Rs. {pack.discountPrice?.toLocaleString() || pack.price?.toLocaleString()}
                    </p>
                    {pack.discountPrice && (
                      <p className="text-xs text-slate-400 line-through">
                        Rs. {pack.price?.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(pack)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-[#D4A017] hover:bg-[#D4A017] hover:text-[#1A2744] transition"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(pack._id, pack.name)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SchoolPackForm
        pack={editingPack}
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingPack(null); }}
        onSave={handleSave}
      />
    </main>
  );
};

export default ManageSchoolPacks;