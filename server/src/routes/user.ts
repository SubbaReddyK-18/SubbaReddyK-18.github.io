import { Router } from 'express';
import User from '../models/User';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.patch('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, avatarGender, subjects, presenceIntervalMinutes, sensitivityLevel, onboardingComplete } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (avatarGender !== undefined) updateData.avatarGender = avatarGender;
    if (subjects !== undefined) updateData.subjects = subjects;
    if (presenceIntervalMinutes !== undefined) updateData.presenceIntervalMinutes = presenceIntervalMinutes;
    if (sensitivityLevel !== undefined) updateData.sensitivityLevel = sensitivityLevel;
    if (onboardingComplete !== undefined) updateData.onboardingComplete = onboardingComplete;

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/onboarding-status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.userId).select('onboardingComplete');
    res.json({ onboardingComplete: user?.onboardingComplete ?? false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch onboarding status' });
  }
});

export default router;
