import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  ShieldAlert,
  Phone,
  Truck,
  HelpCircle,
  Package,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuthState, useAuthDispatch } from '../hooks/useAuth.js';
import { useCartState } from '../context/CartContext.jsx';
import { useWishlistState } from '../context/WishlistContext.jsx';
import HeaderSearch from './HeaderSearch.jsx';
import CategoryNav from './CategoryNav.jsx';
import { fetchCategories, DEFAULT_CATEGORIES, getCategoryIcon } from '../services/categoryService.js';

const mainNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'All Products' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact & Support' }
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(true);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuthState();
  const authDispatch = useAuthDispatch();
  const { items: cartItems } = useCartState();
  const { items: wishlistItems } = useWishlistState();

  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );
  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.discount_price || item.price) * item.quantity, 0),
    [cartItems]
  );
  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  // Load categories for mobile drawer
  useEffect(() => {
    let isMounted = true;
    fetchCategories(false).then((data) => {
      if (isMounted && data && data.length > 0) {
        setCategories(data);
      }
    }).catch(console.error);

    return () => { isMounted = false; };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = useCallback(() => {
    authDispatch({ type: 'LOGOUT' });
    navigate('/login');
  }, [authDispatch, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-xs">
      {/* 1. TOP ANNOUNCEMENT & CONTACT BAR */}
      <div className="bg-[#0F1829] text-white text-[11px] font-medium tracking-wide">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
          {/* Left: Free delivery notice */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brass)]/20 text-[var(--brass-light)] shrink-0">
              <Truck size={12} />
            </span>
            <span className="truncate">
              <strong className="text-[var(--brass-light)]">Free Delivery</strong> on orders over Rs. 3,500 across Pakistan
            </span>
          </div>

          {/* Right: Contact & Quick Links */}
          <div className="hidden md:flex items-center gap-5 text-slate-300">
            <a
              href="https://wa.me/923469325825?text=Hello%20Khursheed%20Book%20Agency,%20I%20need%20assistance!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <Phone size={12} className="text-[var(--brass-light)]" />
              <span>WhatsApp: +92 346 9325825</span>
            </a>
            <span className="text-slate-600">|</span>
            <Link to="/contact" className="hover:text-white transition flex items-center gap-1">
              <HelpCircle size={12} />
              <span>Help &amp; FAQ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER ROW (Logo, Category Search, User Actions) */}
      <div className="border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 md:py-3.5">
          
          {/* Mobile menu hamburger button */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden shrink-0"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* Brand Logo */}
          <Link to="/" className="group flex flex-col leading-none shrink-0">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#0F1829] sm:text-3xl transition group-hover:text-[var(--brass)]">
              Khurshid
            </span>
            <span className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[var(--brass)]">
              Books &amp; Stationery
            </span>
          </Link>

          {/* Prominent Header Search Bar (Desktop / Tablet) */}
          <div className="hidden md:flex flex-1 justify-center px-2 lg:px-8">
            <HeaderSearch />
          </div>

          {/* User Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Account link */}
            {user ? (
              <div className="flex items-center gap-2 border-r border-slate-200 pr-2 sm:pr-3">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/profile'}
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#0F1829] hover:bg-slate-100 transition"
                  title={user.role === 'admin' ? 'Admin Dashboard' : 'Profile'}
                >
                  {user.role === 'admin' ? (
                    <ShieldAlert size={17} className="text-[var(--brass)]" />
                  ) : (
                    <User size={17} />
                  )}
                  <span className="hidden xl:inline">
                    {user.role === 'admin'
                      ? 'Admin'
                      : (user.full_name || user.name || 'User').split(' ')[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#0F1829] hover:bg-slate-100 transition"
                aria-label="Account Login"
              >
                <User size={18} />
                <span className="hidden xl:inline">Sign In</span>
              </Link>
            )}

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 text-slate-700 transition hover:border-[var(--brass)] hover:text-[var(--brass)]"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-[var(--brass)] text-[10px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon & Amount */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 rounded-xl bg-[#0F1829] px-3 py-2 text-white transition hover:bg-[var(--brass)] shadow-xs"
              aria-label="Cart"
              title="Shopping Cart"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] uppercase tracking-wider text-slate-300">My Cart</span>
                <span className="text-xs font-bold text-white mt-0.5">
                  Rs. {cartSubtotal.toLocaleString()}
                </span>
              </div>
            </Link>
          </div>

        </div>

        {/* Mobile Search Bar (visible under logo on small screens) */}
        <div className="px-4 pb-3 md:hidden">
          <HeaderSearch />
        </div>
      </div>

      {/* 3. SECONDARY CATEGORY & QUICK LINKS BAR */}
      <CategoryNav />

      {/* 4. MOBILE SLIDE-OUT DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={closeMobileMenu}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-2xl animate-slide-in">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-[#0F1829] text-white">
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold">Khurshid</span>
                <span className="text-[9px] uppercase tracking-widest text-[var(--brass-light)]">
                  Books &amp; Stationery
                </span>
              </div>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              
              {/* Account Quick Status */}
              {user ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brass)] text-white font-bold text-sm">
                      {(user.full_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {user.full_name || user.email}
                      </p>
                      <Link
                        to={user.role === 'admin' ? '/admin' : '/profile'}
                        className="text-[11px] font-medium text-[var(--brass)] hover:underline"
                      >
                        {user.role === 'admin' ? 'Admin Dashboard' : 'View Profile'}
                      </Link>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-xl bg-[#0F1829] py-2.5 text-xs font-bold text-white hover:bg-[var(--brass)] transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Categories Accordion Section */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileCategoriesOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Layers size={15} className="text-[var(--brass)]" />
                    <span>Browse Categories</span>
                  </span>
                  <ChevronRight
                    size={15}
                    className={`transition-transform duration-200 ${mobileCategoriesOpen ? 'rotate-90 text-[var(--brass)]' : 'text-slate-400'}`}
                  />
                </button>

                {mobileCategoriesOpen && (
                  <div className="mt-2 space-y-1 pl-1">
                    {categories.map((cat) => {
                      const IconComp = getCategoryIcon(cat.icon_name);
                      return (
                        <Link
                          key={cat.id || cat.slug}
                          to={`/shop?category=${encodeURIComponent(cat.name)}`}
                          onClick={closeMobileMenu}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-[var(--brass)] transition"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <IconComp size={15} className="text-slate-400 shrink-0" />
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <ChevronRight size={12} className="text-slate-300 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Main Navigation Links */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Navigation
                </p>
                <div className="space-y-1">
                  {mainNavLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                          isActive
                            ? 'bg-[var(--brass)]/10 text-[var(--brass)] font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`
                      }
                    >
                      <span>{link.label}</span>
                      <ChevronRight size={13} className="text-slate-300" />
                    </NavLink>
                  ))}
                  <Link
                    to="/wishlist"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Heart size={14} className="text-rose-500" />
                      <span>My Wishlist</span>
                    </span>
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* WhatsApp Support Assistance */}
              <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/60 p-3.5 text-emerald-900">
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-600" />
                  <span>Need Instant Assistance?</span>
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Send your book list or syllabus photo on WhatsApp for instant packing!
                </p>
                <a
                  href="https://wa.me/923469325825?text=Hello%20Khursheed%20Book%20Agency,%20I%20have%20a%20book%20list%20to%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Chat on WhatsApp
                </a>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
