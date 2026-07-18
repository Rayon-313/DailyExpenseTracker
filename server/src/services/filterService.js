import Expense from '../models/Expense.js';

export const filterExpenses = async (userId, filters) => {
  const query = { user: userId };

  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.paymentMethod) {
    query.paymentMethod = filters.paymentMethod;
  }
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }
  if (filters.minAmount || filters.maxAmount) {
    query.amount = {};
    if (filters.minAmount) query.amount.$gte = Number(filters.minAmount);
    if (filters.maxAmount) query.amount.$lte = Number(filters.maxAmount);
  }

  return Expense.find(query).sort({ date: -1 });
};
