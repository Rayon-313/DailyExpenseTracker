import express from 'express';
import {
  getMyBudgetRequest, requestBudgetChange, cancelBudgetRequest,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getMyBudgetRequest);
router.post('/', requestBudgetChange);
router.delete('/', cancelBudgetRequest);

export default router;
