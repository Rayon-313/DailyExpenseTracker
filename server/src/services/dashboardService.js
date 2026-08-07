import Expense from '../models/Expense.js';
import User from '../models/User.js';

export const computeDashboard = async (userId) => {
  const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthExpenses = expenses.filter(
    (e) => e.date >= startOfMonth && e.date <= endOfMonth
  );
  const currentMonthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const user = await User.findById(userId);
  const monthlyBudget = user?.monthlyBudget || 0;

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const monthlyTotals = expenses.reduce((acc, e) => {
    const month = new Date(e.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + e.amount;
    return acc;
  }, {});

  return {
    total,
    count: expenses.length,
    categoryTotals,
    monthlyTotals,
    monthlyBudget,
    currentMonthTotal,
    budgetRemaining: monthlyBudget - currentMonthTotal,
    budgetPercentage: monthlyBudget > 0 ? Math.round((currentMonthTotal / monthlyBudget) * 100) : 0,
  };
};
