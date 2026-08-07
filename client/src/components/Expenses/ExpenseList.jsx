import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { expenseAPI } from '../../services/api';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ExpenseForm from './ExpenseForm';
import ReportModal from '../Report/ReportModal';
import SpendingCharts from './SpendingCharts';

const categoryStyles = {
  Food: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  Transport: { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  Shopping: { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  Bills: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  Entertainment: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Health: { color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  Education: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Other: { color: 'text-surface-400', bg: 'bg-surface-700/50', border: 'border-surface-600/20' },
};

function getMonthOptions(expenses) {
  const months = new Map();
  expenses.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months.has(key)) {
      months.set(key, d.toLocaleString('default', { month: 'long', year: 'numeric' }));
    }
  });
  return Array.from(months.entries()).map(([value, label]) => ({ value, label }));
}

export default function ExpenseList() {
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [monthly, setMonthly] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    expenseAPI.getDashboard()
      .then((res) => setMonthly(res.data))
      .catch(() => {});
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (search) params.search = search;
      const res = await expenseAPI.getAll(params);
      setAllExpenses(res.data);
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
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
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

  const monthOptions = getMonthOptions(allExpenses);

  const filteredExpenses = allExpenses.filter((e) => {
    if (selectedMonth === 'all') return true;
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return key === selectedMonth;
  }).sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date);
    if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sortOrder === 'highest') return b.amount - a.amount;
    if (sortOrder === 'lowest') return a.amount - b.amount;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-brand-300 text-xs font-semibold uppercase tracking-[.18em] mb-2">Personal ledger</p>
          <h1 className="page-title text-3xl sm:text-4xl font-bold text-white">Your expenses</h1>
          <p className="text-surface-400 text-sm mt-1">{filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''} in view</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportOpen(true)}
            className="btn-secondary flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Report
          </button>
          <button
            onClick={() => { setEditingExpense(null); setShowForm(true); }}
            className="btn-primary flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Expense
          </button>
        </div>
      </div>

      {monthly && (
        <div className="card px-5 py-4 border-brand-500/20 bg-gradient-to-r from-brand-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[.14em] text-surface-400 whitespace-nowrap">This month</span>
            <div className="flex-1">
              <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    monthly.budgetPercentage >= 100 ? 'bg-red-500'
                      : monthly.budgetPercentage >= 70 ? 'bg-amber-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${Math.min(monthly.budgetPercentage, 100)}%` }}
                />
              </div>
            </div>
            <span className={`text-xs font-medium tabular-nums whitespace-nowrap ${
              monthly.budgetPercentage >= 100 ? 'text-red-400'
                : monthly.budgetPercentage >= 70 ? 'text-amber-400' : 'text-surface-300'
            }`}>
              {monthly.monthlyBudget > 0
                ? `Rs. ${monthly.currentMonthTotal.toLocaleString()} / Rs. ${monthly.monthlyBudget.toLocaleString()} (${monthly.budgetPercentage}%)`
                : `Rs. ${monthly.currentMonthTotal.toLocaleString()} spent this month`}
            </span>
          </div>
        </div>
      )}

      <div className="card p-3 sm:p-4 flex items-center gap-2">
        <SearchBar onSearch={setSearch} />
        <FilterPanel filters={filters} onFilterChange={setFilters} />
      </div>

      <SpendingCharts
        expenses={filteredExpenses}
        selectedMonth={selectedMonth}
        filters={filters}
        onFilterChange={setFilters}
        onDelete={handleDelete}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedMonth('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
            selectedMonth === 'all'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25'
              : 'bg-surface-900/60 border border-surface-800 text-surface-400 hover:text-surface-200'
          }`}
        >
          All Months
        </button>
        {monthOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSelectedMonth(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
              selectedMonth === value
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25'
                : 'bg-surface-900/60 border border-surface-800 text-surface-400 hover:text-surface-200'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input-field !py-1.5 !px-3 text-xs w-auto"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-surface-700 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="card py-16 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-16.5 0v4.5A2.25 2.25 0 006.75 20.25h10.5A2.25 2.25 0 0019.5 18v-4.5m-16.5 0V6.75a2.25 2.25 0 012.25-2.25h10.5a2.25 2.25 0 012.25 2.25v6.75" />
            </svg>
          </div>
          <p className="text-base font-medium text-white">
            {selectedMonth === 'all' ? 'No expenses yet' : 'No expenses for this month'}
          </p>
          <p className="text-sm text-surface-400 mt-1">
            {selectedMonth === 'all' ? 'Add your first expense to start tracking' : 'Try selecting a different month'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((expense) => {
            const cat = categoryStyles[expense.category] || categoryStyles.Other;
            return (
              <div key={expense._id} className="card px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4 hover:border-brand-500/30 hover:-translate-y-px transition-all duration-150 group">
                <div className={`w-11 h-11 rounded-2xl ${cat.bg} border ${cat.border} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-sm font-semibold ${cat.color}`}>
                    {expense.category.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-white truncate">{expense.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-surface-500 mt-0.5">
                    <span>{formatDate(expense.date)}</span>
                    <span className="text-surface-700">&#183;</span>
                    <span className="capitalize">{expense.paymentMethod}</span>
                    {expense.notes && (
                      <>
                        <span className="text-surface-700">&#183;</span>
                        <span className="truncate">{expense.notes}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-semibold text-white">Rs. {expense.amount.toLocaleString()}</p>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${cat.bg} ${cat.color} border ${cat.border}`}>
                    {expense.category}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => { setEditingExpense(expense); setShowForm(true); }}
                    className="p-1.5 text-surface-500 hover:text-surface-200 rounded-md hover:bg-surface-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(expense._id, expense.title)}
                    className="p-1.5 text-surface-500 hover:text-red-400 rounded-md hover:bg-surface-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => { setShowForm(false); setEditingExpense(null); }}
          onSaved={() => { setShowForm(false); setEditingExpense(null); fetchExpenses(); }}
        />
      )}

      {reportOpen && <ReportModal onClose={() => setReportOpen(false)} />}
    </div>
  );
}
