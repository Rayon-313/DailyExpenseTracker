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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">💰</span>
          <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-accent-400 to-purple-400 bg-clip-text text-transparent">
            Daily Expense Tracker
          </h1>
          <p className="text-white/60 mt-2">Track your spending like a boss</p>
        </div>
        <form onSubmit={handleSubmit} className="glass p-8 space-y-5">
          <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
            <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-white/60 text-sm">
            Don't have an account? <Link to="/register" className="text-accent-400 hover:text-accent-300 font-medium">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
