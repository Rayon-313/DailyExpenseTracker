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
