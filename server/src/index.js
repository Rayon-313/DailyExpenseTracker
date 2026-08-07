import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import adminRoutes from './routes/admin.js';
import filterOptionRoutes from './routes/filterOptions.js';
import User from './models/User.js';
import FilterOption from './models/FilterOption.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/filter-options', filterOptionRoutes);

const DEFAULT_FILTER_OPTIONS = [
  { type: 'category', label: 'Food' },
  { type: 'category', label: 'Transport' },
  { type: 'category', label: 'Shopping' },
  { type: 'category', label: 'Bills' },
  { type: 'category', label: 'Entertainment' },
  { type: 'category', label: 'Health' },
  { type: 'category', label: 'Education' },
  { type: 'category', label: 'Other' },
  { type: 'paymentMethod', label: 'Cash' },
  { type: 'paymentMethod', label: 'Card' },
  { type: 'paymentMethod', label: 'Online' },
  { type: 'paymentMethod', label: 'Other' },
];

const seedDefaultUser = async () => {
  const exists = await User.findOne({ email: 'maharjan.rayon313@gmail.com' });
  if (!exists) {
    await User.create({ name: 'Rayon Maharjan', email: 'maharjan.rayon313@gmail.com', password: 'R@y0n123', role: 'user' });
    console.log('Default user created: maharjan.rayon313@gmail.com / R@y0n123');
  } else {
    console.log('Default user already exists');
  }
};

const seedAdminUser = async () => {
  const exists = await User.findOne({ email: 'admin@gmail.com' });
  if (!exists) {
    await User.create({ name: 'Admin', email: 'admin@gmail.com', password: 'admin123', role: 'admin' });
    console.log('Admin user created: admin@gmail.com / admin123');
  } else if (exists.role !== 'admin') {
    exists.role = 'admin';
    await exists.save();
    console.log('Admin role assigned to admin@gmail.com');
  } else {
    console.log('Admin user already exists');
  }
};

const seedFilterOptions = async () => {
  const count = await FilterOption.countDocuments();
  if (count === 0) {
    await FilterOption.insertMany(DEFAULT_FILTER_OPTIONS);
    console.log('Default filter options seeded');
  }
};

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();
  await seedDefaultUser();
  await seedAdminUser();
  await seedFilterOptions();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
