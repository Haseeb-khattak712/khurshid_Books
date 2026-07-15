import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageProducts from './pages/admin/ManageProducts.jsx';
import ManageOrders from './pages/admin/ManageOrders.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import useScrollReveal from './hooks/useScrollReveal.jsx';
import './App.css';

// Call useScrollReveal inside a Router-scoped component so `useLocation`
// can be used safely. This avoids the "useLocation must be used inside a Router"
// runtime error that caused pages to render blank.
function ScrollRevealHandler() {
  const location = useLocation();
  useScrollReveal([location.pathname]);
  return null;
}

function App() {

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <ScrollRevealHandler />
            <div className="min-h-screen bg-[var(--cream)] text-[var(--text)]">
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order/:id" element={<OrderConfirmationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<ManageProducts />} />
                <Route path="/admin/orders" element={<ManageOrders />} />
                <Route path="/admin/users" element={<ManageUsers />} />
              </Routes>
              <Footer />
              <Toaster position="top-right" />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
