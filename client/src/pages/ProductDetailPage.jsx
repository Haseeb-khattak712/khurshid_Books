import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, Check, Package, Truck, ShieldCheck, Minus, Plus } from 'lucide-react';
import { useAuthState } from '../hooks/useAuth.js';
import { useCartDispatch } from '../context/CartContext.jsx';
import { useWishlistDispatch, useWishlistState } from '../context/WishlistContext.jsx';
import { supabase } from '../services/supabase.js';
import { toast } from 'react-hot-toast';
import LazyImage from '../components/LazyImage.jsx';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuthState();
  const { addToCart } = useCartDispatch();
  const { addToWishlist, removeFromWishlist } = useWishlistDispatch();
  const { items: wishlistItems } = useWishlistState();

  const isWishlisted = wishlistItems.some(item => item.slug === slug);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addToCart({ ...product, quantity });
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isWishlisted) {
      removeFromWishlist(product.id || product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF8F3]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4A017] border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#FAF8F3]">
        <p className="text-lg text-slate-500">{error || 'Product not found'}</p>
        <Link to="/shop" className="rounded-full bg-[#D4A017] px-6 py-2 text-sm font-bold text-[#1A2744] hover:opacity-90">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Safe check for school pack
  const isPack = product.category === 'School Packs';
  const hasPackItems = Array.isArray(product.packItems) && product.packItems.length > 0;
  const savings = product.discountPrice && product.discountPrice < product.price 
    ? product.price - product.discountPrice 
    : 0;

  return (
    <main className="min-h-screen bg-[#FAF8F3]">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#D4A017] transition">
            <ArrowLeft size={16} />
            Back to shop
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Section */}
          <div className="relative rounded-3xl bg-white p-4 shadow-sm">
            <LazyImage
              src={product.images && product.images.length > 0 ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`) : '/roots.png'}
              alt={product.name}
              className="h-full w-full rounded-2xl object-cover aspect-square"
              width="720"
              height="720"
            />
            {savings > 0 && (
              <span className="absolute left-6 top-6 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                SAVE Rs. {savings}
              </span>
            )}
            {(product.is_featured || product.isFeatured) && !isPack && (
              <span className="absolute right-6 top-6 rounded-full bg-[#D4A017] px-3 py-1 text-xs font-bold text-[#1A2744]">
                FEATURED
              </span>
            )}
            {isPack && (
              <span className="absolute right-6 top-6 rounded-full bg-[#1A2744] px-3 py-1 text-xs font-bold text-white">
                SCHOOL PACK
              </span>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                {product.brand || 'Khursheed'}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#1A2744] md:text-4xl">
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.ratings || 0) ? 'fill-[#D4A017] text-[#D4A017]' : 'text-slate-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-500">
                  ({product.numReviews || 0} reviews)
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-lg leading-relaxed text-slate-600">
              {product.description}
            </p>

            {/* Pack Contents - ONLY for School Packs */}
            {isPack && hasPackItems && (
              <div className="rounded-2xl border-2 border-[#D4A017]/20 bg-[#D4A017]/5 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Package size={22} className="text-[#D4A017]" />
                  <h3 className="text-lg font-bold text-[#1A2744]">What's in this pack</h3>
                </div>
                <ul className="space-y-3">
                  {product.packItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                      <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-white p-3 text-sm text-slate-600">
                  <Truck size={16} className="text-[#D4A017]" />
                  <span>Everything packed together — ready for school</span>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#1A2744]">
                Rs. {product.discountPrice || product.price}
              </span>
              {product.discountPrice && product.discountPrice < product.price && (
                <span className="text-xl text-slate-400 line-through">
                  Rs. {product.price}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`h-2.5 w-2.5 rounded-full ${
                product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className={
                product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
              }>
                {product.stock > 10 ? 'In stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity + Actions */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center rounded-full border border-slate-200 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-lg font-bold text-slate-600 hover:text-[#1A2744] transition"
                  disabled={product.stock === 0}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                  className="px-4 py-3 text-lg font-bold text-slate-600 hover:text-[#1A2744] transition"
                  disabled={product.stock === 0}
                >
                  <Plus size={16} />
                </button>
              </div>

              {user?.role === 'admin' ? (
                <button
                  disabled
                  className="flex items-center gap-2 rounded-full bg-slate-200 px-8 py-3 text-sm font-bold text-slate-500 shadow-sm cursor-not-allowed"
                >
                  <ShoppingCart size={18} />
                  Admins cannot buy
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex items-center gap-2 rounded-full bg-[#D4A017] px-8 py-3 text-sm font-bold text-[#1A2744] shadow-lg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={18} />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}

              <button
                onClick={handleWishlistToggle}
                className={`flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-600 hover:border-[#D4A017] hover:text-[#D4A017]'
                }`}
              >
                <Heart size={18} className={isWishlisted ? 'fill-red-600' : ''} />
                {isWishlisted ? 'Saved' : 'Wishlist'}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Truck size={16} className="text-[#D4A017]" />
                Free delivery over Rs. 1,500
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck size={16} className="text-[#D4A017]" />
                Cash on delivery
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/shop?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-[#D4A017]/10 hover:text-[#D4A017] transition"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetailPage;