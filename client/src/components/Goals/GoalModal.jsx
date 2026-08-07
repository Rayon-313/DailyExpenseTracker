import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { goalAPI } from '../../services/api';

export default function GoalModal({ goal, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    savedAmount: '',
    targetDate: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setForm({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        savedAmount: goal.savedAmount.toString(),
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      });
    }
  }, [goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const target = parseFloat(form.targetAmount);
    if (!form.name.trim()) return toast.error('Please enter a goal name');
    if (isNaN(target) || target <= 0) return toast.error('Please enter a valid target amount');

    const data = {
      name: form.name.trim(),
      targetAmount: target,
      savedAmount: form.savedAmount ? parseFloat(form.savedAmount) : 0,
      targetDate: form.targetDate || undefined,
    };

    setLoading(true);
    try {
      if (goal) {
        await goalAPI.update(goal._id, data);
        toast.success('Goal updated');
      } else {
        await goalAPI.create(data);
        toast.success('Goal created!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface-900 border border-surface-700 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <div>
            <p className="text-brand-300 text-[11px] font-semibold uppercase tracking-[.16em] mb-1">Savings goals</p>
            <h2 className="page-title text-xl font-bold text-white">{goal ? 'Edit goal' : 'New savings goal'}</h2>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-white transition-colors p-1 rounded-md hover:bg-surface-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Goal name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. New Laptop"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Target amount (Rs.)</label>
            <input
              type="number"
              className="input-field"
              placeholder="120000"
              min="1"
              step="1"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Already saved (Rs.) <span className="text-surface-500 font-normal">— optional</span>
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="0"
              min="0"
              step="1"
              value={form.savedAmount}
              onChange={(e) => setForm({ ...form, savedAmount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Target date <span className="text-surface-500 font-normal">— optional</span></label>
            <input
              type="date"
              className="input-field"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
