import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4 relative overflow-hidden">
      <div className="absolute w-[32rem] h-[32rem] rounded-full bg-brand-500/10 blur-3xl -top-48 -left-48" />
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-[1.3rem] flex items-center justify-center mx-auto mb-5 shadow-xl shadow-brand-600/30 rotate-[-5deg]">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="page-title text-4xl font-bold text-white">paisa.</h1>
          <p className="text-surface-400 mt-1 text-sm">A calmer way to keep track.</p>
        </div>
        <div className="card p-6 sm:p-7">
          <p className="text-brand-300 text-[11px] font-semibold uppercase tracking-[.17em] mb-2">Welcome back</p>
          <h2 className="page-title text-2xl font-bold text-white mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-surface-400 text-sm mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-300 hover:text-brand-400 font-semibold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
