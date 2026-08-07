import Expense from '../models/Expense.js';
import { searchExpenses } from '../services/searchService.js';
import { filterExpenses } from '../services/filterService.js';
import { computeDashboard } from '../services/dashboardService.js';
import { generateInsights } from '../services/insightsService.js';

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
    const data = await computeDashboard(req.user._id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInsights = async (req, res) => {
  try {
    const insights = await generateInsights(req.user._id);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
