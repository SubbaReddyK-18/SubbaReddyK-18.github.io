import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase() ? 'admin' : 'user';

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarGender: user.avatarGender,
        subjects: user.subjects,
        presenceIntervalMinutes: user.presenceIntervalMinutes,
        sensitivityLevel: user.sensitivityLevel,
        streak: user.streak,
        onboardingComplete: user.onboardingComplete,
        totalSessions: user.totalSessions,
        totalFocusMinutes: user.totalFocusMinutes,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
