import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { expenseAPI } from '../../services/api';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
const paymentMethods = ['Cash', 'Card', 'Online', 'Other'];

const defaultForm = { title: '', amount: '', category: 'Other', paymentMethod: 'Cash', date: new Date().toISOString().split('T')[0], notes: '' };

export default function ExpenseForm({ expense, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount.toString(),
        category: expense.category,
        paymentMethod: expense.paymentMethod,
        date: new Date(expense.date).toISOString().split('T')[0],
        notes: expense.notes || '',
      });
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, amount: parseFloat(form.amount) };
      if (expense) {
        await expenseAPI.update(expense._id, data);
        toast.success('Expense updated!');
      } else {
        await expenseAPI.create(data);
        toast.success('Expense added!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface-900 border border-surface-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <h2 className="text-base font-semibold text-white">{expense ? 'Edit Expense' : 'New Expense'}</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-white transition-colors p-1 rounded-md hover:bg-surface-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="What did you spend on?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Amount (Rs.)</label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Date</label>
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Payment Method</label>
              <select
                className="input-field"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Notes</label>
            <textarea
              className="input-field"
              rows="3"
              placeholder="Any extra details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
