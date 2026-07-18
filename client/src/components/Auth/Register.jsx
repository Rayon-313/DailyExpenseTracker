import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <p className="text-white/60 mt-2">Start tracking your money</p>
        </div>
        <form onSubmit={handleSubmit} className="glass p-8 space-y-5">
          <h2 className="text-2xl font-bold text-center">Create Account</h2>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Name</label>
            <input type="text" className="input-field" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
            <input type="password" className="input-field" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Confirm Password</label>
            <input type="password" className="input-field" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-white/60 text-sm">
            Already have an account? <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
