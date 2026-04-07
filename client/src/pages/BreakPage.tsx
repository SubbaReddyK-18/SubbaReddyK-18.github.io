import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';

const BREAK_DURATION_MS = 5 * 60 * 1000;

const WELLNESS_TIPS = [
  'Look at something 20 feet away for 20 seconds',
  'Stand up and stretch your body',
  'Take a few deep breaths',
  'Drink some water to stay hydrated',
  'Roll your shoulders and neck gently',
  'Blink rapidly for a few seconds',
  'Walk around for a minute',
  'Close your eyes and relax',
];

export default function BreakPage() {
  const navigate = useNavigate();
  const { completeBreak, continuousFocusSeconds } = useSessionStore();
  const [breakStarted, setBreakStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(BREAK_DURATION_MS);
  const [currentTip] = useState(() => WELLNESS_TIPS[Math.floor(Math.random() * WELLNESS_TIPS.length)]);

  useEffect(() => {
    const storedBreakEnd = localStorage.getItem('mindora_break_end');
    if (!storedBreakEnd) {
      navigate('/');
      return;
    }
    
    const breakEndTime = parseInt(storedBreakEnd, 10);
    if (breakEndTime <= Date.now()) {
      localStorage.removeItem('mindora_break_end');
      completeBreak();
      navigate('/');
      return;
    }

    setTimeLeft(breakEndTime - Date.now());
  }, [navigate, completeBreak]);

  useEffect(() => {
    if (!breakStarted) return;

    const interval = setInterval(() => {
      const storedBreakEnd = localStorage.getItem('mindora_break_end');
      if (!storedBreakEnd) {
        completeBreak();
        navigate('/');
        return;
      }

      const remaining = parseInt(storedBreakEnd, 10) - Date.now();
      
      if (remaining <= 0) {
        clearInterval(interval);
        localStorage.removeItem('mindora_break_end');
        completeBreak();
        navigate('/');
        return;
      }

      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [breakStarted, completeBreak, navigate]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / BREAK_DURATION_MS);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {!breakStarted ? (
          <>
            <div className="text-6xl mb-6">🌿</div>
            <h1 className="font-serif text-4xl text-[var(--text-primary)] mb-4">
              Time for a Break!
            </h1>
            <p className="text-[var(--text-muted)] text-lg mb-2">
              Great job! You've been focusing for{' '}
              <span className="text-[var(--accent)] font-bold">
                {Math.round(continuousFocusSeconds / 60)} minutes
              </span>
            </p>
            <p className="text-[var(--text-muted)] mb-8">
              Your brain needs rest to stay sharp. Take 5 minutes to recharge!
            </p>
            
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 mb-8">
              <p className="text-[var(--accent)] text-sm uppercase tracking-wider mb-2">
                Wellness Tip
              </p>
              <p className="text-[var(--text-primary)] text-lg">
                {currentTip}
              </p>
            </div>

            <button
              onClick={() => setBreakStarted(true)}
              className="w-full py-4 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-bold text-lg hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all"
            >
              Start 5-Minute Break
            </button>

            <p className="mt-4 text-[var(--text-muted)] text-sm">
              You must complete this break before starting a new focus session
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6 animate-bounce">🌱</div>
            <h1 className="font-serif text-3xl text-[var(--text-primary)] mb-6">
              Relax & Recharge
            </h1>

            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="90"
                  fill="none"
                  stroke="var(--bg-card)"
                  strokeWidth="8"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="90"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-mono font-bold text-[var(--text-primary)]">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-[var(--text-muted)]">remaining</span>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl p-6 mb-8">
              <p className="text-[var(--text-muted)]">
                {currentTip}
              </p>
            </div>

            <div className="text-[var(--text-muted)] text-sm">
              <p>Stand up, stretch, and give your eyes a rest!</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
