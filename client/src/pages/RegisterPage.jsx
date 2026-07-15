import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api.js';
import { useAuthDispatch, useAuthState } from '../hooks/useAuth.js';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useAuthDispatch();
  const { isLoading } = useAuthState();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const { data } = await api.post('/auth/register', { name, email, password });
      if (data.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.data, token: data.data.token } });
        toast.success(`Registered successfully! Welcome, ${data.data.name}`);
        navigate('/');
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C]">
      <div className="mx-auto max-w-md px-4 py-20 md:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-semibold">Create Account</h1>
          <form className="mt-8 space-y-5" onSubmit={handleRegister}>
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </label>
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
            <label className="block text-sm font-medium text-slate-700">
              Confirm Password
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </label>
            <button
              type="submit"
              disabled={loading || isLoading}
              className="w-full rounded-3xl bg-[#D4A017] px-6 py-3 text-sm font-semibold text-[#1A2744] disabled:opacity-50"
            >
              {loading || isLoading ? 'Registering...' : 'Register'}
            </button>
            <p className="text-center text-sm text-slate-500">
              Already have an account? <Link to="/login" className="text-[#D4A017]">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
