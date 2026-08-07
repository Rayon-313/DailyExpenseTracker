import mongoose from 'mongoose';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import FilterOption from '../models/FilterOption.js';
import SavingsGoal from '../models/SavingsGoal.js';
import { computeDashboard } from '../services/dashboardService.js';

export const getFilterOptions = async (req, res) => {
  try {
    const options = await FilterOption.find().sort({ type: 1, createdAt: 1 });
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addFilterOption = async (req, res) => {
  try {
    const { type, label } = req.body;
    if (!['category', 'paymentMethod'].includes(type) || !label || !label.trim()) {
      return res.status(400).json({ message: 'A valid type and label are required' });
    }
    const option = await FilterOption.findOneAndUpdate(
      { type, label: label.trim() },
      { type, label: label.trim(), createdBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(option);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFilterOption = async (req, res) => {
  try {
    const option = await FilterOption.findByIdAndDelete(req.params.id);
    if (!option) {
      return res.status(404).json({ message: 'Filter option not found' });
    }
    res.json({ message: 'Filter option deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserDashboard = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const data = await computeDashboard(user._id);
    res.json({ user, dashboard: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserExpenses = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const expenses = await Expense.find({ user: user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be deleted' });
    }
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    await Promise.all([
      Expense.deleteMany({ user: user._id }),
      SavingsGoal.deleteMany({ user: user._id }),
    ]);
    await User.findByIdAndDelete(user._id);
    res.json({ message: `User "${user.name}" and their data deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGoalsAnalytics = async (req, res) => {
  try {
    const goals = await SavingsGoal.find();
    const users = await User.find().select('name email');

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const byUser = {};
    for (const g of goals) {
      const key = String(g.user);
      if (!byUser[key]) {
        const u = userMap.get(key);
        byUser[key] = {
          userId: key,
          name: u ? u.name : 'Unknown',
          email: u ? u.email : '',
          goals: 0,
          saved: 0,
          target: 0,
          completed: 0,
        };
      }
      byUser[key].goals += 1;
      byUser[key].saved += g.savedAmount;
      byUser[key].target += g.targetAmount;
      if (g.status === 'completed') byUser[key].completed += 1;
    }

    res.json({
      totalGoals,
      completedGoals,
      completionRate: totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0,
      totalSaved,
      totalTarget,
      overallProgress: totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0,
      byUser: Object.values(byUser),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const users = await User.find({ role: { $ne: 'admin' } });

    const totalUsers = users.length;
    const totalExpenses = expenses.length;
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthTotal = expenses
      .filter((e) => e.date >= startOfMonth)
      .reduce((s, e) => s + e.amount, 0);

    const monthlyMap = new Map();
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          key,
          name: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
          total: 0,
          count: 0,
        });
      }
      monthlyMap.get(key).total += e.amount;
      monthlyMap.get(key).count += 1;
    });
    const monthlyTotals = Array.from(monthlyMap.values()).sort((a, b) => a.key.localeCompare(b.key));

    const categoryTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const spendByUser = {};
    expenses.forEach((e) => {
      const key = String(e.user);
      spendByUser[key] = (spendByUser[key] || 0) + e.amount;
    });
    const topSpenders = Object.entries(spendByUser)
      .map(([id, total]) => ({
        name: userMap.get(id)?.name || 'Deleted user',
        email: userMap.get(id)?.email || '',
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const userTotals = users
      .map((u) => ({
        name: u.name,
        email: u.email,
        total: spendByUser[String(u._id)] || 0,
      }))
      .sort((a, b) => b.total - a.total);

    res.json({
      totalUsers,
      totalExpenses,
      totalSpent,
      currentMonthTotal,
      monthlyTotals,
      categoryTotals,
      topSpenders,
      userTotals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
