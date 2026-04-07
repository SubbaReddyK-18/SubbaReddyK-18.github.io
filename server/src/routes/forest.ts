import { Router } from 'express';
import mongoose from 'mongoose';
import Session from '../models/Session';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// FIX Bug 7: Replace N+1 sequential DB queries with single aggregation pipeline.
// Previously: 7 queries for week view, 30 for month view, 12 for year view.
// Now: 1 query per request.

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { view = 'week' } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    if (view === 'week') {
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      // Single aggregation: group all sessions for the past 7 days by date
      const results = await Session.aggregate([
        {
          $match: {
            userId,
            startTime: { $gte: weekStart },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            treeStage: { $max: '$treeStage' },
            focusMinutes: {
              $sum: { $divide: ['$verifiedFocusSeconds', 60] },
            },
            efficiency: { $avg: '$efficiencyScore' },
            subject: { $last: '$subject' },
          },
        },
      ]);

      // Build a lookup map from DB results
      const byDate: Record<string, (typeof results)[0]> = {};
      results.forEach((r) => { byDate[r._id] = r; });

      // Fill all 7 days (including days with no sessions)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const entry = byDate[dateStr];
        days.push({
          date: dateStr,
          treeStage: entry?.treeStage ?? 0,
          focusMinutes: entry ? Math.round(entry.focusMinutes) : 0,
          efficiency: entry ? Math.round(entry.efficiency * 10) / 10 : 0,
          subject: entry?.subject ?? null,
        });
      }

      return res.json({ view: 'week', days });
    }

    if (view === 'month') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      const results = await Session.aggregate([
        {
          $match: {
            userId,
            startTime: { $gte: monthStart },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            focusMinutes: { $sum: { $divide: ['$verifiedFocusSeconds', 60] } },
          },
        },
      ]);

      const byDate: Record<string, number> = {};
      results.forEach((r) => { byDate[r._id] = r.focusMinutes; });

      const days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), i);
        const dateStr = d.toISOString().split('T')[0];
        days.push({ date: dateStr, focusMinutes: Math.round(byDate[dateStr] ?? 0) });
      }

      return res.json({ view: 'month', days });
    }

    if (view === 'year') {
      const year = new Date().getFullYear();
      const yearStart = new Date(year, 0, 1);

      const results = await Session.aggregate([
        {
          $match: {
            userId,
            startTime: { $gte: yearStart },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: { $month: '$startTime' },
            totalFocusMinutes: { $sum: { $divide: ['$verifiedFocusSeconds', 60] } },
          },
        },
      ]);

      const byMonth: Record<number, number> = {};
      results.forEach((r) => { byMonth[r._id] = r.totalFocusMinutes; });

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const yearlyData = months.map((month, i) => ({
        month,
        totalFocusMinutes: Math.round(byMonth[i + 1] ?? 0),
      }));

      return res.json({ view: 'year', data: yearlyData });
    }

    res.status(400).json({ error: 'Invalid view parameter' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forest data' });
  }
});

export default router;
