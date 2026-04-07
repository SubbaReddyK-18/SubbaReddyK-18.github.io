import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { sessionId } = useSessionStore();
  const location = useLocation();
  const [showSessionGuard, setShowSessionGuard] = useState(false);
  const [pendingNav, setPendingNav] = useState('');

  const navLinks = [
    { to: '/my-forest', label: 'MY FOREST' },
    { to: '/focus-room', label: 'FOCUS ROOM' },
    { to: '/community', label: 'COMMUNITY' },
  ];

  const handleNavClick = (e: React.MouseEvent, to: string) => {
    if (sessionId && location.pathname === '/focus' && to !== '/focus') {
      e.preventDefault();
      setPendingNav(to);
      setShowSessionGuard(true);
    }
  };

  const handleStay = () => {
    setShowSessionGuard(false);
    setPendingNav('');
  };

  const handleLeave = () => {
    setShowSessionGuard(false);
    setPendingNav('');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (sessionId && location.pathname === '/focus') {
      e.preventDefault();
      setPendingNav('/');
      setShowSessionGuard(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--bg-surface)]/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="font-serif text-2xl text-[var(--accent)] hover:opacity-80 transition-opacity"
          >
            MINDORA
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(e, link.to)}
                className={`text-xs tracking-widest uppercase transition-colors duration-300 ${
                  location.pathname === link.to
                    ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] pb-1'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span className="text-sm">{user.name}</span>
                </div>
                <Link
                  to="/settings"
                  className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors text-[var(--text-muted)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {showSessionGuard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-[var(--border)]">
            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4 text-center">
              Stay Focused?
            </h2>
            <p className="text-[var(--text-muted)] text-center mb-6">
              You're in the middle of a focus session. Leaving now will end your session.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/focus"
                onClick={handleStay}
                className="w-full py-3 px-6 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-bold text-center"
              >
                Return to Session
              </Link>
              <Link
                to={pendingNav || '/'}
                onClick={handleLeave}
                className="w-full py-3 px-6 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] font-semibold text-center border border-[var(--border)]"
              >
                End Session & Leave
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
