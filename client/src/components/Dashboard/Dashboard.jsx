import { useState, useEffect } from 'react';
import { expenseAPI } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#d946ef', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expenseAPI.getDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-500"></div>
      </div>
    );
  }

  if (!data || data.count === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="glass p-12 text-center">
          <span className="text-5xl">📊</span>
          <p className="text-xl font-semibold mt-4">No data yet</p>
          <p className="text-white/60 mt-2">Add some expenses to see your dashboard</p>
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 text-center">
          <p className="text-white/60 text-sm">Total Expenses</p>
          <p className="text-3xl font-bold mt-2">{data.count}</p>
          <p className="text-white/40 text-xs mt-1">transactions</p>
        </div>
        <div className="glass p-6 text-center">
          <p className="text-white/60 text-sm">Total Spent</p>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-accent-400 to-purple-400 bg-clip-text text-transparent">
            Rs. {data.total.toLocaleString()}
          </p>
          <p className="text-white/40 text-xs mt-1">all time</p>
        </div>
        <div className="glass p-6 text-center">
          <p className="text-white/60 text-sm">Avg per Transaction</p>
          <p className="text-3xl font-bold mt-2">Rs. {Math.round(data.total / data.count).toLocaleString()}</p>
          <p className="text-white/40 text-xs mt-1">{data.count} entries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={3}>
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="flex-1">{item.name}</span>
                    <span className="font-medium">{item.formatted}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">No category data</p>
          )}
        </div>

        <div className="glass p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Spending</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-white/60 text-center py-8">No monthly data</p>
          )}
        </div>
      </div>
    </div>
  );
}
