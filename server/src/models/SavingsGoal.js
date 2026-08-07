import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target must be at least 1'],
  },
  savedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Saved amount cannot be negative'],
  },
  targetDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
  },
}, { timestamps: true });

export default mongoose.model('SavingsGoal', savingsGoalSchema);
