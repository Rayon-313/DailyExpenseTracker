import mongoose from 'mongoose';

const budgetRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  requestedAmount: {
    type: Number,
    required: [true, 'Requested amount is required'],
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: {
    type: String,
  },
  reviewedAt: {
    type: Date,
  },
}, { timestamps: true });

export default mongoose.model('BudgetRequest', budgetRequestSchema);
