import { useCartDispatch } from '../context/CartContext.jsx';
import { useWishlistDispatch, useWishlistState } from '../context/WishlistContext.jsx';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const { items } = useWishlistState();
  const wishlistDispatch = useWishlistDispatch();
  const cartDispatch = useCartDispatch();

  const removeFromWishlist = (product) => {
    wishlistDispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product });
    toast.success('Removed from wishlist');
  };

  const moveToCart = (item) => {
    cartDispatch({
      type: 'ADD_TO_CART',
      payload: {
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: 1
      }
    });
    removeFromWishlist(item.product);
    toast.success('Moved to cart');
  };

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h1 data-reveal className="text-3xl font-semibold">Wishlist</h1>
        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#1A2744]">Your wishlist is empty.</p>
            <p className="mt-3 text-sm text-slate-500">Browse the shop to save your favorite stationery items.</p>
            <Link to="/shop" className="mt-6 inline-flex rounded-3xl bg-[#D4A017] px-6 py-3 text-sm font-semibold text-[#1A2744]">Shop Now</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {items.map((item) => (
              <div key={item.product} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                <img src={item.image} alt={item.name} className="h-28 w-28 rounded-3xl object-cover" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[#1A2744]">{item.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">PKR {item.price}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="rounded-3xl bg-[#D4A017] px-5 py-3 text-sm font-semibold text-[#1A2744]"
                    onClick={() => moveToCart(item)}
                  >
                    Move to Cart
                  </button>
                  <button
                    className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm"
                    onClick={() => removeFromWishlist(item.product)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default WishlistPage;
