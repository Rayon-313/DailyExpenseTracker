import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { expenseAPI } from '../../services/api';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ExpenseForm from './ExpenseForm';

const categoryColors = {
  Food: 'from-orange-500 to-red-500',
  Transport: 'from-blue-500 to-cyan-500',
  Shopping: 'from-purple-500 to-pink-500',
  Bills: 'from-red-500 to-rose-500',
  Entertainment: 'from-green-500 to-emerald-500',
  Health: 'from-teal-500 to-cyan-500',
  Education: 'from-yellow-500 to-orange-500',
  Other: 'from-gray-500 to-slate-500',
};

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (search) params.search = search;
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await expenseAPI.delete(id);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-white/60 mt-1">{expenses.length} transactions</p>
        </div>
        <button onClick={() => { setEditingExpense(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Expense
        </button>
      </div>
      <div className="flex items-center gap-3">
        <SearchBar onSearch={setSearch} />
        <FilterPanel filters={filters} onFilterChange={setFilters} />
      </div>
      {total > 0 && (
        <div className="glass p-4 flex items-center justify-between">
          <span className="text-white/60">Total Spent</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-accent-400 to-purple-400 bg-clip-text text-transparent">Rs. {total.toLocaleString()}</span>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-500"></div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="glass p-12 text-center">
          <span className="text-5xl">📭</span>
          <p className="text-xl font-semibold mt-4">No expenses yet</p>
          <p className="text-white/60 mt-2">Click the button above to add your first expense</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense._id} className="glass p-4 card-hover flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[expense.category] || categoryColors.Other} flex items-center justify-center text-lg font-bold shadow-lg`}>
                {expense.category.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{expense.title}</h3>
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <span>{formatDate(expense.date)}</span>
                  <span>•</span>
                  <span className="capitalize">{expense.paymentMethod}</span>
                  {expense.notes && <><span>•</span><span className="truncate">{expense.notes}</span></>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-accent-400">Rs. {expense.amount.toLocaleString()}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[expense.category] || categoryColors.Other}`}>
                  {expense.category}
                </span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button onClick={() => { setEditingExpense(expense); setShowForm(true); }} className="p-2 text-white/40 hover:text-white/80 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(expense._id, expense.title)} className="p-2 text-white/40 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => { setShowForm(false); setEditingExpense(null); }}
          onSaved={() => { setShowForm(false); setEditingExpense(null); fetchExpenses(); }}
        />
      )}
    </div>
  );
}
