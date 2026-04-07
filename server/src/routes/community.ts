import { Router } from 'express';
import mongoose from 'mongoose';
import Session, { ISession } from '../models/Session';
import User from '../models/User';
import { requireAuth, AuthRequest } from '../middleware/auth';

// FIX Bug 8: After .populate(), userId is a User document not an ObjectId.
// We define a proper interface for the populated session to avoid runtime errors.
interface PopulatedSession extends Omit<ISession, 'userId'> {
  userId: { _id: mongoose.Types.ObjectId; name: string; email: string };
}

const router = Router();

router.get('/heatmap', requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const sessions = await Session.find({
      userId: req.user!.userId,
      startTime: { $gte: startDate },
      status: 'completed',
    });

    const heatmapData: Record<string, number> = {};
    sessions.forEach(s => {
      const dateStr = s.startTime.toISOString().split('T')[0];
      heatmapData[dateStr] = (heatmapData[dateStr] || 0) + Math.round(s.verifiedFocusSeconds / 60);
    });

    const heatmap = Object.entries(heatmapData).map(([date, focusMinutes]) => ({
      date,
      focusMinutes,
    }));

    res.json({ heatmap });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

router.get('/leaderboard', requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const sessions = await Session.find({
      startTime: { $gte: thirtyDaysAgo },
      status: 'completed',
    }).populate('userId', 'name email') as unknown as PopulatedSession[];

    const userScores: Record<string, { score: number; streak: number; sessions: number; focusMinutes: number }> = {};

    sessions.forEach(s => {
      // userId is now the populated User object
      const userId = s.userId._id.toString();
      if (!userScores[userId]) {
        userScores[userId] = { score: 0, streak: 0, sessions: 0, focusMinutes: 0 };
      }
      userScores[userId].sessions += 1;
      userScores[userId].focusMinutes += Math.round(s.verifiedFocusSeconds / 60);
      userScores[userId].score += (s.verifiedFocusSeconds / 60) * (s.efficiencyScore / 100);
    });

    const users = await User.find({ _id: { $in: Object.keys(userScores) } });

    const leaderboard = users.map(u => {
      const data = userScores[u._id.toString()];
      return {
        userId: u._id,
        displayName: maskEmail(u.name),
        score: Math.round(data.score),
        streak: u.streak,
        avgEfficiency: data.focusMinutes > 0
          ? Math.round((data.score / data.focusMinutes) * 100 * 10) / 10
          : 0,
        totalSessions: data.sessions,
      };
    });

    leaderboard.sort((a, b) => b.score - a.score);

    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
      isCurrentUser: entry.userId.toString() === req.user!.userId,
    }));

    const currentUserRank = formattedLeaderboard.findIndex(e => e.isCurrentUser) + 1;

    res.json({
      leaderboard: formattedLeaderboard,
      currentUserRank: currentUserRank || null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

function maskEmail(name: string): string {
  if (name.length <= 4) return name[0] + '***' + name[name.length - 1];
  return name.substring(0, 2) + '***' + name.substring(name.length - 2);
}

export default router;
