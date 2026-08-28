import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import { supabase } from '../services/supabase.js';
import Spinner from '../components/Spinner.jsx';
import { useAuthState } from '../hooks/useAuth.js';

const STATUS_STYLES = {
  pending:    'text-amber-700 bg-amber-50 border-amber-200',
  processing: 'text-blue-700 bg-blue-50 border-blue-200',
  shipped:    'text-indigo-700 bg-indigo-50 border-indigo-200',
  delivered:  'text-green-700 bg-green-50 border-green-200',
  cancelled:  'text-red-700 bg-red-50 border-red-200',
};

const OrderHistoryPage = () => {
  const { user } = useAuthState();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <main className="bg-[#FAF8F3] text-[#2C2C2C] min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">Login required</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Please log in to view your order history.</p>
          <Link to="/login" className="btn-primary mt-6">Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C] min-h-[60vh] pb-16">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8">
          <span className="label-tag">Account</span>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[var(--ink)]">Order History</h1>
        </div>

        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D4A017]/10 text-[#D4A017] mb-4">
              <PackageOpen size={28} />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[var(--ink)]">No orders yet</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              You haven&apos;t placed any orders. Start shopping to see your history here.
            </p>
            <Link to="/shop" className="btn-primary mt-6">Shop Now</Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Table header (hidden on mobile) */}
            <div className="hidden grid-cols-[1fr_120px_120px_120px_100px] gap-4 px-6 py-3 bg-[#EDE8DE] text-xs font-semibold uppercase tracking-wider text-slate-600 sm:grid">
              <span>Order Details</span>
              <span className="text-center">Date</span>
              <span className="text-right">Total</span>
              <span className="text-center">Status</span>
              <span className="text-center">Action</span>
            </div>

            <div className="divide-y divide-slate-100">
              {orders.map((order) => {
                const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                return (
                  <div
                    key={order._id}
                    className="grid grid-cols-1 gap-3 px-6 py-5 hover:bg-slate-50 transition sm:grid-cols-[1fr_120px_120px_120px_100px] sm:items-center sm:gap-4"
                  >
                    {/* Order ID + items count */}
                    <div>
                      <p className="font-mono text-xs text-[var(--text-muted)] truncate max-w-[240px]">#{order.id}</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                        {order.order_items?.length} item{order.order_items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-slate-500 sm:text-center">
                      {new Date(order.created_at).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>

                    {/* Total */}
                    <p className="text-sm font-bold text-[var(--ink)] sm:text-right">
                      Rs. {order.total_price?.toLocaleString()}
                    </p>

                    {/* Status badge */}
                    <div className="sm:text-center">
                      <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${statusStyle}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* View button */}
                    <div className="sm:text-center">
                      <Link
                        to={`/order/${order.id}`}
                        className="inline-block rounded-full border border-[#D4A017] px-4 py-1.5 text-xs font-semibold text-[#1A2744] hover:bg-[#D4A017]/10 transition"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default OrderHistoryPage;
