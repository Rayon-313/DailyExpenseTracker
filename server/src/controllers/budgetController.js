import BudgetRequest from '../models/BudgetRequest.js';
import User from '../models/User.js';

export const getMyBudgetRequest = async (req, res) => {
  try {
    const request = await BudgetRequest.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestBudgetChange = async (req, res) => {
  try {
    const requestedAmount = Number(req.body.requestedAmount);
    if (isNaN(requestedAmount) || requestedAmount < 0) {
      return res.status(400).json({ message: 'Please provide a valid budget amount' });
    }
    const pending = await BudgetRequest.findOne({ user: req.user._id, status: 'pending' });
    if (pending) {
      return res.status(400).json({ message: 'You already have a pending budget request' });
    }
    const user = await User.findById(req.user._id);
    if (requestedAmount === user.monthlyBudget) {
      return res.status(400).json({ message: 'This is already your current budget' });
    }
    const request = await BudgetRequest.create({
      user: user._id,
      currentAmount: user.monthlyBudget,
      requestedAmount,
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBudgetRequest = async (req, res) => {
  try {
    const request = await BudgetRequest.findOneAndDelete({ user: req.user._id, status: 'pending' });
    if (!request) {
      return res.status(404).json({ message: 'No pending budget request' });
    }
    res.json({ message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBudgetRequests = async (req, res) => {
  try {
    const requests = await BudgetRequest.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewBudgetRequest = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const request = await BudgetRequest.findById(req.params.id).populate('user');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already reviewed' });
    }
    request.status = status;
    request.adminNote = note || '';
    request.reviewedAt = new Date();
    if (status === 'approved') {
      await User.findByIdAndUpdate(request.user._id, { monthlyBudget: request.requestedAmount });
    }
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
