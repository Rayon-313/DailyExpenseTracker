import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { expenseAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [budgetData, setBudgetData] = useState(null);
  const mobileRef = useRef(null);
  const notifiedRef = useRef(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) return;
    expenseAPI.getDashboard()
      .then((res) => {
        setBudgetData({
          budget: res.data.monthlyBudget,
          spent: res.data.currentMonthTotal,
          percentage: res.data.budgetPercentage,
        });
      })
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (budgetData && budgetData.budget > 0 && budgetData.percentage >= 70 && !notifiedRef.current) {
      notifiedRef.current = true;
      if (budgetData.percentage >= 100) {
        toast.error(`Monthly budget exceeded! You've spent Rs. ${budgetData.spent.toLocaleString()} of Rs. ${budgetData.budget.toLocaleString()}`, { duration: 5000 });
      } else {
        toast(`Warning: You've used ${budgetData.percentage}% of your monthly budget`, { icon: '⚠️', duration: 4000 });
      }
    }
  }, [budgetData]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/20'
        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
    }`;

  const getBarColor = () => {
    if (!budgetData || budgetData.budget <= 0) return 'bg-brand-500';
    if (budgetData.percentage >= 100) return 'bg-red-500';
    if (budgetData.percentage >= 70) return 'bg-amber-500';
    return 'bg-brand-500';
  };

  const hasBudget = budgetData && budgetData.budget > 0;

  return (
    <div className="min-h-screen bg-surface-950">
      <header className="sticky top-0 z-50 bg-surface-950/85 backdrop-blur-xl border-b border-surface-800">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-3 text-base font-semibold text-white no-underline">
              <div className="w-9 h-9 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/30 rotate-[-4deg]">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="page-title text-xl tracking-tight">paisa.</span>
            </NavLink>

            <div className="hidden sm:flex items-center gap-1 rounded-xl bg-surface-900/70 border border-surface-800 p-1">
              {isAdmin ? (
                <NavLink to="/admin" end className={linkClass}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894zM12 15a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                  Admin Panel
                </NavLink>
              ) : (
                <>
                  <NavLink to="/" end className={linkClass}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                    Expenses
                  </NavLink>
                  <NavLink to="/dashboard" className={linkClass}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                    Dashboard
                  </NavLink>
                  <NavLink to="/goals" className={linkClass}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Goals
                  </NavLink>
                </>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2.5 pl-3 border-l border-surface-800">
                <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-300">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-surface-400 max-w-[100px] truncate">{user?.name}</span>
                <button onClick={handleLogout} className="text-surface-500 hover:text-surface-300 transition-colors duration-150 p-1.5 rounded-md hover:bg-surface-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              className="sm:hidden p-2 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                }
              </svg>
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div ref={mobileRef} className="sm:hidden border-t border-surface-800 bg-surface-900/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1">
              {isAdmin ? (
                <NavLink to="/admin" end className={linkClass} onClick={() => setMobileOpen(false)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894zM12 15a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                  Admin Panel
                </NavLink>
              ) : (
                <>
                  <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                    Expenses
                  </NavLink>
                  <NavLink to="/dashboard" className={linkClass} onClick={() => setMobileOpen(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                    Dashboard
                  </NavLink>
                  <NavLink to="/goals" className={linkClass} onClick={() => setMobileOpen(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Goals
                  </NavLink>
                </>
              )}
              <div className="border-t border-surface-800 my-2" />
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-300">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-surface-400 flex-1 truncate">{user?.name}</span>
                <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="text-surface-500 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-surface-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {!isAdmin && hasBudget && (
          <div className="border-t border-surface-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[.14em] text-surface-400 whitespace-nowrap">This month</span>
                <div className="flex-1">
                  <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
                      style={{ width: `${Math.min(budgetData.percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <span className={`text-xs font-medium tabular-nums whitespace-nowrap ${budgetData.percentage >= 100 ? 'text-red-400' : budgetData.percentage >= 70 ? 'text-amber-400' : 'text-surface-400'}`}>
                  Rs. {budgetData.spent.toLocaleString()} / {budgetData.budget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
