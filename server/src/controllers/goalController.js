import SavingsGoal from '../models/SavingsGoal.js';

export const getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, savedAmount, targetDate } = req.body;
    if (!name || !name.trim() || !targetAmount || Number(targetAmount) <= 0) {
      return res.status(400).json({ message: 'A name and a positive target amount are required' });
    }
    const goal = await SavingsGoal.create({
      user: req.user._id,
      name: name.trim(),
      targetAmount: Number(targetAmount),
      savedAmount: Number(savedAmount) || 0,
      targetDate: targetDate || undefined,
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, savedAmount, targetDate } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (targetAmount !== undefined) updates.targetAmount = Number(targetAmount);
    if (savedAmount !== undefined) updates.savedAmount = Number(savedAmount);
    if (targetDate !== undefined) updates.targetDate = targetDate || null;

    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    goal.status = goal.savedAmount >= goal.targetAmount ? 'completed' : 'in-progress';
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const contributeToGoal = async (req, res) => {
  try {
    const value = Number(req.body.amount);
    if (!value || value <= 0) {
      return res.status(400).json({ message: 'Please provide a valid amount' });
    }
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    const newSaved = Math.min(goal.targetAmount, goal.savedAmount + value);
    goal.savedAmount = newSaved;
    goal.status = newSaved >= goal.targetAmount ? 'completed' : 'in-progress';
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
