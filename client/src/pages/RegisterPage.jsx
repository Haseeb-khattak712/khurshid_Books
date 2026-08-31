import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../services/supabase.js';
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
    
    // Basic check to block common dummy/fake emails
    const dummyPatterns = /test@|dummy@|fake@|admin@|example\.com|test\.com/i;
    if (dummyPatterns.test(email)) {
      toast.error('Please use a real, valid email address to register.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      if (error) throw error;
      
      toast.success(`Registered successfully! Welcome, ${name}`);
      navigate('/');
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      toast.error(error.message || 'Registration failed');
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
