import { useState, useEffect } from 'react';

interface PresenceModalProps {
  onConfirm: () => void;
  duration?: number;
}

export default function PresenceModal({ onConfirm, duration = 30 }: PresenceModalProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - timeLeft / duration);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative bg-[var(--bg-card)] rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-[var(--border)] transition-all duration-300 ${
          timeLeft === 0 ? 'border-[var(--danger)] animate-pulse' : ''
        }`}
      >
        <h2 className="text-2xl font-serif text-center mb-2 text-[var(--text-primary)]">
          {timeLeft === 0 ? 'Presence check failed!' : 'Still there? 👀'}
        </h2>
        <p className="text-center text-[var(--text-muted)] mb-6">
          {timeLeft === 0 ? 'You missed the check!' : 'Tap to confirm you\'re still studying!'}
        </p>

        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="var(--border)"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke={timeLeft === 0 ? 'var(--danger)' : 'var(--accent)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-mono text-[var(--text-primary)]">
              {timeLeft}
            </span>
          </div>
        </div>

        <button
          onClick={onConfirm}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            timeLeft === 0
              ? 'bg-[var(--danger)]/20 text-[var(--danger)] cursor-not-allowed'
              : 'bg-[var(--accent)] text-[var(--bg-primary)] hover:shadow-lg hover:shadow-[var(--accent)]/20 hover:-translate-y-0.5'
          }`}
          disabled={timeLeft === 0}
        >
          {timeLeft === 0 ? 'Too late!' : "YES, I'M HERE ✓"}
        </button>
      </div>
    </div>
  );
}
