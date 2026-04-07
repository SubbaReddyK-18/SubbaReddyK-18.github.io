import { Router } from 'express';
import User from '../models/User';
import Session from '../models/Session';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/stats', requireAuth, adminOnly, async (req: AuthRequest, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSessions = await Session.countDocuments();
    const sessions = await Session.find({ status: 'completed' });

    const totalFocusSeconds = sessions.reduce((sum, s) => sum + s.verifiedFocusSeconds, 0);
    const totalFocusHours = Math.round(totalFocusSeconds / 3600);
    const avgEfficiency = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.efficiencyScore, 0) / sessions.length * 10) / 10
      : 0;

    res.json({
      totalUsers,
      totalSessions,
      totalFocusHours,
      avgEfficiency,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/users', requireAuth, adminOnly, async (req: AuthRequest, res) => {
  try {
    const users = await User.find().select('-password');
    const sessions = await Session.find({ status: 'completed' });

    const userData = users.map(u => {
      const userSessions = sessions.filter(s => s.userId.toString() === u._id.toString());
      const totalFocusMinutes = userSessions.reduce((sum, s) => sum + Math.round(s.verifiedFocusSeconds / 60), 0);

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        totalSessions: userSessions.length,
        totalFocusMinutes,
        streak: u.streak,
        createdAt: u.createdAt,
      };
    });

    res.json({ users: userData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/users/:id/role', requireAuth, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.get('/export', requireAuth, adminOnly, async (req: AuthRequest, res) => {
  try {
    const sessions = await Session.find({ status: 'completed' })
      .populate('userId', 'name email')
      .sort({ startTime: -1 });

    const headers = ['Date', 'User', 'Email', 'Subject', 'Duration (min)', 'Verified Focus (min)', 'Efficiency %', 'Verdict'];
    const rows = sessions.map(s => [
      s.startTime.toISOString().split('T')[0],
      (s.userId as any).name,
      (s.userId as any).email,
      s.subject,
      Math.round(s.wallClockSeconds / 60),
      Math.round(s.verifiedFocusSeconds / 60),
      s.efficiencyScore,
      s.verdict,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sessions.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
