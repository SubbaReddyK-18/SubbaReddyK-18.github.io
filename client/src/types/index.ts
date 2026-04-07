export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarGender: 'male' | 'female' | 'neutral';
  subjects: string[];
  presenceIntervalMinutes: number;
  sensitivityLevel: 'low' | 'medium' | 'high';
  totalSessions: number;
  totalFocusMinutes: number;
  streak: number;
  onboardingComplete: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Session {
  _id: string;
  userId: string;
  subject: string;
  isTutorial: boolean;
  tutorialUrl?: string;
  tutorialPlatform?: string;
  startTime: Date;
  endTime?: Date;
  wallClockSeconds: number;
  verifiedFocusSeconds: number;
  distractionSeconds: number;
  presenceFailSeconds: number;
  tabSwitchCount: number;
  presenceCheckCount: number;
  presenceFailCount: number;
  efficiencyScore: number;
  verdict: 'champion' | 'good' | 'okay' | 'distracted' | 'not-focused';
  treeStage: 0 | 1 | 2 | 3 | 4 | 5;
  status: 'active' | 'completed' | 'abandoned';
}

export interface CompletedSession extends Session {
  startTime: Date;
  endTime: Date;
}

export interface UrlVerificationResult {
  verified: boolean;
  platform?: string;
  category?: string;
  reason?: string;
}

export interface ForestDay {
  date: string;
  treeStage: number;
  focusMinutes: number;
  efficiency: number;
  subject: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  streak: number;
  avgEfficiency: number;
  isCurrentUser: boolean;
}
