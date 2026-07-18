import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const updateBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    if (monthlyBudget === undefined || monthlyBudget < 0) {
      return res.status(400).json({ message: 'Please provide a valid budget amount' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { monthlyBudget },
      { new: true }
    );
    res.json({ user, message: 'Budget updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
