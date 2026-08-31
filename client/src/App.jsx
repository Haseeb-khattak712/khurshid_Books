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

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const ShopPage = lazy(() => import('./pages/ShopPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage.jsx'));
const WishlistPage = lazy(() => import('./pages/WishlistPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const ManageProducts = lazy(() => import('./pages/admin/ManageProducts.jsx'));
const ManageOrders = lazy(() => import('./pages/admin/ManageOrders.jsx'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers.jsx'));
const PrintInvoice = lazy(() => import('./pages/admin/PrintInvoice.jsx'));
const SchoolPacksPage = lazy(() => import('./pages/SchoolPacksPage.jsx'));

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