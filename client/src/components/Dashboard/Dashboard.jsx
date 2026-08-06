import { useState, useEffect } from 'react';
import { expenseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#ed6534', '#d6a252', '#699b80', '#a17aaf', '#5d93a8', '#d16f75', '#c37c55', '#84936b'];

export default function Dashboard() {
  const { user, updateBudget } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState(user?.monthlyBudget || '');
  const [budgetSaving, setBudgetSaving] = useState(false);

  useEffect(() => {
    expenseAPI.getDashboard()
      .then((res) => {
        setData(res.data);
        if (res.data.monthlyBudget > 0 && !budgetInput) {
          setBudgetInput(res.data.monthlyBudget);
        }
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBudget = async () => {
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount < 0) {
      return toast.error('Please enter a valid amount');
    }
    setBudgetSaving(true);
    try {
      await updateBudget(amount);
      setData((prev) => prev ? { ...prev, monthlyBudget: amount, budgetRemaining: amount - prev.currentMonthTotal } : prev);
      toast.success('Budget updated');
    } catch (err) {
      toast.error('Failed to update budget');
    } finally {
      setBudgetSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-surface-700 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.count === 0) {
    return (
      <div className="space-y-5">
        <div><p className="text-brand-300 text-xs font-semibold uppercase tracking-[.18em] mb-2">Money, in context</p><h1 className="page-title text-3xl font-bold text-white">Your spending story</h1></div>
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Monthly Budget</h2>
          <p className="text-xs text-surface-400 mb-4">Set a budget to track your spending limit each month</p>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-500">Rs.</span>
              <input
                type="number"
                className="input-field pl-10"
                placeholder="0"
                min="0"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
            </div>
            <button onClick={handleSaveBudget} disabled={budgetSaving} className="btn-primary">
              {budgetSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        <div className="card py-16 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-base font-medium text-white">No data yet</p>
          <p className="text-sm text-surface-400 mt-1">Add some expenses to see your dashboard</p>
        </div>
      </div>
    );
  }

  const categoryData = Object.entries(data.categoryTotals).map(([name, value]) => ({
    name,
    value,
    formatted: `Rs. ${value.toLocaleString()}`,
  }));

  const monthlyData = Object.entries(data.monthlyTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const budgetPct = data.budgetPercentage || 0;
  const budgetBarColor = budgetPct >= 100 ? 'bg-red-500' : budgetPct >= 70 ? 'bg-amber-500' : 'bg-brand-500';

  return (
    <div className="space-y-6">
      <div><p className="text-brand-300 text-xs font-semibold uppercase tracking-[.18em] mb-2">Money, in context</p><h1 className="page-title text-3xl sm:text-4xl font-bold text-white">Your spending story</h1></div>

      <div className="card p-6 border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-surface-900/80">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-white mb-1">Monthly Budget</h2>
            <p className="text-xs text-surface-400">
              {data.monthlyBudget > 0
                ? `Rs. ${data.budgetRemaining > 0 ? data.budgetRemaining.toLocaleString() : '0'} remaining this month`
                : 'Set a budget to track your spending'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-500">Rs.</span>
              <input
                type="number"
                className="input-field pl-10 !w-40"
                placeholder="0"
                min="0"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
            </div>
            <button onClick={handleSaveBudget} disabled={budgetSaving} className="btn-primary">
              {budgetSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        {data.monthlyBudget > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-surface-400">
                Rs. {data.currentMonthTotal.toLocaleString()} spent
              </span>
              <span className={`text-xs font-medium ${budgetPct >= 100 ? 'text-red-400' : budgetPct >= 70 ? 'text-amber-400' : 'text-surface-400'}`}>
                {budgetPct}%
              </span>
            </div>
            <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${budgetBarColor}`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Total Expenses</p>
          <p className="text-2xl font-bold text-white mt-2">{data.count}</p>
          <p className="text-xs text-surface-500 mt-0.5">transactions</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Total Spent</p>
          <p className="text-2xl font-bold text-brand-300 mt-2">Rs. {data.total.toLocaleString()}</p>
          <p className="text-xs text-surface-500 mt-0.5">all time</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Avg per Transaction</p>
          <p className="text-2xl font-bold text-white mt-2">Rs. {Math.round(data.total / data.count).toLocaleString()}</p>
          <p className="text-xs text-surface-500 mt-0.5">{data.count} entries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Spending by Category</h2>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} innerRadius={48} dataKey="value" paddingAngle={2} strokeWidth={0}>
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `Rs. ${value.toLocaleString()}`}
                    contentStyle={{ background: '#2a2421', border: '1px solid #554b44', borderRadius: '12px', fontSize: '13px' }}
                    itemStyle={{ color: '#fffdf8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-surface-300 flex-1 truncate">{item.name}</span>
                    <span className="text-surface-400 font-medium tabular-nums">{item.formatted}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-surface-500 text-sm text-center py-8">No category data</p>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Monthly Spending</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3c342f" />
                <XAxis dataKey="name" stroke="#9d8d7a" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9d8d7a" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `Rs. ${value.toLocaleString()}`}
                  contentStyle={{ background: '#2a2421', border: '1px solid #554b44', borderRadius: '12px', fontSize: '13px' }}
                  itemStyle={{ color: '#fffdf8' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-surface-500 text-sm text-center py-8">No monthly data</p>
          )}
        </div>
      </div>
    </div>
  );
}
