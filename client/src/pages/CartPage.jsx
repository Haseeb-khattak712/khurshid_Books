import { useCartState, useCartDispatch } from '../context/CartContext.jsx';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LazyImage from '../components/LazyImage.jsx';

const CartPage = () => {
  const { items } = useCartState();
  const { removeFromCart, updateQuantity, clearCart } = useCartDispatch();
  const navigate = useNavigate();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 1500 ? 0 : 150;
  const tax = Number((subtotal * 0.17).toFixed(2));
  const total = subtotal + shipping + tax;

  const updateQty = (productId, qty) => {
    if (qty < 1) return;
    updateQuantity(productId, qty);
  };

  const removeItem = (productId) => {
    removeFromCart(productId);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C] min-h-[70vh] pb-16">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-semibold text-[#1A2744]">Shopping Cart</h1>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-red-500 hover:text-red-700 transition"
            >
              Clear Cart
            </button>
          )}
        </div>
        
        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-2xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D4A017]/15 text-[#D4A017] mb-6">
              <ShoppingBag size={28} />
            </div>
            <p className="text-xl font-serif font-semibold text-[#1A2744]">Your cart is empty</p>
            <p className="mt-2 text-sm text-slate-500">Pick from our premium collection of textbooks, notebooks, art items, and stationery essentials.</p>
            <Link to="/shop" className="inline-block mt-6 rounded-full bg-[#D4A017] px-6 py-3 text-sm font-bold text-[#1A2744] hover:opacity-90 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.product || item._id || item.id || index} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <LazyImage
                      src={item.images && item.images.length > 0 ? (item.images[0].startsWith('http') ? item.images[0] : `http://localhost:5000${item.images[0]}`) : item.image || '/roots.png'}
                      alt={item.name}
                      className="h-20 w-20 rounded-2xl object-cover border border-slate-100 shrink-0"
                      width="80"
                      height="80"
                    />
                    <div>
                      <h2 className="text-base font-semibold text-[#1A2744] hover:text-[#D4A017] transition">
                        <Link to={`/product/${item.product || item._id || item.id}`}>{item.name}</Link>
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 font-medium">Rs. {item.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-6 sm:justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold transition"
                        onClick={() => updateQty(item.product, item.quantity - 1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-[32px] text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold transition"
                        onClick={() => updateQty(item.product, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-[#1A2744] min-w-[80px] text-right">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                        onClick={() => removeItem(item.product)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
              <h2 className="font-serif text-xl font-semibold text-[#1A2744] border-b border-slate-200 pb-3">Order Summary</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1A2744]">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-[#1A2744]">
                    {shipping === 0 ? <span className="text-green-600 font-semibold">Free</span> : `Rs. ${shipping}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax (GST 17%)</span>
                  <span className="font-medium text-[#1A2744]">Rs. {tax.toLocaleString()}</span>
                </div>
                {shipping > 0 && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                    Add <strong>Rs. {(1500 - subtotal).toLocaleString()}</strong> more to get Free Shipping!
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-lg font-bold text-[#1A2744]">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
              <button
                type="button"
                className="w-full mt-6 rounded-full bg-[#D4A017] px-6 py-3 text-sm font-bold text-[#1A2744] hover:opacity-90 transition flex items-center justify-center gap-1.5"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight size={15} />
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;