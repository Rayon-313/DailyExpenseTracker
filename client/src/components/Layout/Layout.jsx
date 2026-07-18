import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-accent-500 to-purple-600 text-white shadow-lg shadow-accent-500/20'
        : 'text-white/70 hover:text-white hover:bg-white/10'
    }`;

  return (
    <div className="min-h-screen">
      <nav className="glass fixed top-4 left-4 right-4 z-50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 text-xl font-bold">
            <span className="text-2xl">💰</span>
            <span className="bg-gradient-to-r from-accent-400 to-purple-400 bg-clip-text text-transparent">
              DailyExpense
            </span>
          </NavLink>
          <div className="flex items-center gap-3">
            <NavLink to="/" end className={linkClass}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Expenses
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Dashboard
            </NavLink>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-white/80 text-sm hidden md:block">{user?.name}</span>
              <button onClick={handleLogout} className="btn-secondary !px-3 !py-1.5 text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
