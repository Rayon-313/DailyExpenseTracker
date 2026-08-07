import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI, filterOptionAPI } from '../../services/api';

const COLORS = ['#ed6534', '#d6a252', '#699b80', '#a17aaf', '#5d93a8', '#d16f75', '#c37c55', '#84936b'];

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminPanel() {
  const [tab, setTab] = useState('filters');
  const [options, setOptions] = useState([]);
  const [type, setType] = useState('category');
  const [label, setLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userExpenses, setUserExpenses] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchOptions = async () => {
    try {
      const res = await filterOptionAPI.getAll();
      setOptions(res.data);
    } catch (err) {
      toast.error('Failed to load filter options');
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!label.trim()) return toast.error('Please enter a label');
    setAdding(true);
    try {
      await adminAPI.addFilterOption(type, label.trim());
      toast.success('Filter option added');
      setLabel('');
      fetchOptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add option');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (option) => {
    if (!window.confirm(`Delete "${option.label}"? Users will no longer see it as an option.`)) return;
    try {
      await adminAPI.deleteFilterOption(option._id);
      toast.success('Filter option deleted');
      fetchOptions();
    } catch (err) {
      toast.error('Failed to delete option');
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const openUser = async (user) => {
    setSelectedUser(user);
    setUserData(null);
    setUserExpenses([]);
    setViewLoading(true);
    try {
      const [dashRes, expRes] = await Promise.all([
        adminAPI.getUserDashboard(user._id),
        adminAPI.getUserExpenses(user._id),
      ]);
      setUserData(dashRes.data);
      setUserExpenses(expRes.data);
    } catch (err) {
      toast.error('Failed to load user data');
    } finally {
      setViewLoading(false);
    }
  };

  const categories = options.filter((o) => o.type === 'category');
  const paymentMethods = options.filter((o) => o.type === 'paymentMethod');

  const tabClass = (active) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
      active
        ? 'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/20'
        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
    }`;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-brand-300 text-xs font-semibold uppercase tracking-[.18em] mb-2">Admin console</p>
        <h1 className="page-title text-3xl sm:text-4xl font-bold text-white">Manage filters & users</h1>
        <p className="text-surface-400 text-sm mt-1">Add filter options seen by all users and browse user dashboards (read-only).</p>
      </div>

      <div className="flex items-center gap-1 rounded-xl bg-surface-900/70 border border-surface-800 p-1 w-fit">
        <button className={tabClass(tab === 'filters')} onClick={() => setTab('filters')}>Filter Options</button>
        <button className={tabClass(tab === 'users')} onClick={() => { setTab('users'); loadUsers(); }}>Users</button>
      </div>

      {tab === 'filters' && (
        <>
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Add a new filter option</h2>
            <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Type</label>
                <select className="input-field w-auto" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="category">Category</option>
                  <option value="paymentMethod">Payment Method</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Label</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={type === 'category' ? 'e.g. Travel' : 'e.g. UPI'}
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <button type="submit" disabled={adding} className="btn-primary flex items-center gap-1.5">
                {adding ? 'Adding...' : 'Add'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Categories</h2>
              {categories.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-6">No categories yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((option) => (
                    <span key={option._id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800 border border-surface-700 text-sm text-surface-200">
                      {option.label}
                      <button onClick={() => handleDelete(option)} className="text-surface-500 hover:text-red-400 transition-colors" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Payment Methods</h2>
              {paymentMethods.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-6">No payment methods yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((option) => (
                    <span key={option._id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800 border border-surface-700 text-sm text-surface-200">
                      {option.label}
                      <button onClick={() => handleDelete(option)} className="text-surface-500 hover:text-red-400 transition-colors" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        selectedUser ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setSelectedUser(null)} className="btn-secondary flex items-center gap-1.5 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to users
              </button>
              <div className="text-right">
                <h2 className="text-base font-semibold text-white">{selectedUser.name}</h2>
                <p className="text-xs text-surface-400">{selectedUser.email}</p>
              </div>
            </div>

            {viewLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-2 border-surface-700 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="card p-5">
                    <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Total Expenses</p>
                    <p className="text-2xl font-bold text-white mt-2">{userData?.dashboard?.count ?? 0}</p>
                    <p className="text-xs text-surface-500 mt-0.5">transactions</p>
                  </div>
                  <div className="card p-5">
                    <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">Total Spent</p>
                    <p className="text-2xl font-bold text-brand-300 mt-2">Rs. {(userData?.dashboard?.total ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-surface-500 mt-0.5">all time</p>
                  </div>
                  <div className="card p-5">
                    <p className="text-xs font-medium text-surface-400 uppercase tracking-[.12em]">This Month</p>
                    <p className="text-2xl font-bold text-white mt-2">Rs. {(userData?.dashboard?.currentMonthTotal ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {userData?.dashboard?.monthlyBudget > 0
                        ? `of Rs. ${userData.dashboard.monthlyBudget.toLocaleString()} budget`
                        : 'no budget set'}
                    </p>
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Spending by Category</h3>
                  {userData && Object.keys(userData.dashboard.categoryTotals).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(userData.dashboard.categoryTotals).map(([name, value], index) => (
                        <div key={name} className="flex items-center gap-2 text-sm">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-surface-300 flex-1 truncate">{name}</span>
                          <span className="text-surface-400 font-medium tabular-nums">Rs. {value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-surface-500 text-sm text-center py-6">No category data</p>
                  )}
                </div>

                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Expenses (read-only)</h3>
                  {userExpenses.length === 0 ? (
                    <p className="text-surface-500 text-sm text-center py-6">No expenses</p>
                  ) : (
                    <div className="space-y-2">
                      {userExpenses.map((expense) => (
                        <div key={expense._id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-800">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{expense.title}</p>
                            <p className="text-xs text-surface-500">{formatDate(expense.date)}</p>
                          </div>
                          <span className="text-xs px-1.5 py-0.5 rounded text-surface-300 bg-surface-700/60 border border-surface-600/40">{expense.category}</span>
                          <span className="text-sm font-semibold text-white">Rs. {expense.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            {loadingUsers ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-2 border-surface-700 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-16">No users found</p>
            ) : (
              <div className="divide-y divide-surface-800">
                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => openUser(user)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-800/50 transition-colors duration-150"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-sm font-semibold text-brand-300 flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-surface-500 truncate">{user.email}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${user.role === 'admin' ? 'text-violet-300 bg-violet-500/10 border-violet-500/20' : 'text-surface-400 bg-surface-800 border-surface-700'}`}>
                      {user.role}
                    </span>
                    <svg className="w-4 h-4 text-surface-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
