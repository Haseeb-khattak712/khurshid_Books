import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCartDispatch } from '../context/CartContext.jsx';
import { useWishlistDispatch, useWishlistState } from '../context/WishlistContext.jsx';
import api from '../services/api.js';
import Spinner from '../components/Spinner.jsx';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const cartDispatch = useCartDispatch();
  const wishlistDispatch = useWishlistDispatch();
  const { items: wishlistItems } = useWishlistState();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        if (data.success) {
          setProduct(data.data);
        }
      } catch (error) {
        console.error('Error fetching product detail:', error);
        toast.error('Product not found or error loading details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const addToCart = () => {
    if (!product) return;
    const finalPrice = product.discountPrice || product.price;

    cartDispatch({
      type: 'ADD_TO_CART',
      payload: {
        product: product._id,
        name: product.name,
        image: product.images?.[0] || '/placeholder.png',
        price: finalPrice,
        quantity
      }
    });
    toast.success('Item added to cart');
  };

  const addToWishlist = () => {
    if (!product) return;
    const alreadySaved = wishlistItems.some((item) => item.product === product._id);
    if (alreadySaved) {
      toast('Item already in wishlist');
      return;
    }

    const finalPrice = product.discountPrice || product.price;
    wishlistDispatch({
      type: 'ADD_TO_WISHLIST',
      payload: {
        product: product._id,
        name: product.name,
        image: product.images?.[0] || '/placeholder.png',
        price: finalPrice
      }
    });
    toast.success('Item added to wishlist');
  };

  if (loading) {
    return (
      <div className="py-20 bg-[#FAF8F3]">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 bg-[#FAF8F3] text-center">
        <div className="mx-auto max-w-md px-4">
          <h2 className="font-serif text-3xl font-semibold text-[var(--ink)]">Shelf is empty</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">We couldn&apos;t find this book or stationery item on our shelves.</p>
          <Link to="/shop" className="btn-primary mt-6">
            <ArrowLeft size={16} /> Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C] pb-16">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brass)] transition hover:gap-2 mb-6">
          <ArrowLeft size={15} /> Back to shop
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl bg-slate-100 p-2 flex items-center justify-center overflow-hidden h-[360px]">
                <img
                  src={product.images?.[0] || '/placeholder.png'}
                  alt={product.name}
                  className="max-h-full rounded-2xl object-contain hover:scale-105 transition duration-500"
                />
              </div>
              <div className="flex flex-col justify-between py-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4A017] font-bold">
                    {product.category}
                  </div>
                  <h1 className="font-serif text-3xl font-semibold text-[#1A2744] leading-snug">{product.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1 text-[#D4A017] font-semibold">
                      <Star size={14} className="fill-[var(--brass)] text-[var(--brass)]" />
                      {product.ratings?.toFixed(1) || '0.0'}
                    </span>
                    <span>• {product.numReviews || 0} reviews</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-[#1A2744]">Rs. {displayPrice}</p>
                    {hasDiscount && (
                      <p className="text-sm text-slate-400 line-through">Rs. {product.price}</p>
                    )}
                  </div>
                  <div className={`inline-block rounded-xl px-4 py-2 text-xs font-semibold ${product.stock > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {product.stock > 0 ? `In Stock: ${product.stock} units left` : 'Out of Stock'}
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {product.stock > 0 && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold transition"
                        onClick={() => setQuantity((qty) => Math.max(1, qty - 1))}
                      >
                        -
                      </button>
                      <span className="min-w-[48px] text-center text-lg font-semibold">{quantity}</span>
                      <button
                        type="button"
                        className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold transition"
                        onClick={() => setQuantity((qty) => Math.min(product.stock, qty + 1))}
                      >
                        +
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={product.stock <= 0}
                      className="btn-primary py-3 px-8 text-sm font-semibold hover:bg-opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      onClick={addToCart}
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      className="btn-ghost text-[var(--ink)] border-slate-300 hover:bg-slate-50 py-3 px-6 text-sm font-semibold flex items-center gap-2"
                      onClick={addToWishlist}
                    >
                      <Heart size={16} className="text-red-500" /> Save to Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-[var(--ink)] border-b border-[var(--line)] pb-3">Product Description</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.description || 'No description available for this product.'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-[var(--ink)] border-b border-[var(--line)] pb-3">Specifications</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Brand</span>
                  <strong className="font-medium text-[var(--ink)]">{product.brand || 'Generic'}</strong>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Category</span>
                  <strong className="font-medium text-[var(--ink)]">{product.category}</strong>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex items-start justify-between text-sm text-slate-700 pt-1 border-t border-slate-100">
                    <span className="mt-1">Tags</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                      {product.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-medium text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetailPage;
