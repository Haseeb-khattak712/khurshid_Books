import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api.js';
import { useAuthDispatch, useAuthState } from '../hooks/useAuth.js';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useAuthDispatch();
  const { isLoading } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.data, token: data.data.token } });
        toast.success(`Welcome, ${data.data.name}`);
        navigate(from, { replace: true });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C]">
      <div className="mx-auto max-w-md px-4 py-20 md:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-semibold">Login</h1>
          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </label>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/register" className="text-[#D4A017]">Create an account</Link>
            </div>
            <button
              type="submit"
              disabled={loading || isLoading}
              className="w-full rounded-3xl bg-[#D4A017] px-6 py-3 text-sm font-semibold text-[#1A2744] disabled:opacity-50"
            >
              {loading || isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
