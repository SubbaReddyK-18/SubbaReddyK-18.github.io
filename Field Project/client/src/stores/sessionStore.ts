import { create } from 'zustand';
import { CompletedSession } from '../types';

interface SessionState {
  sessionId: string | null;
  subject: string;
  isTutorial: boolean;
  tutorialUrl: string;
  tutorialPlatform: string;
  tutorialUrlVerified: boolean;

  focusDurationMinutes: number;
  totalFocusSecondsToday: number;
  continuousFocusSeconds: number;
  isBreakRequired: boolean;
  breakEndTime: number | null;

  wallClockSeconds: number;
  verifiedFocusSeconds: number;
  tabSwitchCount: number;
  presenceCheckCount: number;
  presenceFailCount: number;
  presenceFailSeconds: number;

  completedSession: CompletedSession | null;

  startSession: (data: {
    sessionId: string;
    subject: string;
    isTutorial: boolean;
    tutorialUrl: string;
    tutorialPlatform: string;
    tutorialUrlVerified: boolean;
    focusDurationMinutes: number;
  }) => void;
  updateTimers: (data: Partial<SessionState>) => void;
  addContinuousFocus: (seconds: number) => void;
  requireBreak: () => void;
  completeBreak: () => void;
  setCompletedSession: (data: CompletedSession) => void;
  resetSession: () => void;
}

const FOCUS_LIMIT_SECONDS = 40 * 60;
const BREAK_DURATION_MS = 5 * 60 * 1000;

const initialState = {
  sessionId: null,
  subject: '',
  isTutorial: false,
  tutorialUrl: '',
  tutorialPlatform: '',
  tutorialUrlVerified: false,
  focusDurationMinutes: 0,
  totalFocusSecondsToday: 0,
  continuousFocusSeconds: 0,
  isBreakRequired: false,
  breakEndTime: null,
  wallClockSeconds: 0,
  verifiedFocusSeconds: 0,
  tabSwitchCount: 0,
  presenceCheckCount: 0,
  presenceFailCount: 0,
  presenceFailSeconds: 0,
  completedSession: null,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialState,

  startSession: (data) => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('mindora_focus_date');
    const storedSeconds = parseInt(localStorage.getItem('mindora_continuous_focus') || '0', 10);
    
    let continuousFocus = storedSeconds;
    if (storedDate !== today) {
      continuousFocus = 0;
      localStorage.setItem('mindora_focus_date', today);
    }

    set({
      ...initialState,
      sessionId: data.sessionId,
      subject: data.subject,
      isTutorial: data.isTutorial,
      tutorialUrl: data.tutorialUrl,
      tutorialPlatform: data.tutorialPlatform,
      tutorialUrlVerified: data.tutorialUrlVerified,
      focusDurationMinutes: data.focusDurationMinutes,
      continuousFocusSeconds: continuousFocus,
      totalFocusSecondsToday: continuousFocus,
      isBreakRequired: continuousFocus >= FOCUS_LIMIT_SECONDS,
      breakEndTime: continuousFocus >= FOCUS_LIMIT_SECONDS ? Date.now() + BREAK_DURATION_MS : null,
    });
  },

  updateTimers: (data) => {
    set((state) => ({ ...state, ...data }));
  },

  addContinuousFocus: (seconds) => {
    const state = get();
    const newTotal = state.continuousFocusSeconds + seconds;
    const today = new Date().toDateString();
    
    localStorage.setItem('mindora_focus_date', today);
    localStorage.setItem('mindora_continuous_focus', String(newTotal));
    
    set({ 
      continuousFocusSeconds: newTotal,
      totalFocusSecondsToday: newTotal,
      isBreakRequired: newTotal >= FOCUS_LIMIT_SECONDS,
    });
  },

  requireBreak: () => {
    const breakEndTime = Date.now() + BREAK_DURATION_MS;
    localStorage.setItem('mindora_break_end', String(breakEndTime));
    set({ isBreakRequired: true, breakEndTime });
  },

  completeBreak: () => {
    const today = new Date().toDateString();
    localStorage.setItem('mindora_focus_date', today);
    localStorage.setItem('mindora_continuous_focus', '0');
    localStorage.removeItem('mindora_break_end');
    set({ 
      isBreakRequired: false, 
      breakEndTime: null,
      continuousFocusSeconds: 0,
    });
  },

  setCompletedSession: (data) => {
    set({ completedSession: data });
  },

  resetSession: () => {
    set(initialState);
  },
}));
