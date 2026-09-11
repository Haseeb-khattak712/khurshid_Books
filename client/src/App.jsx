import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { PageTransition } from './components/PageTransition.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Spinner from './components/Spinner.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import useScrollReveal from './hooks/useScrollReveal.jsx';
import AdminRoute from './components/AdminRoutes.jsx';
import './App.css';

// Listen for Vite chunk load errors and reload immediately
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event?.preventDefault?.();
    window.location.reload();
  });
}

/**
 * Wraps dynamic React.lazy imports with automated retry & deployment refresh logic.
 * When a new production version is deployed, browsers with stale chunk manifests
 * will automatically reload once to fetch the latest JS bundle rather than failing
 * with 'Failed to fetch dynamically imported module'.
 */
function lazyWithRetry(factory) {
  return lazy(async () => {
    const pageHasBeenForceRefreshed =
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem('page-has-been-force-refreshed') === 'true';

    try {
      const module = await factory();
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      }
      return module;
    } catch (error) {
      if (!pageHasBeenForceRefreshed && typeof window !== 'undefined') {
        console.warn('Stale deployment chunk detected, refreshing page:', error);
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return new Promise(() => {}); // prevent throwing before reload completes
      }
      throw error;
    }
  });
}

const HomePage = lazyWithRetry(() => import('./pages/HomePage.jsx'));
const ShopPage = lazyWithRetry(() => import('./pages/ShopPage.jsx'));
const ProductDetailPage = lazyWithRetry(() => import('./pages/ProductDetailPage.jsx'));
const CartPage = lazyWithRetry(() => import('./pages/CartPage.jsx'));
const CheckoutPage = lazyWithRetry(() => import('./pages/CheckoutPage.jsx'));
const OrderConfirmationPage = lazyWithRetry(() => import('./pages/OrderConfirmationPage.jsx'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage.jsx'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage.jsx'));
const OrderHistoryPage = lazyWithRetry(() => import('./pages/OrderHistoryPage.jsx'));
const WishlistPage = lazyWithRetry(() => import('./pages/WishlistPage.jsx'));
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage.jsx'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage.jsx'));
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard.jsx'));
const ManageProducts = lazyWithRetry(() => import('./pages/admin/ManageProducts.jsx'));
const ManageOrders = lazyWithRetry(() => import('./pages/admin/ManageOrders.jsx'));
const ManageUsers = lazyWithRetry(() => import('./pages/admin/ManageUsers.jsx'));
const ManageCategories = lazyWithRetry(() => import('./pages/admin/ManageCategories.jsx'));
const PrintInvoice = lazyWithRetry(() => import('./pages/admin/PrintInvoice.jsx'));
const SchoolPacksPage = lazyWithRetry(() => import('./pages/SchoolPacksPage.jsx'));

function ScrollRevealHandler() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useScrollReveal([location.pathname]);
  return null;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--text)]">
      <ScrollRevealHandler />
      <Navbar />
      <Suspense fallback={<div className="min-h-screen"><Spinner /></div>}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/shop" element={<PageTransition><ShopPage /></PageTransition>} />
          <Route path="/product/:slug" element={<PageTransition><ProductDetailPage /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
          <Route path="/school-packs" element={<PageTransition><SchoolPacksPage /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
          <Route path="/order/:id" element={<PageTransition><OrderConfirmationPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="/orders" element={<PageTransition><OrderHistoryPage /></PageTransition>} />
          <Route path="/wishlist" element={<PageTransition><WishlistPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="/admin" element={<AdminRoute><PageTransition><AdminDashboard /></PageTransition></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><PageTransition><ManageProducts /></PageTransition></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><PageTransition><ManageCategories /></PageTransition></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><PageTransition><ManageOrders /></PageTransition></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><PageTransition><ManageUsers /></PageTransition></AdminRoute>} />
          <Route path="/admin/print/:id" element={<AdminRoute><PageTransition><PrintInvoice /></PageTransition></AdminRoute>} />
        </Routes>
      </Suspense>
      <Footer />
      <WhatsAppButton />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppRoutes />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;