import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const PALETTE = ['#ed6534', '#d6a252', '#699b80', '#a17aaf', '#5d93a8', '#d16f75', '#c37c55', '#84936b'];
const CATEGORY_COLORS = {
  Food: '#fb923c',
  Transport: '#38bdf8',
  Shopping: '#a78bfa',
  Bills: '#f87171',
  Entertainment: '#34d399',
  Health: '#2dd4bf',
  Education: '#fbbf24',
  Other: '#a8a29e',
};
const colorFor = (name, index) => CATEGORY_COLORS[name] || PALETTE[index % PALETTE.length];

const tooltipStyle = {
  background: '#2a2421',
  border: '1px solid #554b44',
  borderRadius: '12px',
  fontSize: '13px',
  boxShadow: '0 12px 32px rgba(0,0,0,.35)',
};
const itemStyle = { color: '#fffdf8' };
const axisStyle = { stroke: '#9d8d7a', fontSize: 12 };

const money = (n) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;
const compact = (n) => {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toString();
};

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-surface-700 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const userShareData = (data.userTotals || [])
    .filter((u) => u.total > 0)
    .map((u, i) => ({ name: u.name, total: u.total, index: i }));
  const totalSpent = data.totalSpent || 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Users</p>
          <p className="text-2xl font-bold text-white mt-2">{data.totalUsers}</p>
          <p className="text-xs text-surface-500 mt-0.5">registered</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Transactions</p>
          <p className="text-2xl font-bold text-white mt-2">{data.totalExpenses}</p>
          <p className="text-xs text-surface-500 mt-0.5">all time</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Total Spent</p>
          <p className="text-2xl font-bold text-brand-300 mt-2">{money(data.totalSpent)}</p>
          <p className="text-xs text-surface-500 mt-0.5">across all users</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">This Month</p>
          <p className="text-2xl font-bold text-white mt-2">{money(data.currentMonthTotal)}</p>
          <p className="text-xs text-surface-500 mt-0.5">so far</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Usage trend</h2>
            <p className="text-xs text-surface-500 mt-0.5">Total spending per month across all users</p>
          </div>
          {data.monthlyTotals?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.monthlyTotals} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ed6534" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ed6534" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3c342f" vertical={false} />
                <XAxis dataKey="name" stroke={axisStyle.stroke} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke={axisStyle.stroke} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={compact} width={48} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={itemStyle} labelStyle={{ color: '#9d8d7a', fontSize: 12 }} formatter={(value) => [money(value), 'Spent']} cursor={{ stroke: '#ed6534', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="total" stroke="#ed6534" strokeWidth={2.5} fill="url(#adminTrendFill)" activeDot={{ r: 5, fill: '#ed6534', stroke: '#fffdf8', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-surface-500 text-sm text-center py-16">No data yet</p>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Share of spending by user</h2>
            <p className="text-xs text-surface-500 mt-0.5">How platform spending is split between users</p>
          </div>
          {userShareData.length > 0 ? (
            <>
              <div className="relative h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userShareData} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={74} paddingAngle={2} stroke="#171312" strokeWidth={2}>
                      {userShareData.map((u) => (
                        <Cell key={u.name} fill={colorFor(u.name, u.index)} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={itemStyle} formatter={(value) => [money(value), 'Spent']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-white">{compact(totalSpent)}</span>
                  <span className="text-[10px] text-surface-500 uppercase tracking-[.12em]">total</span>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                {userShareData.map((u) => {
                  const pct = totalSpent > 0 ? Math.round((u.total / totalSpent) * 100) : 0;
                  return (
                    <div key={u.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorFor(u.name, u.index) }} />
                      <span className="text-surface-300 truncate flex-1">{u.name}</span>
                      <span className="text-surface-500 tabular-nums">{pct}%</span>
                      <span className="text-white font-semibold tabular-nums">{compact(u.total)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-surface-500 text-sm text-center py-16">No data yet</p>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-white">Top spenders</h2>
          <p className="text-xs text-surface-500 mt-0.5">Users with the highest total spending</p>
        </div>
        {data.topSpenders?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.topSpenders.map((s, i) => (
              <div key={s.email || i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/60 border border-surface-800">
                <div className="w-9 h-9 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-sm font-semibold text-brand-300 flex-shrink-0">
                  {s.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.name}</p>
                  <p className="text-xs text-surface-500 truncate">{s.email || '—'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-white tabular-nums">Rs. {s.total.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-surface-500">#{i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-surface-500 text-sm text-center py-8">No spending data yet</p>
        )}
      </div>
    </div>
  );
}
