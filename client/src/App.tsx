import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import FocusModePage from './pages/FocusModePage';
import BreakPage from './pages/BreakPage';
import PostSessionPage from './pages/PostSessionPage';
import FocusRoomPage from './pages/FocusRoomPage';
import MyForestPage from './pages/MyForestPage';
import CommunityPage from './pages/CommunityPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { fetchMe, isAuthenticated, isLoading, user } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !user.onboardingComplete) {
      navigate('/onboarding');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {!showSplash && (
        <>
          {isAuthenticated && <Navbar />}

          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  user?.onboardingComplete ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Navigate to="/onboarding" replace />
                  )
                ) : (
                  <LoginPage />
                )
              }
            />

            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  {user?.onboardingComplete ? (
                    <Navigate to="/" replace />
                  ) : (
                    <OnboardingPage />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/focus"
              element={
                <ProtectedRoute>
                  <FocusModePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/break"
              element={
                <ProtectedRoute>
                  <BreakPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/post-session"
              element={
                <ProtectedRoute>
                  <PostSessionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/focus-room"
              element={
                <ProtectedRoute>
                  <FocusRoomPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-forest"
              element={
                <ProtectedRoute>
                  <MyForestPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <CommunityPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
