import { useState, useEffect } from 'react';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { formatMinutes } from '../lib/utils';

interface SessionSummary {
  totalSessions: number;
  totalFocusMinutes: number;
  avgEfficiency: number;
  bestSubject: string | null;
  chartData: { date: string; focusMinutes: number; efficiency: number }[];
}

interface Session {
  _id: string;
  subject: string;
  startTime: string;
  wallClockSeconds: number;
  verifiedFocusSeconds: number;
  distractionSeconds: number;
  presenceFailSeconds: number;
  tabSwitchCount: number;
  presenceFailCount: number;
  efficiencyScore: number;
  verdict: string;
}

type RangeOption = 'day' | 'week' | 'month';

const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export default function FocusRoomPage() {
  const [range, setRange] = useState<RangeOption>('week');
  const [showRangePopup, setShowRangePopup] = useState(true);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'subjects'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, sessionsRes] = await Promise.all([
          api.get(`/sessions/summary?range=${range}`),
          api.get(`/sessions?range=${range}`),
        ]);
        setSummary(summaryRes.data);
        setSessions(sessionsRes.data.sessions);
      } catch (error) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 75) return '#00e5a0';
    if (efficiency >= 50) return '#f59e0b';
    return '#ff4d6d';
  };

  const getVerdictBadge = (verdict: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      champion: { bg: 'bg-[#00e5a0]/20', text: 'text-[#00e5a0]' },
      good: { bg: 'bg-[#00e5a0]/20', text: 'text-[#00e5a0]' },
      okay: { bg: 'bg-[#f59e0b]/20', text: 'text-[#f59e0b]' },
      distracted: { bg: 'bg-orange-500/20', text: 'text-orange-500' },
      'not-focused': { bg: 'bg-[#ff4d6d]/20', text: 'text-[#ff4d6d]' },
    };
    return colors[verdict] || { bg: 'bg-[var(--bg-surface)]', text: 'text-[var(--text-muted)]' };
  };

  const getSubjectData = () => {
    const subjectMap: Record<string, { minutes: number; sessions: number; efficiency: number }> = {};
    sessions.forEach(s => {
      if (!subjectMap[s.subject]) {
        subjectMap[s.subject] = { minutes: 0, sessions: 0, efficiency: 0 };
      }
      subjectMap[s.subject].minutes += Math.round(s.verifiedFocusSeconds / 60);
      subjectMap[s.subject].sessions += 1;
      subjectMap[s.subject].efficiency += s.efficiencyScore;
    });
    
    return Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      minutes: data.minutes,
      sessions: data.sessions,
      avgEfficiency: Math.round(data.efficiency / data.sessions),
    })).sort((a, b) => b.minutes - a.minutes);
  };

  const totalTabSwitches = sessions.reduce((sum, s) => sum + (s.tabSwitchCount || 0), 0);
  const totalDistractionMinutes = Math.round(sessions.reduce((sum, s) => sum + (s.distractionSeconds || 0), 0) / 60);
  const totalPresenceFails = sessions.reduce((sum, s) => sum + (s.presenceFailCount || 0), 0);

  const subjectData = getSubjectData();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl text-[var(--text-primary)]">Focus Room</h1>
          
          <div className="relative">
            <button
              onClick={() => setShowRangePopup(!showRangePopup)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
            >
              <span>{RANGE_OPTIONS.find(r => r.value === range)?.label}</span>
              <svg className={`w-4 h-4 transition-transform ${showRangePopup ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showRangePopup && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] shadow-xl z-50 overflow-hidden">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setRange(option.value);
                      setShowRangePopup(false);
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      range === option.value
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {(['overview', 'sessions', 'subjects'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && summary && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[var(--bg-card)] rounded-2xl p-6 text-center">
                    <p className="text-3xl font-bold text-[var(--accent)]">{summary.totalSessions}</p>
                    <p className="text-sm text-[var(--text-muted)]">Total Sessions</p>
                  </div>
                  <div className="bg-[var(--bg-card)] rounded-2xl p-6 text-center">
                    <p className="text-3xl font-bold text-[var(--accent)]">
                      {formatMinutes(summary.totalFocusMinutes)}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">Focus Time</p>
                  </div>
                  <div className="bg-[var(--bg-card)] rounded-2xl p-6 text-center">
                    <p className="text-3xl font-bold text-[var(--accent)]">{summary.avgEfficiency}%</p>
                    <p className="text-sm text-[var(--text-muted)]">Avg Efficiency</p>
                  </div>
                  <div className="bg-[var(--bg-card)] rounded-2xl p-6 text-center">
                    <p className="text-3xl font-bold text-[var(--accent)]">
                      {summary.bestSubject || 'N/A'}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">Best Subject</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-[var(--bg-card)] rounded-2xl p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Focus Trend</h3>
                    <div className="h-64">
                      {summary.chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={summary.chartData}>
                            <XAxis
                              dataKey="date"
                              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                              axisLine={{ stroke: 'var(--border)' }}
                              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis
                              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                              axisLine={{ stroke: 'var(--border)' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                              }}
                              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            />
                            <Line
                              type="monotone"
                              dataKey="focusMinutes"
                              stroke="var(--accent)"
                              strokeWidth={3}
                              dot={{ fill: 'var(--accent)', strokeWidth: 2 }}
                              activeDot={{ r: 6, fill: 'var(--accent)' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                          No data for this period
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[var(--bg-card)] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Distraction Summary</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-muted)]">Tab Switches</span>
                          <span className="font-mono text-[var(--danger)]">{totalTabSwitches}</span>
                        </div>
                        <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--danger)] rounded-full"
                            style={{ width: `${Math.min(100, (totalTabSwitches / Math.max(1, sessions.length * 5)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-muted)]">Distraction Time</span>
                          <span className="font-mono text-[var(--warn)]">{totalDistractionMinutes}m</span>
                        </div>
                        <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--warn)] rounded-full"
                            style={{ width: `${Math.min(100, (totalDistractionMinutes / Math.max(1, summary.totalFocusMinutes)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-muted)]">Presence Fails</span>
                          <span className="font-mono text-[var(--warn)]">{totalPresenceFails}</span>
                        </div>
                        <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--warn)] rounded-full"
                            style={{ width: `${Math.min(100, (totalPresenceFails / Math.max(1, sessions.length)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden">
                {sessions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Date</th>
                          <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Subject</th>
                          <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Duration</th>
                          <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Focus Time</th>
                          <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Interruptions</th>
                          <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Efficiency</th>
                          <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Verdict</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session) => (
                          <tr key={session._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)]">
                            <td className="p-4 text-sm text-[var(--text-primary)]">
                              {new Date(session.startTime).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-sm text-[var(--text-primary)]">{session.subject}</td>
                            <td className="p-4 text-sm text-[var(--text-muted)] font-mono">
                              {Math.round(session.wallClockSeconds / 60)}m
                            </td>
                            <td className="p-4 text-sm text-[var(--accent)] font-mono">
                              {Math.round(session.verifiedFocusSeconds / 60)}m
                            </td>
                            <td className="p-4 text-sm font-mono">
                              {session.tabSwitchCount || 0}
                            </td>
                            <td className="p-4">
                              <span
                                className="font-mono text-sm"
                                style={{ color: getEfficiencyColor(session.efficiencyScore) }}
                              >
                                {Math.round(session.efficiencyScore)}%
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs capitalize ${getVerdictBadge(session.verdict).bg} ${getVerdictBadge(session.verdict).text}`}>
                                {session.verdict}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-4">📊</p>
                    <p className="text-[var(--text-muted)]">No sessions recorded for this period</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subjects' && (
              <div className="bg-[var(--bg-card)] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Focus by Subject</h3>
                {subjectData.length > 0 ? (
                  <div className="space-y-4">
                    {subjectData.map((item, index) => (
                      <div key={item.subject} className="flex items-center gap-4">
                        <span className="w-6 text-center text-[var(--text-muted)] font-mono">{index + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-[var(--text-primary)]">{item.subject}</span>
                            <span className="text-sm text-[var(--text-muted)]">{item.minutes}m</span>
                          </div>
                          <div className="h-3 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(item.minutes / subjectData[0].minutes) * 100}%`,
                                backgroundColor: getEfficiencyColor(item.avgEfficiency),
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-[var(--text-muted)]">{item.sessions} sessions</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[var(--text-muted)]">No subject data available</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
