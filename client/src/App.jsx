import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ExpenseList from './components/Expenses/ExpenseList';
import Dashboard from './components/Dashboard/Dashboard';
import AdminPanel from './components/Admin/AdminPanel';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-950">
      <div className="w-8 h-8 border-2 border-surface-700 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" />;
}

function RequireUser({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/" element={<RequireUser><Layout /></RequireUser>}>
        <Route index element={<ExpenseList />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      <Route path="/admin" element={<RequireAdmin><Layout /></RequireAdmin>}>
        <Route index element={<AdminPanel />} />
      </Route>

      <Route path="*" element={<ProtectedRoute><Navigate to="/" replace /></ProtectedRoute>} />
    </Routes>
  );
}
