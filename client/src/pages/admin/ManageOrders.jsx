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
  
  // Tracking Modal State
  const [trackingModal, setTrackingModal] = useState({ isOpen: false, orderId: null, trackingNumber: '', courierName: '' });
  
  // Details Modal State
  const [detailsModal, setDetailsModal] = useState(null);

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
      
      // If status changed to shipped, open tracking modal automatically
      if (newStatus === 'shipped') {
        const order = orders.find(o => o.id === orderId);
        setTrackingModal({ 
          isOpen: true, 
          orderId, 
          trackingNumber: order?.tracking_number || '', 
          courierName: order?.courier_name || '' 
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleVerify = async (orderId, currentStatus) => {
    setUpdating(orderId);
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('orders')
        .update({ is_verified: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, is_verified: newStatus } : o)));
      toast.success(`Order marked as ${newStatus ? 'Verified' : 'Unverified'}`);
    } catch (error) {
      toast.error(error.message || 'Failed to verify order');
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveTracking = async () => {
    if (!trackingModal.orderId) return;
    setUpdating(trackingModal.orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingModal.trackingNumber,
          courier_name: trackingModal.courierName
        })
        .eq('id', trackingModal.orderId);

      if (error) throw error;

      setOrders((prev) => prev.map((o) => (o.id === trackingModal.orderId ? { 
        ...o, 
        tracking_number: trackingModal.trackingNumber,
        courier_name: trackingModal.courierName
      } : o)));
      
      toast.success('Tracking information saved');
      setTrackingModal({ isOpen: false, orderId: null, trackingNumber: '', courierName: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to save tracking info');
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
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-mono text-xs text-slate-500 max-w-[140px] truncate">
                        <button onClick={() => setDetailsModal(order)} className="hover:text-[var(--brass)] hover:underline font-bold text-[#1A2744]">
                          #{order.id.slice(-8)}
                        </button>
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
                        <div className="flex flex-col gap-2">
                          <select
                            value={order.status}
                            disabled={updating === order.id}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="field py-1.5 text-xs w-full max-w-[150px]"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} className="capitalize">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerify(order.id, order.is_verified)}
                              disabled={updating === order.id}
                              className={`px-2 py-1 text-xs rounded border font-semibold ${
                                order.is_verified 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {order.is_verified ? 'Verified' : 'Verify'}
                            </button>
                            
                            <Link
                              to={`/admin/print/${order.id}`}
                              target="_blank"
                              className="px-2 py-1 text-xs rounded border border-[#D4A017] text-[#1A2744] hover:bg-[#D4A017]/10 font-semibold text-center"
                            >
                              Print
                            </Link>
                          </div>
                          
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => setTrackingModal({
                                isOpen: true,
                                orderId: order.id,
                                trackingNumber: order.tracking_number || '',
                                courierName: order.courier_name || ''
                              })}
                              className="text-xs text-[var(--brass)] hover:underline text-left"
                            >
                              {order.tracking_number ? 'Edit Tracking' : '+ Add Tracking'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {trackingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-serif text-lg font-semibold text-[var(--ink)] mb-4">Tracking Information</h3>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Courier Name
                <input
                  type="text"
                  value={trackingModal.courierName}
                  onChange={(e) => setTrackingModal(prev => ({ ...prev, courierName: e.target.value }))}
                  placeholder="e.g. TCS, Leopards"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-[#FAF8F3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Tracking Number
                <input
                  type="text"
                  value={trackingModal.trackingNumber}
                  onChange={(e) => setTrackingModal(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="e.g. 1234567890"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-[#FAF8F3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                />
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModal({ isOpen: false, orderId: null, trackingNumber: '', courierName: '' })}
                  className="flex-1 btn-secondary py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTracking}
                  className="flex-1 btn-primary py-2 text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {detailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-full flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[var(--ink)]">Order Details</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: #{detailsModal.id}</p>
              </div>
              <button 
                onClick={() => setDetailsModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer</h4>
                  <p className="font-semibold text-sm">{detailsModal.profiles?.full_name || 'Guest'}</p>
                  <p className="text-sm text-slate-600">{detailsModal.profiles?.email}</p>
                  <p className="text-sm text-slate-600 mt-2">Phone: {detailsModal.shipping_address?.phone}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shipping Address</h4>
                  <p className="text-sm text-slate-700">
                    {detailsModal.shipping_address?.street}, {detailsModal.shipping_address?.city}
                  </p>
                  <p className="text-sm text-slate-700">
                    {detailsModal.shipping_address?.province}, {detailsModal.shipping_address?.postalCode}
                  </p>
                </div>
              </div>

              <h4 className="font-serif text-lg font-semibold text-[var(--ink)] mb-3">Items Ordered</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Product Name</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-center">Qty</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-right">Price</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailsModal.order_items?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-[var(--ink)]">{item.name}</td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">Rs. {item.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rs. {(detailsModal.total_price - 150).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>Rs. 150</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-[var(--ink)] border-t border-slate-200 pt-2 mt-2">
                    <span>Total:</span>
                    <span>Rs. {detailsModal.total_price?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Link 
                to={`/admin/print/${detailsModal.id}`} 
                target="_blank"
                className="btn-primary py-2 px-6 text-sm"
              >
                Print Invoice
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageOrders;
