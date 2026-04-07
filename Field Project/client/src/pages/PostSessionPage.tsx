import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { formatTime, formatMinutes, formatShortDate } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '../lib/api';

interface SessionAnalysis {
  summary: string;
  distractionPattern: string;
  focusQuality: string;
  recommendations: string[];
  focusScore: number;
  peakFocusHours: string;
  improvementAreas: string[];
  strengths: string[];
}

export default function PostSessionPage() {
  const navigate = useNavigate();
  const { completedSession, resetSession, subject, sessionId } = useSessionStore();
  const [analysis, setAnalysis] = useState<SessionAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [showFullReport, setShowFullReport] = useState(false);

  useEffect(() => {
    if (!completedSession) {
      navigate('/');
      return;
    }
    fetchAnalysis();
  }, [completedSession]);

  const fetchAnalysis = async () => {
    try {
      const response = await api.post(`/sessions/analyze/${sessionId}`);
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Failed to fetch analysis');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  if (!completedSession) {
    return null;
  }

  const session = completedSession;
  const verifiedFocus = session.verifiedFocusSeconds;
  const distractions = session.distractionSeconds;
  const presenceFails = session.presenceFailSeconds;
  const efficiency = session.efficiencyScore;

  const data = [
    { name: 'Verified Focus', value: Math.max(0, verifiedFocus), color: '#00e5a0' },
    { name: 'Distractions', value: Math.max(0, distractions), color: '#ff4d6d' },
    { name: 'Presence Fails', value: Math.max(0, presenceFails), color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const verdictData: Record<string, { title: string; message: string; color: string; bgColor: string; emoji: string }> = {
    champion: {
      title: 'ABSOLUTE CHAMPION!',
      message: 'You were completely locked in!',
      color: '#00e5a0',
      bgColor: 'rgba(0, 229, 160, 0.15)',
      emoji: '🏆',
    },
    good: {
      title: 'GREAT SESSION!',
      message: 'Almost perfect focus.',
      color: '#00e5a0',
      bgColor: 'rgba(0, 229, 160, 0.15)',
      emoji: '🌟',
    },
    okay: {
      title: 'DECENT SESSION',
      message: 'Room to improve.',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      emoji: '💪',
    },
    distracted: {
      title: 'GOT DISTRACTED',
      message: 'Try harder next time.',
      color: '#ff8c00',
      bgColor: 'rgba(255, 140, 0, 0.15)',
      emoji: '🎯',
    },
    'not-focused': {
      title: 'NOT FOCUSED',
      message: 'Be honest with yourself.',
      color: '#ff4d6d',
      bgColor: 'rgba(255, 77, 109, 0.15)',
      emoji: '💀',
    },
  };

  const verdict = verdictData[session.verdict as keyof typeof verdictData] || verdictData.okay;

  const handleContinueSession = async () => {
    navigate('/focus');
  };

  const handleGoHome = () => {
    resetSession();
    navigate('/');
  };

  const handleStudyAgain = () => {
    resetSession();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-6xl">{verdict.emoji}</span>
          <h1 className="font-serif text-4xl text-[var(--text-primary)] mt-4 mb-2">
            {verdict.title}
          </h1>
          <p className="text-[var(--text-muted)]">{verdict.message}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[var(--bg-card)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Session Overview</h3>
            
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border)]">
              <span className="text-2xl">📚</span>
              <div>
                <span className="font-semibold text-[var(--text-primary)]">{session.subject}</span>
                <p className="text-sm text-[var(--text-muted)]">
                  {formatShortDate(session.startTime)} at {new Date(session.startTime).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Total Time:</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatTime(session.wallClockSeconds)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Verified Focus:</span>
                <span className="font-mono text-[var(--accent)]">
                  {formatTime(verifiedFocus)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Tab Switches:</span>
                <span className={session.tabSwitchCount > 5 ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}>
                  {session.tabSwitchCount} {session.tabSwitchCount === 1 ? 'time' : 'times'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Presence Fails:</span>
                <span className={session.presenceFailCount > 2 ? 'text-[var(--warn)]' : 'text-[var(--text-primary)]'}>
                  {session.presenceFailCount} ({formatMinutes(Math.round(session.presenceFailSeconds / 60))} lost)
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">
                Focus Efficiency
              </p>
              <div className="h-4 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${efficiency}%`,
                    backgroundColor: verdict.color,
                  }}
                />
              </div>
              <p className="text-right mt-1 font-mono text-lg" style={{ color: verdict.color }}>
                {Math.round(efficiency)}%
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Distraction Analysis
            </h3>
            
            <div className="relative w-48 h-48 mx-auto mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: verdict.color }}>
                    {Math.round(efficiency)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 text-sm">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[var(--text-muted)]">{item.name}</span>
                </div>
              ))}
            </div>

            {analysis && (
              <div className="mt-6 pt-4 border-t border-[var(--border)]">
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  AI Analysis
                </p>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  {loadingAnalysis ? 'Analyzing...' : analysis.summary}
                </p>
                {!loadingAnalysis && analysis.focusScore && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">Focus Score:</span>
                    <div className="flex-1 h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ 
                          width: `${analysis.focusScore}%`,
                          backgroundColor: analysis.focusScore >= 70 ? '#00e5a0' : analysis.focusScore >= 40 ? '#f59e0b' : '#ff4d6d'
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono">{analysis.focusScore}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {analysis && (
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 mb-8">
            <button
              onClick={() => setShowFullReport(!showFullReport)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                📊 Detailed Analysis Report
              </h3>
              <span className="text-[var(--text-muted)]">
                {showFullReport ? '▲ Hide' : '▼ View Full Report'}
              </span>
            </button>

            {showFullReport && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--accent)] mb-2">🎯 Distraction Pattern</h4>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {analysis.distractionPattern}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[var(--accent)] mb-2">⏰ Peak Focus Hours</h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      {analysis.peakFocusHours}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--accent)] mb-2">💪 Strengths</h4>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                          <span className="text-[var(--accent)]">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[var(--danger)] mb-2">📈 Areas to Improve</h4>
                    <ul className="space-y-2">
                      {analysis.improvementAreas.map((area, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                          <span className="text-[var(--danger)]">!</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[var(--accent)] mb-2">💡 Recommendations</h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                        <span className="text-[var(--accent)] font-bold">{i + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGoHome}
            className="flex-1 py-4 px-6 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-surface)] transition-all"
          >
            Save & Go Home
          </button>
          <button
            onClick={handleStudyAgain}
            className="flex-1 py-4 px-6 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all"
          >
            Study Again
          </button>
        </div>

        <button
          onClick={handleContinueSession}
          className="w-full mt-4 py-4 px-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent)] text-[var(--accent)] font-semibold hover:bg-[var(--accent)]/10 transition-all"
        >
          Continue Previous Session
        </button>
      </div>
    </div>
  );
}
