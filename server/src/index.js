import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import User from './models/User.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

const seedDefaultUser = async () => {
  const exists = await User.findOne({ email: 'maharjan.rayon313@gmail.com' });
  if (!exists) {
    await User.create({ name: 'Rayon Maharjan', email: 'maharjan.rayon313@gmail.com', password: 'R@y0n123' });
    console.log('Default user created: maharjan.rayon313@gmail.com / R@y0n123');
  } else {
    console.log('Default user already exists');
  }
};

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();
  await seedDefaultUser();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
