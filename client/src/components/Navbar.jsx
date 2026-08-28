import { useState, useMemo, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, ShieldAlert } from 'lucide-react';
import { useAuthState, useAuthDispatch } from '../hooks/useAuth.js';
import { useCartState } from '../context/CartContext.jsx';
import { useWishlistState } from '../context/WishlistContext.jsx';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const showSearch = location.pathname.startsWith('/shop');

  const { user } = useAuthState();
  const authDispatch = useAuthDispatch();
  const { items: cartItems } = useCartState();
  const { items: wishlistItems } = useWishlistState();

  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

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
    <header className="nav-glass sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
        <Link to="/" className="group flex shrink-0 flex-col leading-none">
          <span className="font-serif text-[1.65rem] font-semibold tracking-tight text-[var(--ink)] transition group-hover:text-[var(--brass)]">
            Khurshid
          </span>
          <span className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Books &amp; Stationery
          </span>
        </Link>



        <nav
          className={`absolute inset-x-4 top-[calc(100%+0.5rem)] z-40 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--cream)]/95 p-5 shadow-[var(--shadow-lift)] backdrop-blur-xl md:static md:inset-auto md:flex md:flex-1 md:justify-center md:border-0 md:bg-transparent md:p-0 md:shadow-none ${mobileOpen ? 'block' : 'hidden md:flex'}`}
        >
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav-link block py-2 md:py-0 ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                {link.label}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link block py-2 md:py-0 text-[var(--brass)] flex items-center gap-1 ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <ShieldAlert size={14} /> Admin
              </NavLink>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {showSearch && (
            <Link to="/shop" className="btn-icon" aria-label="Search">
              <Search size={17} />
            </Link>
          )}
          
          <Link to="/wishlist" className="btn-icon relative" aria-label="Wishlist">
            <Heart size={17} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brass)] text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          
          <Link to="/cart" className="btn-icon relative" aria-label="Cart">
            <ShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ink)] text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2 border-l border-[var(--line)] pl-3">
              <Link to="/profile" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink)] hover:text-[var(--brass)] transition">
                <User size={15} />
                <span className="hidden sm:inline">{(user.full_name || user.name || 'User').split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-icon text-red-600 hover:bg-red-50"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-icon" aria-label="Account">
              <User size={17} />
            </Link>
          )}

          <button
            type="button"
            className="btn-icon md:hidden ml-1"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
