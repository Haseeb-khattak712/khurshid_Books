import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartState, useCartDispatch } from '../context/CartContext.jsx';
import { useAuthState } from '../hooks/useAuth.js';
import api from '../services/api.js';
import { toast } from 'react-hot-toast';
import { CheckCircle2, MapPin, CreditCard, ClipboardList } from 'lucide-react';

const STEPS = ['Shipping', 'Payment', 'Review'];

const CheckoutPage = () => {
  const { items } = useCartState();
  const { clearCart } = useCartDispatch(); // <-- FIX: destructure helper
  const { user } = useAuthState();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [province, setProvince] = useState(user?.address?.province || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
  const [country, setCountry] = useState(user?.address?.country || 'Pakistan');

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 1500 ? 0 : 150;
  const tax = Number((subtotal * 0.17).toFixed(2));
  const total = subtotal + shipping + tax;

  const handleShippingNext = (e) => {
    e.preventDefault();
    if (!street || !city || !province || !postalCode || !country) {
      toast.error('Please fill in all shipping fields');
      return;
    }
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product || item._id || item.id, // defensive fallback
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || '/roots.png'
      }));

      const shippingAddress = { street, city, province, postalCode, country };

      const { data } = await api.post('/orders', {
        orderItems,
        shippingAddress,
        paymentMethod
      });

      if (!data?.success) {
        toast.error(data?.message || 'Order could not be placed. Please try again.');
        return;
      }

      const orderId = data?.data?._id || data?.data?.id || data?._id;
      if (!orderId) {
        toast.error('Order created but ID missing. Check your orders page.');
        return;
      }

      clearCart(); // <-- FIX: use helper, not cartDispatch({ type: 'CLEAR_CART' })
      toast.success('Order placed successfully!');
      navigate(`/order/${orderId}`);
    } catch (error) {
      console.error('Place order error:', error.response?.data || error.message);
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Server error. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="bg-[#FAF8F3] text-[#2C2C2C] min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">Nothing to check out</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Your cart is empty. Add some items first.</p>
          <Link to="/shop" className="btn-primary mt-6">Browse Shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C] min-h-[70vh] pb-16">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <h1 className="font-serif text-3xl font-semibold text-[var(--ink)]">Checkout</h1>

        <div className="mt-6 mb-8 flex items-center gap-0">
          {STEPS.map((label, i) => {
            const Icon = i === 0 ? MapPin : i === 1 ? CreditCard : ClipboardList;
            const isCompleted = i < step;
            const isActive = i === step;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-[var(--brass)] text-[var(--ink)]'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                  </div>
                  <span className={`mt-1 text-xs font-semibold ${isActive ? 'text-[var(--brass)]' : isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? 'bg-green-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            {step === 0 && (
              <form onSubmit={handleShippingNext} className="space-y-5">
                <h2 className="font-serif text-xl font-semibold text-[var(--ink)] border-b border-[var(--line)] pb-3">
                  Shipping Address
                </h2>
                <label className="block text-sm font-medium text-slate-700">
                  Street / House No.
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House #, street name, area"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    City
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Lahore"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Province
                    <input
                      type="text"
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="Punjab"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Postal Code
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="54000"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Country
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Pakistan"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                    />
                  </label>
                </div>
                <button type="submit" className="btn-primary w-full py-3 text-sm font-semibold">
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-serif text-xl font-semibold text-[var(--ink)] border-b border-[var(--line)] pb-3">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {['Cash on Delivery', 'Card (Coming Soon)'].map((method) => {
                    const disabled = method === 'Card (Coming Soon)';
                    return (
                      <label
                        key={method}
                        className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                          !disabled && paymentMethod === method
                            ? 'border-[var(--brass)] bg-amber-50'
                            : disabled
                            ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                            : 'border-slate-200 hover:border-[var(--brass)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          disabled={disabled}
                          checked={paymentMethod === method}
                          onChange={() => !disabled && setPaymentMethod(method)}
                          className="accent-[var(--brass)]"
                        />
                        <span className="text-sm font-medium text-[var(--ink)]">{method}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="btn-secondary py-3 px-6 text-sm"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn-primary flex-1 py-3 text-sm font-semibold"
                    onClick={() => setStep(2)}
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-serif text-xl font-semibold text-[var(--ink)] border-b border-[var(--line)] pb-3">
                  Review Your Order
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product || item._id || item.id} className="flex items-center gap-3">
                      <img src={item.image || '/roots.png'} alt={item.name} className="h-12 w-12 rounded-xl object-cover border border-slate-100" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--ink)]">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-[var(--ink)]">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping to:</span>
                    <span className="font-medium text-right text-[var(--ink)] max-w-[220px]">
                      {street}, {city}, {province} {postalCode}, {country}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payment:</span>
                    <span className="font-medium text-[var(--ink)]">{paymentMethod}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="btn-secondary py-3 px-6 text-sm"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    className="btn-primary flex-1 py-3 text-sm font-semibold disabled:opacity-60"
                    onClick={handlePlaceOrder}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
            <h3 className="font-serif text-lg font-semibold text-[#1A2744] border-b border-[var(--line)] pb-3">Summary</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-medium text-[var(--ink)]">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-[var(--ink)]">
                  {shipping === 0 ? <span className="text-green-600">Free</span> : `Rs. ${shipping}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST 17%)</span>
                <span className="font-medium text-[var(--ink)]">Rs. {tax.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-base font-bold text-[#1A2744]">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;