import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import AvatarSVG from '../components/AvatarSVG';

const PREDEFINED_SUBJECTS = [
  'DSA', 'Web Dev', 'DBMS', 'Operating Systems', 'Computer Networks',
  'Machine Learning', 'Python', 'Java', 'C/C++', 'Mathematics',
  'Physics', 'Chemistry', 'Biology', 'History', 'Economics', 'English'
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [avatarGender, setAvatarGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [presenceInterval, setPresenceInterval] = useState(10);
  const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);

  const { fetchMe } = useAuthStore();
  const navigate = useNavigate();

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const addCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects((prev) => [...prev, customSubject.trim()]);
      setCustomSubject('');
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await api.patch('/user/profile', {
        avatarGender,
        subjects: selectedSubjects,
        presenceIntervalMinutes: presenceInterval,
        sensitivityLevel: sensitivity,
        onboardingComplete: true,
      });
      await fetchMe();
      navigate('/');
    } catch (error) {
      console.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                s === step
                  ? 'bg-[var(--accent)] scale-110'
                  : s < step
                  ? 'bg-[var(--accent)]'
                  : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="text-center">
            <h2 className="font-serif text-3xl text-[var(--text-primary)] mb-8">Pick your avatar</h2>
            <div className="flex justify-center gap-8 mb-8">
              {(['male', 'female', 'neutral'] as const).map((gender) => (
                <button
                  key={gender}
                  onClick={() => setAvatarGender(gender)}
                  className={`p-4 rounded-2xl transition-all duration-300 ${
                    avatarGender === gender
                      ? 'bg-[var(--accent-dim)] border-2 border-[var(--accent)] shadow-lg shadow-[var(--accent)]/10'
                      : 'bg-[var(--bg-card)] border-2 border-transparent hover:border-[var(--border)]'
                  }`}
                >
                  <AvatarSVG gender={gender} />
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="px-8 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-serif text-3xl text-[var(--text-primary)] text-center mb-2">
              What do you study?
            </h2>
            <p className="text-[var(--text-muted)] text-center mb-6">
              Select at least one subject
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {PREDEFINED_SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`px-4 py-2 rounded-xl text-left transition-all duration-300 ${
                    selectedSubjects.includes(subject)
                      ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Add custom subject..."
                className="flex-1 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSubject())}
              />
              <button
                onClick={addCustomSubject}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold"
              >
                + Add
              </button>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedSubjects.length === 0}
                className="px-8 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-serif text-3xl text-[var(--text-primary)] text-center mb-8">
              Set your preferences
            </h2>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 mb-4">
              <label className="block text-[var(--text-primary)] font-medium mb-3">
                How often should we check on you?
              </label>
              <select
                value={presenceInterval}
                onChange={(e) => setPresenceInterval(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value={5}>Every 5 minutes</option>
                <option value={10}>Every 10 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={20}>Every 20 minutes</option>
              </select>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 mb-6">
              <label className="block text-[var(--text-primary)] font-medium mb-3">
                Sensitivity
              </label>
              <div className="space-y-2">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <label
                    key={level}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      sensitivity === level
                        ? 'bg-[var(--accent-dim)] border border-[var(--accent)]'
                        : 'bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sensitivity"
                      value={level}
                      checked={sensitivity === level}
                      onChange={() => setSensitivity(level)}
                      className="w-4 h-4 accent-[var(--accent)]"
                    />
                    <div>
                      <span className="text-[var(--text-primary)] capitalize">{level}</span>
                      <span className="text-[var(--text-muted)] text-sm ml-2">
                        ({level === 'low' ? 'Gentle' : level === 'medium' ? 'Balanced' : 'Strict'})
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Finish Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
