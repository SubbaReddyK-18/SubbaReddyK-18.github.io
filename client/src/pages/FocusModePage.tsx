import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import { formatTime } from '../lib/utils';
import TreeSVG from '../components/TreeSVG';
import AvatarSVG from '../components/AvatarSVG';
import PresenceModal from '../components/PresenceModal';

const FOCUS_LIMIT_SECONDS = 40 * 60;

const TAB_SWITCH_MESSAGES = [
  { title: 'Stay in the zone!', message: 'Your focus is building. Every minute counts!', emoji: '🎯' },
  { title: 'Eyes on the prize!', message: 'Distractions break your concentration flow.', emoji: '🔥' },
  { title: 'You got this!', message: 'Focus is a muscle. Train it!', emoji: '💪' },
  { title: 'Return to focus!', message: 'Your brain was just getting started.', emoji: '🧠' },
  { title: 'Stay present!', message: 'Each distraction costs you precious focus time.', emoji: '⏰' },
];

export default function FocusModePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    sessionId,
    subject,
    isTutorial,
    tutorialPlatform,
    focusDurationMinutes,
    continuousFocusSeconds,
    addContinuousFocus,
    requireBreak,
    setCompletedSession,
    resetSession,
  } = useSessionStore();

  const [showNavGuard, setShowNavGuard] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isPresenceModalOpen, setIsPresenceModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showTabAlert, setShowTabAlert] = useState(false);
  const [tabAlertMessage, setTabAlertMessage] = useState(TAB_SWITCH_MESSAGES[0]);

  // State for live display updates
  const [displayWall, setDisplayWall] = useState(0);
  const [displayVerified, setDisplayVerified] = useState(0);
  const [displayTabSwitches, setDisplayTabSwitches] = useState(0);
  const [displayDistraction, setDisplayDistraction] = useState(0);
  const [timeUntilNextCheck, setTimeUntilNextCheck] = useState(0);

  const wallClockRef = useRef(0);
  const verifiedFocusRef = useRef(0);
  const distractionSecondsRef = useRef(0);
  const presenceFailSecondsRef = useRef(0);
  const presenceFailCountRef = useRef(0);
  const presenceCheckCountRef = useRef(0);
  const tabSwitchCountRef = useRef(0);
  const distractionStartTimeRef = useRef<number | null>(null);

  const isPausedRef = useRef(false);
  const isPresenceModalOpenRef = useRef(false);
  const isTabHiddenRef = useRef(false);

  const wallClockIntervalRef = useRef<number | null>(null);
  const presenceCheckTimeoutRef = useRef<number | null>(null);
  const nextCheckCountdownRef = useRef(0);
  const breakCheckIntervalRef = useRef<number | null>(null);
  const tabAlertTimeoutRef = useRef<number | null>(null);

  const presenceIntervalMs = (user?.presenceIntervalMinutes || 10) * 60 * 1000;

  const checkBreakRequirement = useCallback(() => {
    const currentContinuous = continuousFocusSeconds + wallClockRef.current;
    if (currentContinuous >= FOCUS_LIMIT_SECONDS) {
      addContinuousFocus(wallClockRef.current);
      requireBreak();
      navigate('/break');
    }
  }, [continuousFocusSeconds, addContinuousFocus, requireBreak, navigate]);

  const showRandomTabAlert = useCallback(() => {
    const randomMsg = TAB_SWITCH_MESSAGES[Math.floor(Math.random() * TAB_SWITCH_MESSAGES.length)];
    setTabAlertMessage(randomMsg);
    setShowTabAlert(true);
    if (tabAlertTimeoutRef.current) clearTimeout(tabAlertTimeoutRef.current);
    tabAlertTimeoutRef.current = window.setTimeout(() => {
      setShowTabAlert(false);
    }, 4000);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

wallClockIntervalRef.current = window.setInterval(() => {
      if (!isPausedRef.current) {
        wallClockRef.current += 1;
        
        // Only tick when tab is visible AND presence modal is closed (both modes)
        if (!isTabHiddenRef.current && !isPresenceModalOpenRef.current) {
          if (isTutorial) {
            verifiedFocusRef.current += 1;
          } else {
            verifiedFocusRef.current += 1;
          }
        }
      }
      
      nextCheckCountdownRef.current = Math.max(0, nextCheckCountdownRef.current - 1);
    }, 1000);

    breakCheckIntervalRef.current = window.setInterval(() => {
      checkBreakRequirement();
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabHiddenRef.current = true;
        tabSwitchCountRef.current += 1;
        distractionStartTimeRef.current = Date.now();
        showRandomTabAlert();
      } else {
        isTabHiddenRef.current = false;
        if (distractionStartTimeRef.current !== null) {
          distractionSecondsRef.current += (Date.now() - distractionStartTimeRef.current) / 1000;
          distractionStartTimeRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const finalDistraction = distractionStartTimeRef.current !== null
        ? distractionSecondsRef.current + (Date.now() - distractionStartTimeRef.current) / 1000
        : distractionSecondsRef.current;

      const payload = JSON.stringify({
        wallClockSeconds: wallClockRef.current,
        verifiedFocusSeconds: isTutorial
          ? Math.max(0, wallClockRef.current - presenceFailSecondsRef.current)
          : verifiedFocusRef.current,
        distractionSeconds: Math.round(finalDistraction),
        presenceFailSeconds: presenceFailSecondsRef.current,
        tabSwitchCount: tabSwitchCountRef.current,
        presenceCheckCount: presenceCheckCountRef.current,
        presenceFailCount: presenceFailCountRef.current,
        status: 'abandoned',
      });

      navigator.sendBeacon(`/api/sessions/${sessionId}`, new Blob([payload], { type: 'application/json' }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const handlePopState = () => {
      setPendingNavigation('/');
      setShowNavGuard(true);
      history.pushState(null, '', '/focus');
    };

    history.pushState(null, '', '/focus');
    window.addEventListener('popstate', handlePopState);

    const scheduleNextPresenceCheck = () => {
      if (presenceCheckTimeoutRef.current) clearTimeout(presenceCheckTimeoutRef.current);
      nextCheckCountdownRef.current = presenceIntervalMs / 1000;
      presenceCheckTimeoutRef.current = window.setTimeout(() => {
        isPresenceModalOpenRef.current = true;
        setIsPresenceModalOpen(true);
        presenceCheckCountRef.current += 1;
      }, presenceIntervalMs);
    };

    scheduleNextPresenceCheck();

    return () => {
      if (wallClockIntervalRef.current) clearInterval(wallClockIntervalRef.current);
      if (presenceCheckTimeoutRef.current) clearTimeout(presenceCheckTimeoutRef.current);
      if (breakCheckIntervalRef.current) clearInterval(breakCheckIntervalRef.current);
      if (tabAlertTimeoutRef.current) clearTimeout(tabAlertTimeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [sessionId, navigate, isTutorial, presenceIntervalMs, checkBreakRequirement, showRandomTabAlert]);

  const handlePresenceConfirm = useCallback(() => {
    isPresenceModalOpenRef.current = false;
    setIsPresenceModalOpen(false);
    if (presenceCheckTimeoutRef.current) clearTimeout(presenceCheckTimeoutRef.current);
    nextCheckCountdownRef.current = presenceIntervalMs / 1000;
    presenceCheckTimeoutRef.current = window.setTimeout(() => {
      isPresenceModalOpenRef.current = true;
      setIsPresenceModalOpen(true);
      presenceCheckCountRef.current += 1;
    }, presenceIntervalMs);
  }, [presenceIntervalMs]);

  const handlePresenceFail = useCallback(() => {
    presenceFailCountRef.current += 1;
    presenceFailSecondsRef.current += 30;
    isPresenceModalOpenRef.current = false;
    setIsPresenceModalOpen(false);
    if (presenceCheckTimeoutRef.current) clearTimeout(presenceCheckTimeoutRef.current);
    nextCheckCountdownRef.current = presenceIntervalMs / 1000;
    presenceCheckTimeoutRef.current = window.setTimeout(() => {
      isPresenceModalOpenRef.current = true;
      setIsPresenceModalOpen(true);
      presenceCheckCountRef.current += 1;
    }, presenceIntervalMs);
  }, [presenceIntervalMs]);

  useEffect(() => {
    if (isPresenceModalOpen) {
      const failTimeout = setTimeout(() => handlePresenceFail(), 30000);
      return () => clearTimeout(failTimeout);
    }
  }, [isPresenceModalOpen, handlePresenceFail]);

  const endSession = async () => {
    if (isEnding) return;
    setIsEnding(true);

    if (wallClockIntervalRef.current) clearInterval(wallClockIntervalRef.current);
    if (presenceCheckTimeoutRef.current) clearTimeout(presenceCheckTimeoutRef.current);
    if (breakCheckIntervalRef.current) clearInterval(breakCheckIntervalRef.current);

    const finalDistraction = distractionStartTimeRef.current !== null
      ? distractionSecondsRef.current + (Date.now() - distractionStartTimeRef.current) / 1000
      : distractionSecondsRef.current;

    const finalVerified = isTutorial
      ? Math.max(0, wallClockRef.current - presenceFailSecondsRef.current)
      : verifiedFocusRef.current;

    addContinuousFocus(wallClockRef.current);

    try {
      const response = await api.patch(`/sessions/${sessionId}`, {
        wallClockSeconds: wallClockRef.current,
        verifiedFocusSeconds: finalVerified,
        distractionSeconds: Math.round(finalDistraction),
        presenceFailSeconds: presenceFailSecondsRef.current,
        tabSwitchCount: tabSwitchCountRef.current,
        presenceCheckCount: presenceCheckCountRef.current,
        presenceFailCount: presenceFailCountRef.current,
        status: 'completed',
      });

      setCompletedSession(response.data.session);
      resetSession();
      navigate('/post-session');
    } catch (error) {
      console.error('Failed to end session');
      resetSession();
      navigate('/');
    }
  };

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  };

  // Update state for display every second
  useEffect(() => {
    const displayInterval = setInterval(() => {
      setDisplayWall(wallClockRef.current);
      setDisplayVerified(Math.max(0, verifiedFocusRef.current));
      setDisplayTabSwitches(tabSwitchCountRef.current);
      setDisplayDistraction(Math.round(distractionSecondsRef.current));
      setTimeUntilNextCheck(nextCheckCountdownRef.current);
    }, 1000);
    return () => clearInterval(displayInterval);
  }, []);

  const efficiency = displayWall > 0
    ? Math.min(100, Math.round((displayVerified / displayWall) * 100))
    : 100;

  const circumference = 2 * Math.PI * 140;
  const progress = efficiency / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const handleStayOnFocus = () => {
    setShowNavGuard(false);
    setPendingNavigation(null);
    history.pushState(null, '', '/focus');
  };

  const handleLeaveFocus = async () => {
    setShowNavGuard(false);
    await endSession();
  };

  const handleDismissTabAlert = () => {
    setShowTabAlert(false);
    if (tabAlertTimeoutRef.current) clearTimeout(tabAlertTimeoutRef.current);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20 pb-8 px-4">
      {isPresenceModalOpen && <PresenceModal onConfirm={handlePresenceConfirm} />}

      {showTabAlert && (
        <div className="fixed bottom-20 right-8 z-50 animate-pulse">
          <div className="bg-yellow-500 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-sm border-2 border-yellow-300">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{tabAlertMessage.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-black text-lg">{tabAlertMessage.title}</h3>
                <p className="text-black/80 text-sm mt-1">{tabAlertMessage.message}</p>
              </div>
              <button onClick={handleDismissTabAlert} className="text-black/70 hover:text-black text-2xl leading-none">
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {showNavGuard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-[var(--border)]">
            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4 text-center">
              Stay Focused?
            </h2>
            <p className="text-[var(--text-muted)] text-center mb-6">
              You're in the middle of a focus session. Leaving now will end your session.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleStayOnFocus}
                className="w-full py-3 px-6 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-bold"
              >
                Return to Session
              </button>
              <button
                onClick={handleLeaveFocus}
                className="w-full py-3 px-6 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] font-semibold border border-[var(--border)]"
              >
                End Session & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          <div className="flex flex-col items-center">
            <AvatarSVG gender={user?.avatarGender || 'neutral'} />
            <div className="mt-4">
              <TreeSVG efficiency={efficiency} isVisible={true} />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative">
              <svg className="w-72 h-72 md:w-80 md:h-80 transform -rotate-90">
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="none"
                  stroke="var(--bg-card)"
                  strokeWidth="12"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="none"
                  stroke={efficiency >= 70 ? 'var(--accent)' : efficiency >= 40 ? 'var(--warn)' : 'var(--danger)'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-1">
                  Verified Focus
                </p>
                <p className={`font-mono text-5xl md:text-6xl font-bold ${
                  isPaused ? 'text-[var(--danger)]' : 'text-[var(--accent)]'
                }`}>
                  {isPaused ? 'PAUSED' : formatTime(displayVerified)}
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  {Math.round(efficiency)}% efficiency
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-8">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Total</p>
                <p className="font-mono text-2xl text-[var(--text-primary)]">
                  {formatTime(displayWall)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Goal</p>
                <p className="font-mono text-2xl text-[var(--accent)]">
                  {focusDurationMinutes || 30}m
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Next Check</p>
                <p className="font-mono text-2xl text-[var(--text-primary)]">
                  {Math.floor(timeUntilNextCheck / 60)}:{(timeUntilNextCheck % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-start">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 w-64">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📚</span>
                <span className="font-semibold text-[var(--text-primary)]">{subject}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] text-sm">Interruptions</span>
                  <span className={displayTabSwitches > 5 ? 'text-[var(--danger)] font-mono' : 'text-[var(--text-primary)] font-mono'}>
                    {displayTabSwitches}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] text-sm">Focus Time</span>
                  <span className="text-[var(--accent)] font-mono">
                    {formatTime(displayVerified)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] text-sm">Lost Time</span>
                  <span className="text-[var(--danger)] font-mono">
                    {formatTime(displayDistraction)}
                  </span>
                </div>
              </div>

              {isTutorial && tutorialPlatform && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-sm text-[var(--text-muted)]">
                    📖 {tutorialPlatform}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={endSession}
                disabled={isEnding}
                className="py-4 px-8 rounded-xl bg-[var(--danger)] text-white font-bold hover:shadow-lg hover:shadow-[var(--danger)]/20 transition-all disabled:opacity-50"
              >
                {isEnding ? 'Saving...' : 'END SESSION'}
              </button>
              <button
                onClick={togglePause}
                className="py-4 px-6 rounded-xl border-2 border-[var(--border)] text-[var(--text-muted)] font-bold hover:bg-[var(--bg-card)] transition-all"
              >
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
