import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowLeft, ShieldAlert, User } from 'lucide-react';
import { supabase } from '../../services/supabase.js';
import Spinner from '../../components/Spinner.jsx';
import { toast } from 'react-hot-toast';
import { useAuthState } from '../../hooks/useAuth.js';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuthState();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (id === currentUser?._id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      toast.success(`User "${name}" deleted`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C] min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/admin" className="text-[var(--brass)] hover:underline text-sm flex items-center gap-1">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="font-serif text-2xl font-semibold text-[#1A2744]">Manage Users</h1>
          {!loading && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {users.length}
            </span>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-[var(--text-muted)]">No users found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EDE8DE] text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id || u.id === currentUser?._id;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition ${isSelf ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${u.role === 'admin' ? 'bg-[var(--brass)]/15 text-[var(--brass)]' : 'bg-slate-100 text-slate-500'}`}>
                            {u.role === 'admin' ? <ShieldAlert size={15} /> : <User size={15} />}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--ink)]">
                              {u.full_name || u.name}
                              {isSelf && <span className="ml-2 text-xs text-[var(--brass)] font-normal">(you)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          u.role === 'admin'
                            ? 'bg-[var(--brass)]/10 border-[var(--brass)]/30 text-[var(--brass)]'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(u.created_at).toLocaleDateString('en-PK', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleDelete(u.id, u.full_name || u.name)}
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageUsers;
