import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRouter from './routes/auth';
import userRouter from './routes/user';
import sessionsRouter from './routes/sessions';
import verifyUrlRouter from './routes/verifyUrl';
import forestRouter from './routes/forest';
import communityRouter from './routes/community';
import adminRouter from './routes/admin';

dotenv.config();

const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'] as const;
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/verify-url', verifyUrlRouter);
app.use('/api/forest', forestRouter);
app.use('/api/community', communityRouter);
app.use('/api/admin', adminRouter);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindora').then(() => {
  console.log('MongoDB connected');
  app.listen(Number(process.env.PORT) || 3001, () => {
    console.log(`Server running on http://localhost:${process.env.PORT || 3001}`);
  });
}).catch(err => {
  console.error('MongoDB connection failed:', err);
  process.exit(1);
});
