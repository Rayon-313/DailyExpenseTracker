import express from 'express';
import {
  addFilterOption, deleteFilterOption,
  getUsers, getUserDashboard, getUserExpenses, deleteUser,
  getGoals, getGoalsAnalytics, getAnalytics,
} from '../controllers/adminController.js';
import { getBudgetRequests, reviewBudgetRequest } from '../controllers/budgetController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, adminOnly);
router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.get('/users/:id/dashboard', getUserDashboard);
router.get('/users/:id/expenses', getUserExpenses);
router.delete('/users/:id', deleteUser);
router.get('/goals', getGoals);
router.get('/goals/analytics', getGoalsAnalytics);
router.get('/budget-requests', getBudgetRequests);
router.put('/budget-requests/:id/review', reviewBudgetRequest);
router.post('/filter-options', addFilterOption);
router.delete('/filter-options/:id', deleteFilterOption);

export default router;
