import express from 'express';
import { getFilterOptions } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getFilterOptions);

export default router;
