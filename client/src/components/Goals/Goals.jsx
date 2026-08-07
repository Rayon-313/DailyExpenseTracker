import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { goalAPI } from '../../services/api';
import GoalModal from './GoalModal';

const goalProgress = (g) => (g.targetAmount > 0 ? Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100)) : 0);
const barColor = (g) => {
  if (goalProgress(g) >= 100) return 'bg-emerald-500';
  if (goalProgress(g) >= 70) return 'bg-amber-500';
  return 'bg-brand-500';
};
const money = (n) => Math.round(n).toLocaleString('en-IN');

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [contributing, setContributing] = useState(null);
  const [amount, setAmount] = useState('');
  const [contributeLoading, setContributeLoading] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await goalAPI.getAll();
      setGoals(res.data);
    } catch {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const completedCount = goals.filter((g) => g.status === 'completed').length;

  const handleDelete = async (goal) => {
    if (!window.confirm(`Delete the goal "${goal.name}"?`)) return;
    try {
      await goalAPI.delete(goal._id);
      toast.success('Goal deleted');
      fetchGoals();
    } catch {
      toast.error('Failed to delete goal');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return toast.error('Enter a valid amount');
    setContributeLoading(true);
    try {
      await goalAPI.contribute(contributing._id, value);
      toast.success(`Added Rs. ${money(value)} to "${contributing.name}"`);
      setContributing(null);
      setAmount('');
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add contribution');
    } finally {
      setContributeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4 pb-1">
        <div>
          <p className="text-brand-300 text-[11px] font-semibold uppercase tracking-[.16em] mb-1">Savings goals</p>
          <h1 className="page-title text-2xl sm:text-3xl font-bold text-white">Savings Goals</h1>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary inline-flex items-center justify-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card p-5 min-h-[124px] flex flex-col justify-between">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-surface-400">Active goals</p>
          <p className="page-title text-3xl font-bold text-white mt-3">{goals.length}</p>
        </div>
        <div className="card p-5 min-h-[124px] flex flex-col justify-between">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-surface-400">Completed</p>
          <p className="page-title text-3xl font-bold text-emerald-400 mt-3">{completedCount}</p>
        </div>
        <div className="card p-5 min-h-[124px] flex flex-col justify-between">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-surface-400">Total saved</p>
          <p className="page-title text-3xl font-bold text-brand-400 mt-3">Rs. {money(totalSaved)}</p>
        </div>
        <div className="card p-5 min-h-[124px] flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-surface-400">Overall progress</p>
          <div className="flex items-end justify-between gap-3 mt-auto pt-3">
            <p className="page-title text-3xl font-bold text-white">{overallProgress}%</p>
            <div className="flex-1 max-w-[180px] h-2 bg-surface-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="card h-40 animate-pulse bg-surface-900/60" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 text-brand-400 flex items-center justify-center mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">No goals yet</h2>
          <p className="text-sm text-surface-400 mb-5 max-w-xs">Create your first savings goal and track your progress toward it.</p>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">Create a goal</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = goalProgress(goal);
            const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
            return (
              <div key={goal._id} className="card p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{goal.name}</h3>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {goal.targetDate ? `Due ${new Date(goal.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No target date'}
                    </p>
                  </div>
                  {goal.status === 'completed' ? (
                    <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">Completed</span>
                  ) : (
                    <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-300">In progress</span>
                  )}
                </div>

                <div className="flex items-end justify-between mb-2">
                  <p className="text-xl font-bold text-white">Rs. {money(goal.savedAmount)}</p>
                  <p className="text-xs text-surface-400">of Rs. {money(goal.targetAmount)}</p>
                </div>

                <div className="h-2.5 bg-surface-800 rounded-full overflow-hidden mb-1">
                  <div className={`h-full rounded-full transition-all ${barColor(goal)}`} style={{ width: `${pct}%` }} />
                </div>
                <p className={`text-xs mb-4 ${pct >= 100 ? 'text-emerald-400' : 'text-surface-400'}`}>
                  {pct}% saved {pct < 100 && `· Rs. ${money(remaining)} left`}
                </p>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => { setContributing(goal); setAmount(''); }}
                    className="btn-primary flex-1 !py-2 text-sm"
                  >
                    Add money
                  </button>
                  <button
                    onClick={() => { setEditing(goal); setModalOpen(true); }}
                    className="btn-secondary !py-2 !px-3 text-sm"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(goal)}
                    className="btn-secondary !py-2 !px-3 text-sm hover:!border-red-500/50 hover:!text-red-400"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <GoalModal goal={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); fetchGoals(); }} />
      )}

      {contributing && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setContributing(null)}>
          <div className="bg-surface-900 border border-surface-700 rounded-3xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
              <div>
                <p className="text-brand-300 text-[11px] font-semibold uppercase tracking-[.16em] mb-1">Savings goals</p>
                <h2 className="text-xl font-bold text-white">Add to "{contributing.name}"</h2>
              </div>
              <button onClick={() => setContributing(null)} className="text-surface-400 hover:text-white transition-colors p-1 rounded-md hover:bg-surface-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleContribute} className="p-6 space-y-4">
              <p className="text-sm text-surface-400">
                Saved so far: <span className="font-semibold text-white">Rs. {money(contributing.savedAmount)}</span> of <span className="font-semibold text-white">Rs. {money(contributing.targetAmount)}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Amount to add (Rs.)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="5000"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setContributing(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={contributeLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {contributeLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {contributeLoading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
