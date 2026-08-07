import { useState, useEffect } from 'react';
import { expenseAPI } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import ReportModal from '../Report/ReportModal';
import BudgetManager from './BudgetManager';

const COLORS = ['#ed6534', '#d6a252', '#699b80', '#a17aaf', '#5d93a8', '#d16f75', '#c37c55', '#84936b'];

const insightStyle = {
  warning: {
    iconBg: 'bg-red-500/15', iconColor: 'text-red-400', border: 'border-l-red-500/40',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
  },
  success: {
    iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', border: 'border-l-emerald-500/40',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  info: {
    iconBg: 'bg-brand-500/15', iconColor: 'text-brand-300', border: 'border-l-brand-500/40',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />,
  },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    expenseAPI.getDashboard()
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
    expenseAPI.getInsights()
      .then((res) => setInsights(res.data))
      .catch(() => {});
  }, []);

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
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-brand-300 text-xs font-semibold uppercase tracking-[.18em] mb-2">Money, in context</p><h1 className="page-title text-3xl font-bold text-white">Your spending story</h1></div>
          <button onClick={() => setReportOpen(true)} className="btn-secondary flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Report
          </button>
        </div>
        {reportOpen && <ReportModal onClose={() => setReportOpen(false)} />}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Monthly Budget</h2>
          <p className="text-xs text-surface-400 mb-4">Request a new budget limit — an admin needs to approve it before it takes effect</p>
          <BudgetManager currentBudget={data.monthlyBudget} />
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
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-brand-300 text-xs font-semibold uppercase tracking-[.18em] mb-2">Money, in context</p><h1 className="page-title text-3xl sm:text-4xl font-bold text-white">Your spending story</h1></div>
        <button onClick={() => setReportOpen(true)} className="btn-secondary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Report
        </button>
      </div>
      {reportOpen && <ReportModal onClose={() => setReportOpen(false)} />}

      <div className="card p-6 border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-surface-900/80">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-white mb-1">Monthly Budget</h2>
              <p className="text-xs text-surface-400">
                {data.monthlyBudget > 0
                  ? `Rs. ${data.budgetRemaining > 0 ? data.budgetRemaining.toLocaleString() : '0'} remaining this month`
                  : 'Request a budget limit — an admin approves it before it applies'}
              </p>
            </div>
          </div>
          <BudgetManager currentBudget={data.monthlyBudget} />
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

      {insights.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-white">Smart Insights</h2>
          </div>
          <div className="space-y-2.5">
            {insights.map((insight, index) => {
              const style = insightStyle[insight.type] || insightStyle.info;
              return (
                <div key={index} className={`flex items-start gap-3 p-3 rounded-xl bg-surface-900/60 border border-surface-800 border-l-4 ${style.border}`}>
                  <div className={`w-8 h-8 rounded-lg ${style.iconBg} ${style.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      {style.icon}
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{insight.title}</p>
                    <p className="text-sm text-surface-400 mt-0.5">{insight.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
