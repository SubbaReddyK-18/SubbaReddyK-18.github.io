import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  if (theme !== 'midnight-ink') {
    toggleTheme();
  }

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl text-[var(--accent)] mb-2">MINDORA</h1>
          <p className="text-[var(--text-muted)] text-sm tracking-widest uppercase">
            Digital Distraction Analysis System
          </p>
        </div>

        <div className="bg-[var(--bg-surface)]/50 backdrop-blur-xl rounded-2xl p-8 border border-[var(--border)]">
          <div className="flex mb-6">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 pb-2 text-center font-medium transition-colors ${
                !isRegister
                  ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 pb-2 text-center font-medium transition-colors ${
                isRegister
                  ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              required
            />
            {isRegister && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                required
              />
            )}

            {error && (
              <p className="text-[var(--danger)] text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
