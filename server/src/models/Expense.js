import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Online', 'Other'],
    default: 'Cash',
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ title: 'text', notes: 'text' });

export default mongoose.model('Expense', expenseSchema);
