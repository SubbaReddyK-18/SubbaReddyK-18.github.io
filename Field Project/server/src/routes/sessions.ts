import { Router } from 'express';
import Session from '../models/Session';
import User from '../models/User';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { generateSessionAnalysis } from '../lib/analysis';

const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { subject, isTutorial, tutorialUrl, tutorialPlatform } = req.body;

    const session = new Session({
      userId: req.user!.userId,
      subject,
      isTutorial: isTutorial || false,
      tutorialUrl,
      tutorialPlatform,
      startTime: new Date(),
      status: 'active',
    });

    await session.save();

    res.json({
      sessionId: session._id,
      startTime: session.startTime,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      wallClockSeconds,
      verifiedFocusSeconds,
      distractionSeconds,
      presenceFailSeconds,
      tabSwitchCount,
      presenceCheckCount,
      presenceFailCount,
      status,
    } = req.body;

    const session = await Session.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.wallClockSeconds = wallClockSeconds;
    session.verifiedFocusSeconds = verifiedFocusSeconds;
    session.distractionSeconds = distractionSeconds;
    session.presenceFailSeconds = presenceFailSeconds;
    session.tabSwitchCount = tabSwitchCount;
    session.presenceCheckCount = presenceCheckCount;
    session.presenceFailCount = presenceFailCount;
    session.status = status;
    session.endTime = new Date();

    // FIX Bug 5: Guard against division by zero when wallClockSeconds = 0
    const efficiencyScore = wallClockSeconds > 0
      ? Math.min(100, Math.round((verifiedFocusSeconds / wallClockSeconds) * 1000) / 10)
      : 0;
    session.efficiencyScore = efficiencyScore;

    if (efficiencyScore >= 90) session.verdict = 'champion';
    else if (efficiencyScore >= 75) session.verdict = 'good';
    else if (efficiencyScore >= 55) session.verdict = 'okay';
    else if (efficiencyScore >= 35) session.verdict = 'distracted';
    else session.verdict = 'not-focused';

    if (efficiencyScore <= 20) session.treeStage = 1;
    else if (efficiencyScore <= 50) session.treeStage = 2;
    else if (efficiencyScore <= 75) session.treeStage = 3;
    else if (efficiencyScore <= 95) session.treeStage = 4;
    else session.treeStage = 5;

    await session.save();

    const user = await User.findById(req.user!.userId);
    if (user) {
      user.totalSessions += 1;
      user.totalFocusMinutes += Math.round(verifiedFocusSeconds / 60);

      // FIX Bug 9: Use ISO date strings (YYYY-MM-DD) for reliable date comparison
      // toDateString() is locale-sensitive and can produce inconsistent results
      const today = new Date().toISOString().split('T')[0];
      const lastActive = user.lastActiveDate
        ? new Date(user.lastActiveDate).toISOString().split('T')[0]
        : null;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (lastActive === yesterday) {
        user.streak += 1;
      } else if (lastActive !== today) {
        user.streak = 1;
      }
      // If lastActive === today, streak stays the same (multiple sessions in one day)

      user.lastActiveDate = new Date();
      await user.save();
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { range = 'week' } = req.query;
    let startDate: Date;

    const now = new Date();
    if (range === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const sessions = await Session.find({
      userId: req.user!.userId,
      startTime: { $gte: startDate },
      status: 'completed',
    }).sort({ startTime: -1 });

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/summary', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { range = 'week' } = req.query;
    let startDate: Date;

    const now = new Date();
    if (range === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const sessions = await Session.find({
      userId: req.user!.userId,
      startTime: { $gte: startDate },
      status: 'completed',
    });

    const totalSessions = sessions.length;
    const totalFocusMinutes = Math.round(sessions.reduce((sum, s) => sum + s.verifiedFocusSeconds / 60, 0));
    const avgEfficiency = totalSessions > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.efficiencyScore, 0) / totalSessions * 10) / 10
      : 0;

    const subjectCounts: Record<string, number> = {};
    sessions.forEach(s => {
      subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + s.verifiedFocusSeconds;
    });
    const bestSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const chartData: Record<string, { focusMinutes: number; efficiencySum: number; count: number }> = {};
    sessions.forEach(s => {
      const dateKey = s.startTime.toISOString().split('T')[0];
      if (!chartData[dateKey]) {
        chartData[dateKey] = { focusMinutes: 0, efficiencySum: 0, count: 0 };
      }
      chartData[dateKey].focusMinutes += Math.round(s.verifiedFocusSeconds / 60);
      chartData[dateKey].efficiencySum += s.efficiencyScore;
      chartData[dateKey].count += 1;
    });

    const formattedChartData = Object.entries(chartData).map(([date, data]) => ({
      date,
      focusMinutes: data.focusMinutes,
      efficiency: Math.round(data.efficiencySum / data.count * 10) / 10,
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      totalSessions,
      totalFocusMinutes,
      avgEfficiency,
      bestSubject,
      chartData: formattedChartData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

router.post('/continue', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { previousSessionId, subject } = req.body;

    const previousSession = await Session.findOne({ 
      _id: previousSessionId, 
      userId: req.user!.userId 
    });

    const session = new Session({
      userId: req.user!.userId,
      subject: subject || previousSession?.subject || 'General Study',
      isTutorial: previousSession?.isTutorial || false,
      tutorialUrl: previousSession?.tutorialUrl,
      tutorialPlatform: previousSession?.tutorialPlatform,
      startTime: new Date(),
      status: 'active',
    });

    await session.save();

    res.json({
      sessionId: session._id,
      startTime: session.startTime,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to continue session' });
  }
});

router.post('/analyze/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const analysis = await generateSessionAnalysis({
      subject: session.subject,
      wallClockSeconds: session.wallClockSeconds,
      verifiedFocusSeconds: session.verifiedFocusSeconds,
      distractionSeconds: session.distractionSeconds,
      presenceFailSeconds: session.presenceFailSeconds,
      tabSwitchCount: session.tabSwitchCount,
      presenceFailCount: session.presenceFailCount,
      efficiencyScore: session.efficiencyScore,
      verdict: session.verdict || 'okay',
      treeStage: session.treeStage || 1,
      isTutorial: session.isTutorial,
      tutorialPlatform: session.tutorialPlatform,
      startTime: session.startTime,
    });

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

export default router;
