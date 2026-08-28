import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Clock } from 'lucide-react';
import { supabase } from '../services/supabase.js';
import Spinner from '../components/Spinner.jsx';
import LazyImage from '../components/LazyImage.jsx';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'text-amber-600 bg-amber-50 border-amber-200',    icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-600 bg-blue-50 border-blue-200',       icon: Package },
  shipped:    { label: 'Shipped',    color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'text-green-700 bg-green-50 border-green-200',    icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  color: 'text-red-600 bg-red-50 border-red-200',          icon: Clock },
};

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(!!sessionId);

  useEffect(() => {
    const verifyAndFetch = async () => {
      if (sessionId && verifying) {
        try {
          await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, order_id: id }),
          });
        } catch (e) {
          console.error('Verification failed', e);
        }
        setVerifying(false);
      }

      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
          
        if (fetchError) throw fetchError;

        if (data) {
          setOrder(data);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetch();
  }, [id, sessionId, verifying]);

  if (loading || verifying) {
    return <div className="py-20 bg-[#FAF8F3]"><Spinner /></div>;
  }

  if (error || !order) {
    return (
      <main className="bg-[#FAF8F3] text-[#2C2C2C] min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">Order Not Found</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
          <Link to="/orders" className="btn-primary mt-6">View My Orders</Link>
        </div>
      </main>
    );
  }

  const computedStatus = order.is_delivered ? 'delivered' : (order.is_paid ? 'processing' : 'pending');
  const statusInfo = STATUS_CONFIG[computedStatus] || STATUS_CONFIG.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C] pb-16">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <div className="text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#D4A017]/15 text-[#D4A017] mb-5">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[var(--ink)]">Order Confirmed!</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Thank you for your order. We&apos;ll send updates as it progresses.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          {/* Order Meta */}
          <div className="grid gap-4 sm:grid-cols-3 text-sm border-b border-[var(--line)] pb-5">
            <div>
              <p className="text-[var(--text-muted)] mb-1">Order ID</p>
              <p className="font-semibold text-[var(--ink)] font-mono text-xs">{order.id}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] mb-1">Date</p>
              <p className="font-semibold text-[var(--ink)]">
                {new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] mb-1">Status</p>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${statusInfo.color}`}>
                <StatusIcon size={12} /> {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h2 className="font-serif text-lg font-semibold text-[var(--ink)] mb-4">Items Ordered</h2>
            <div className="space-y-3">
              {order.order_items?.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <LazyImage
                    src="/roots.png"
                    alt={item.name}
                    className="h-14 w-14 rounded-2xl object-cover border border-slate-100 shrink-0"
                    width="56"
                    height="56"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--ink)] truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-[var(--ink)] whitespace-nowrap">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Pricing */}
          <div className="grid gap-4 sm:grid-cols-2 border-t border-[var(--line)] pt-5">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Shipping To</h3>
              <p className="text-sm text-[var(--ink)]">
                {order.shipping_address?.street}, {order.shipping_address?.city}
                <br />
                {order.shipping_address?.province} {order.shipping_address?.postalCode}
                <br />
                {order.shipping_address?.country}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Payment</h3>
              <p className="text-sm text-[var(--ink)] flex items-center gap-2">
                {order.payment_method} 
                {order.is_paid && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">PAID</span>}
              </p>
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {(order.total_price - 150).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.total_price >= 1500 ? 'Free' : `Rs. 150`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between font-bold text-[var(--ink)] border-t border-slate-100 pt-1 mt-1">
                  <span>Total</span>
                  <span>Rs. {order.total_price?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to="/shop" className="btn-primary py-3 px-8 text-sm font-semibold text-center">
            Continue Shopping
          </Link>
          <Link to="/orders" className="btn-secondary py-3 px-8 text-sm text-center">
            View All Orders
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmationPage;
