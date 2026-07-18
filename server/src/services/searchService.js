import Expense from '../models/Expense.js';

export const searchExpenses = async (userId, query) => {
  const regex = new RegExp(query, 'i');
  return Expense.find({
    user: userId,
    $or: [
      { title: regex },
      { notes: regex },
      { category: regex },
    ],
  }).sort({ date: -1 });
};
