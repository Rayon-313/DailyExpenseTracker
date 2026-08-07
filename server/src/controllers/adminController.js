import mongoose from 'mongoose';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import FilterOption from '../models/FilterOption.js';
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
