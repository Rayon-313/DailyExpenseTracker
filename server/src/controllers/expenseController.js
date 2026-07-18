import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { searchExpenses } from '../services/searchService.js';
import { filterExpenses } from '../services/filterService.js';

export const getExpenses = async (req, res) => {
  try {
    const { search, ...filters } = req.query;
    let expenses;
    if (search) {
      expenses = await searchExpenses(req.user._id, search);
    } else if (Object.keys(filters).length > 0) {
      expenses = await filterExpenses(req.user._id, filters);
    } else {
      expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    }
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthExpenses = expenses.filter(
      (e) => e.date >= startOfMonth && e.date <= endOfMonth
    );
    const currentMonthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const user = await User.findById(req.user._id);
    const monthlyBudget = user.monthlyBudget || 0;

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

    res.json({
      total,
      count: expenses.length,
      categoryTotals,
      monthlyTotals,
      monthlyBudget,
      currentMonthTotal,
      budgetRemaining: monthlyBudget - currentMonthTotal,
      budgetPercentage: monthlyBudget > 0 ? Math.round((currentMonthTotal / monthlyBudget) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
