import mongoose from 'mongoose';

const filterOptionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['category', 'paymentMethod'],
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

filterOptionSchema.index({ type: 1, label: 1 }, { unique: true });

export default mongoose.model('FilterOption', filterOptionSchema);
