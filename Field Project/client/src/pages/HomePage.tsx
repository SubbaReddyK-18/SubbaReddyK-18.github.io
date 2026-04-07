import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import api from '../lib/api';
import SubjectCard from '../components/SubjectCard';
import { getSubjectEmoji, formatDate } from '../lib/utils';
import { UrlVerificationResult } from '../types';

const FOCUS_OPTIONS = [
  { minutes: 15, label: '15 min', emoji: '⚡' },
  { minutes: 30, label: '30 min', emoji: '🎯' },
  { minutes: 40, label: '40 min', emoji: '🔥' },
];

export default function HomePage() {
  const { user, updateUser } = useAuthStore();
  const { startSession, isBreakRequired, breakEndTime, continuousFocusSeconds } = useSessionStore();
  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [isTutorial, setIsTutorial] = useState(false);
  const [tutorialUrl, setTutorialUrl] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<UrlVerificationResult | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [loading, setLoading] = useState(false);

  const subjects = user?.subjects || [];

  useEffect(() => {
    const storedBreakEnd = localStorage.getItem('mindora_break_end');
    if (storedBreakEnd && parseInt(storedBreakEnd, 10) > Date.now()) {
      navigate('/break');
    }
  }, [navigate]);

  const verifyUrl = async () => {
    if (!tutorialUrl) return;
    setVerifying(true);
    setVerificationResult(null);
    try {
      const response = await api.post('/verify-url', { url: tutorialUrl });
      setVerificationResult(response.data);
    } catch (error) {
      setVerificationResult({ verified: false, reason: 'Failed to verify URL' });
    } finally {
      setVerifying(false);
    }
  };

  const addSubject = async () => {
    if (!customSubject.trim()) return;
    const newSubjects = [...subjects, customSubject.trim()];
    try {
      await api.patch('/user/profile', { subjects: newSubjects });
      updateUser({ subjects: newSubjects });
      setCustomSubject('');
      setShowAddSubject(false);
    } catch (error) {
      console.error('Failed to add subject');
    }
  };

  const beginSession = async () => {
    if (!selectedSubject) return;
    if (isTutorial && !verificationResult?.verified) return;

    setLoading(true);
    try {
      const response = await api.post('/sessions', {
        subject: selectedSubject,
        isTutorial,
        tutorialUrl: isTutorial ? tutorialUrl : undefined,
        tutorialPlatform: isTutorial ? verificationResult?.platform : undefined,
      });

      startSession({
        sessionId: response.data.sessionId,
        subject: selectedSubject,
        isTutorial,
        tutorialUrl: tutorialUrl,
        tutorialPlatform: verificationResult?.platform || '',
        focusDurationMinutes: selectedDuration,
      });

      navigate('/focus');
    } catch (error) {
      console.error('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const canBegin = selectedSubject && (!isTutorial || verificationResult?.verified) && !isBreakRequired;

  const isNearBreakLimit = continuousFocusSeconds >= 35 * 60;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl text-[var(--text-primary)] mb-2">
          Ready to focus?
        </h1>
        <p className="text-[var(--text-muted)] mb-8">{formatDate(new Date())}</p>

        {isBreakRequired && (
          <div className="mb-6 p-4 bg-[var(--warn)]/10 border border-[var(--warn)]/30 rounded-2xl">
            <p className="text-[var(--warn)] font-medium text-center">
              Take a 5-minute break to recharge your mind!
            </p>
            <button
              onClick={() => navigate('/break')}
              className="mt-3 w-full py-3 rounded-xl bg-[var(--warn)] text-[var(--bg-primary)] font-semibold"
            >
              Start Break Now
            </button>
          </div>
        )}

        {isNearBreakLimit && !isBreakRequired && (
          <div className="mb-6 p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-xl">
            <p className="text-[var(--accent)] text-sm text-center">
              {Math.round((40 * 60 - continuousFocusSeconds) / 60)} minutes until your next mandatory break 🌿
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-[var(--text-muted)] text-sm uppercase tracking-wider mb-3">
            How long do you want to focus?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {FOCUS_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                onClick={() => setSelectedDuration(option.minutes)}
                className={`py-4 px-4 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${
                  selectedDuration === option.minutes
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent)]/20'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)] border border-[var(--border)]'
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="font-bold">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[var(--text-muted)] text-sm uppercase tracking-wider mb-3">
            What are you studying today?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject}
                subject={subject}
                selected={selectedSubject === subject}
                onClick={() => setSelectedSubject(subject)}
              />
            ))}
            {showAddSubject ? (
              <div className="flex gap-2 col-span-2 sm:col-span-3">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter subject name..."
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                />
                <button
                  onClick={addSubject}
                  className="px-4 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddSubject(false)}
                  className="px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddSubject(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                + Add Subject
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[var(--text-muted)] text-sm uppercase tracking-wider mb-3">
            Session Type
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setIsTutorial(false);
                setTutorialUrl('');
                setVerificationResult(null);
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
                !isTutorial
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent)]/20'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              Open Study
            </button>
            <button
              onClick={() => setIsTutorial(true)}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
                isTutorial
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent)]/20'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              Tutorial Mode
            </button>
          </div>
        </div>

        {isTutorial && (
          <div className="mb-6 bg-[var(--bg-card)] rounded-2xl p-6">
            <label className="block text-[var(--text-primary)] font-medium mb-3">
              Paste your tutorial/resource URL
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={tutorialUrl}
                onChange={(e) => {
                  setTutorialUrl(e.target.value);
                  setVerificationResult(null);
                }}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                onClick={verifyUrl}
                disabled={!tutorialUrl || verifying}
                className="px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'VERIFY URL'}
              </button>
            </div>

            {verifying && (
              <p className="mt-3 text-[var(--text-muted)] text-sm">
                Verifying with AI...
              </p>
            )}

            {verificationResult && (
              <div
                className={`mt-3 p-3 rounded-xl ${
                  verificationResult.verified
                    ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/30'
                    : 'bg-[var(--danger)]/10 border border-[var(--danger)]/30'
                }`}
              >
                <p className={verificationResult.verified ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}>
                  {verificationResult.verified ? 'Verified!' : 'Not Verified'} {verificationResult.reason}
                </p>
                {verificationResult.verified && verificationResult.platform && (
                  <p className="text-[var(--text-muted)] text-sm mt-1">
                    {verificationResult.platform}
                    {verificationResult.category && ` - ${verificationResult.category}`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={beginSession}
          disabled={!canBegin || loading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            canBegin
              ? 'bg-[var(--accent)] text-[var(--bg-primary)] hover:shadow-lg hover:shadow-[var(--accent)]/20 hover:-translate-y-0.5'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] cursor-not-allowed'
          }`}
        >
          {loading ? 'Starting...' : `BEGIN ${selectedDuration} MIN FOCUS`}
        </button>

        {user && (
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-[var(--bg-card)] rounded-xl p-4">
              <p className="text-2xl font-bold text-[var(--accent)]">{user.streak}</p>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Day Streak</p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-xl p-4">
              <p className="text-2xl font-bold text-[var(--accent)]">{user.totalSessions}</p>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Sessions</p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-xl p-4">
              <p className="text-2xl font-bold text-[var(--accent)]">
                {Math.round(user.totalFocusMinutes / 60)}h
              </p>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Focus Time</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
