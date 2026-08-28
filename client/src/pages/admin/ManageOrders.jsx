import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../services/supabase.js';
import Spinner from '../../components/Spinner.jsx';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLES = {
  pending:    'text-amber-700 bg-amber-50 border-amber-200',
  processing: 'text-blue-700 bg-blue-50 border-blue-200',
  shipped:    'text-indigo-700 bg-indigo-50 border-indigo-200',
  delivered:  'text-green-700 bg-green-50 border-green-200',
  cancelled:  'text-red-700 bg-red-50 border-red-200',
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast.success(`Order status updated to "${newStatus}"`);
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(null);
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
          <h1 className="font-serif text-2xl font-semibold text-[#1A2744]">Manage Orders</h1>
          {!loading && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {orders.length}
            </span>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-[var(--text-muted)]">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EDE8DE] text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-mono text-xs text-slate-500 max-w-[140px] truncate">
                        <Link to={`/order/${order.id}`} className="hover:text-[var(--brass)] hover:underline">
                          #{order.id.slice(-8)}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[var(--ink)]">{order.profiles?.full_name || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{order.profiles?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-PK', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 font-bold text-[var(--ink)]">
                        Rs. {order.total_price?.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">{order.payment_method}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyle}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="field py-1.5 text-xs w-36"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
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

export default ManageOrders;
