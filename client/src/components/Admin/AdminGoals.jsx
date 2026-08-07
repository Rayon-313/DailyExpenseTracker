import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const money = (n) => Math.round(n).toLocaleString('en-IN');
const progress = (g) => (g.targetAmount > 0 ? Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100)) : 0);
const barColor = (g) => {
  const p = progress(g);
  if (p >= 100) return 'bg-emerald-500';
  if (p >= 70) return 'bg-amber-500';
  return 'bg-brand-500';
};

export default function AdminGoals() {
  const [goals, setGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getGoals(), adminAPI.getGoalsAnalytics()])
      .then(([gRes, aRes]) => {
        setGoals(gRes.data);
        setAnalytics(aRes.data);
      })
      .catch(() => toast.error('Failed to load goals data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-surface-700 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="card p-4">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Total Goals</p>
            <p className="text-2xl font-bold text-white mt-2">{analytics.totalGoals}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Completed</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{analytics.completedGoals}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Completion Rate</p>
            <p className="text-2xl font-bold text-white mt-2">{analytics.completionRate}%</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Total Saved</p>
            <p className="text-2xl font-bold text-brand-300 mt-2">Rs. {money(analytics.totalSaved)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Overall Progress</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl font-bold text-white">{analytics.overallProgress}%</p>
            </div>
            <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${analytics.overallProgress}%` }} />
            </div>
          </div>
        </div>
      )}

      {analytics && analytics.byUser.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Savings behavior by user</h2>
          <div className="space-y-3">
            {analytics.byUser.map((u) => {
              const pct = u.target > 0 ? Math.min(100, Math.round((u.saved / u.target) * 100)) : 0;
              return (
                <div key={u.userId} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-300 flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">{u.name}</p>
                      <p className="text-xs text-surface-400 tabular-nums whitespace-nowrap">
                        Rs. {money(u.saved)} / Rs. {money(u.target)} · {u.goals} goal{u.goals !== 1 ? 's' : ''} · {u.completed} done
                      </p>
                    </div>
                    <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ed6534' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-sm font-medium text-white">No goals yet</p>
          <p className="text-xs text-surface-500 mt-1">Users haven't created any savings goals.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <h2 className="text-sm font-semibold text-white px-5 py-4 border-b border-surface-800">All user goals</h2>
          <div className="divide-y divide-surface-800">
            {goals.map((goal) => {
              const pct = progress(goal);
              return (
                <div key={goal._id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="flex items-center gap-2.5 min-w-[180px] flex-1 sm:flex-none sm:w-[220px]">
                    <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-300 flex-shrink-0">
                      {goal.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{goal.user?.name}</p>
                      <p className="text-xs text-surface-500 truncate">{goal.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">{goal.name}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border shrink-0 ${goal.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-brand-300 bg-brand-500/10 border-brand-500/20'}`}>
                        {goal.status === 'completed' ? 'Completed' : 'In progress'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden flex-1">
                        <div className={`h-full rounded-full transition-all ${barColor(goal)}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-surface-400 tabular-nums whitespace-nowrap">
                        Rs. {money(goal.savedAmount)} / Rs. {money(goal.targetAmount)} · {pct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
