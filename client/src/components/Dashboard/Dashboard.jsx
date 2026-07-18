import { useState, useEffect } from 'react';
import { expenseAPI } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expenseAPI.getDashboard()
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-surface-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.count === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
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

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Total Expenses</p>
          <p className="text-2xl font-bold text-white mt-2">{data.count}</p>
          <p className="text-xs text-surface-500 mt-0.5">transactions</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Total Spent</p>
          <p className="text-2xl font-bold text-blue-400 mt-2">Rs. {data.total.toLocaleString()}</p>
          <p className="text-xs text-surface-500 mt-0.5">all time</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Avg per Transaction</p>
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
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px' }}
                    itemStyle={{ color: '#f8fafc' }}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `Rs. ${value.toLocaleString()}`}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px' }}
                  itemStyle={{ color: '#f8fafc' }}
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
