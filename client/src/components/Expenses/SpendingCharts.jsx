import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

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
const PALETTE = ['#ed6534', '#d6a252', '#699b80', '#a17aaf', '#5d93a8', '#d16f75', '#c37c55', '#84936b'];
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

const compact = (n) => {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toString();
};
const money = (n) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] font-medium text-surface-400 uppercase tracking-[.12em]">{label}</p>
      <p className={`text-xl font-bold mt-1.5 truncate ${accent ? accent : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-surface-500 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-4">
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function SpendingCharts({ expenses, selectedMonth, filters, onFilterChange }) {
  const stats = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startWeek = new Date(startToday);
    startWeek.setDate(startToday.getDate() - 6);
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let today = 0, week = 0, month = 0, total = 0;
    let biggest = { amount: 0, title: '' };
    for (const e of expenses) {
      const d = new Date(e.date);
      total += e.amount;
      if (d >= startToday) today += e.amount;
      if (d >= startWeek) week += e.amount;
      if (d >= startMonth) month += e.amount;
      if (e.amount > biggest.amount) biggest = e;
    }
    const count = expenses.length;
    return {
      today, week, month, total, count,
      avg: count ? total / count : 0,
      biggest,
    };
  }, [expenses]);

  const trendData = useMemo(() => {
    if (selectedMonth === 'all') {
      const map = new Map();
      expenses.forEach((e) => {
        const d = new Date(e.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        const cur = map.get(key) || { key, label, total: 0 };
        cur.total += e.amount;
        map.set(key, cur);
      });
      return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
    }
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayTotals = new Array(daysInMonth).fill(0);
    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        dayTotals[d.getDate() - 1] += e.amount;
      }
    });
    return dayTotals.map((total, i) => ({ key: String(i + 1), label: String(i + 1), total }));
  }, [expenses, selectedMonth]);

  const categoryData = useMemo(() => {
    const map = new Map();
    expenses.forEach((e) => map.set(e.category || 'Other', (map.get(e.category || 'Other') || 0) + e.amount));
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const weekdayData = useMemo(() => {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = new Array(7).fill(0);
    expenses.forEach((e) => { totals[new Date(e.date).getDay()] += e.amount; });
    return names.map((name, i) => ({ name, total: totals[i] }));
  }, [expenses]);
  const maxWeekday = weekdayData.reduce((m, d) => (d.total > m.total ? d : m), { total: 0, name: '' });

  const paymentData = useMemo(() => {
    const map = new Map();
    expenses.forEach((e) => {
      const key = e.paymentMethod || 'Other';
      map.set(key, (map.get(key) || 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const topExpenses = useMemo(() =>
    [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3), [expenses]);

  const activeCategory = filters.category;
  const total = stats.total;

  const handleCategoryClick = (name) => {
    if (!onFilterChange) return;
    onFilterChange(activeCategory === name ? { ...filters, category: undefined } : { ...filters, category: name });
  };

  if (expenses.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Today" value={money(stats.today)} accent="text-brand-300" />
        <StatCard label="This Week" value={money(stats.week)} accent="text-brand-300" />
        <StatCard label="This Month" value={money(stats.month)} accent="text-brand-300" />
        <StatCard label="Avg / Expense" value={money(stats.avg)} sub={`${stats.count} transactions`} />
        <StatCard label="Biggest" value={money(stats.biggest.amount)} sub={stats.biggest.title || '—'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <CardHeader
            title="Spending trend"
            subtitle={selectedMonth === 'all' ? 'Totals per month' : 'Totals per day'}
          />
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ed6534" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ed6534" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3c342f" vertical={false} />
                <XAxis dataKey="label" stroke={axisStyle.stroke} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke={axisStyle.stroke} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={compact} width={48} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={itemStyle} labelStyle={{ color: '#9d8d7a', fontSize: 12 }} formatter={(value) => [money(value), 'Spent']} cursor={{ stroke: '#ed6534', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="total" stroke="#ed6534" strokeWidth={2.5} fill="url(#trendFill)" activeDot={{ r: 5, fill: '#ed6534', stroke: '#fffdf8', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-surface-500 text-sm text-center py-16">No data</p>
          )}
        </div>

        <div className="card p-5">
          <CardHeader
            title="Where it goes"
            subtitle="Click a slice to filter"
          />
          {categoryData.length > 0 ? (
            <>
              <div className="relative h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={74}
                      paddingAngle={2}
                      stroke="#171312"
                      strokeWidth={2}
                      cursor="pointer"
                      onClick={(entry) => handleCategoryClick(entry?.name)}
                    >
                      {categoryData.map((c, i) => (
                        <Cell
                          key={c.name}
                          fill={colorFor(c.name, i)}
                          opacity={!activeCategory || activeCategory === c.name ? 1 : 0.35}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={itemStyle} formatter={(value) => [money(value), 'Spent']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-white">{compact(total)}</span>
                  <span className="text-[10px] text-surface-500 uppercase tracking-[.12em]">total</span>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {categoryData.map((c, i) => {
                  const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
                  const active = activeCategory === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => handleCategoryClick(c.name)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors duration-150 ${
                        active ? 'bg-brand-500/10 ring-1 ring-brand-500/25' : 'hover:bg-surface-800/60'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorFor(c.name, i) }} />
                      <span className="text-xs text-surface-200 truncate flex-shrink-0 max-w-[70px]">{c.name}</span>
                      <span className="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colorFor(c.name, i) }} />
                      </span>
                      <span className="text-[11px] text-surface-500 tabular-nums flex-shrink-0 w-8 text-right">{pct}%</span>
                      <span className="text-[11px] font-semibold text-white tabular-nums flex-shrink-0">{compact(c.total)}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-surface-500 text-sm text-center py-16">No data</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <CardHeader title="Weekday pattern" subtitle={`Busiest day: ${maxWeekday.name || '—'}`} />
          {weekdayData.some((d) => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={weekdayData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3c342f" vertical={false} />
                <XAxis dataKey="name" stroke={axisStyle.stroke} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke={axisStyle.stroke} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={compact} width={44} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={itemStyle} formatter={(value) => [money(value), 'Spent']} cursor={{ fill: 'rgba(237,101,52,0.08)' }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {weekdayData.map((d) => (
                    <Cell key={d.name} fill={d.total === maxWeekday.total && d.total > 0 ? '#ed6534' : '#453a33'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-surface-500 text-sm text-center py-16">No data</p>
          )}
        </div>

        <div className="card p-5">
          <CardHeader title="Payment split" />
          {paymentData.length > 0 ? (
            <>
              <div className="flex items-center gap-4">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentData} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={52} paddingAngle={2} stroke="#171312" strokeWidth={2}>
                        {paymentData.map((p, i) => (
                          <Cell key={p.name} fill={colorFor(p.name, i)} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={itemStyle} formatter={(value) => [money(value), 'Spent']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {paymentData.map((p, i) => {
                    const pct = total > 0 ? Math.round((p.total / total) * 100) : 0;
                    return (
                      <div key={p.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colorFor(p.name, i) }} />
                        <span className="text-surface-300 capitalize truncate flex-1">{p.name}</span>
                        <span className="text-surface-500 tabular-nums">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-surface-500 text-sm text-center py-16">No data</p>
          )}
        </div>

        <div className="card p-5">
          <CardHeader title="Top expenses" />
          {topExpenses.length > 0 ? (
            <div className="space-y-2.5">
              {topExpenses.map((e, i) => (
                <div key={e._id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-surface-800 flex items-center justify-center text-[11px] font-bold text-surface-400 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{e.title}</p>
                    <p className="text-xs text-surface-500">{formatDate(e.date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-white">Rs. {e.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => onDelete && onDelete(e._id, e.title)}
                    className="p-1.5 text-surface-500 hover:text-red-400 rounded-md hover:bg-surface-800 transition-colors flex-shrink-0"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-500 text-sm text-center py-16">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
