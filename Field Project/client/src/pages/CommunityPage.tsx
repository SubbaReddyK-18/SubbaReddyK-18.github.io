import { useState, useEffect } from 'react';
import api from '../lib/api';
import { LeaderboardEntry } from '../types';

interface HeatmapEntry {
  date: string;
  focusMinutes: number;
}

export default function CommunityPage() {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heatmapRes, leaderboardRes] = await Promise.all([
          api.get('/community/heatmap'),
          api.get('/community/leaderboard'),
        ]);
        setHeatmap(heatmapRes.data.heatmap);
        setLeaderboard(leaderboardRes.data.leaderboard);
        setCurrentUserRank(leaderboardRes.data.currentUserRank);
      } catch (error) {
        console.error('Failed to fetch community data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIntensityColor = (minutes: number) => {
    if (minutes === 0) return 'var(--border)';
    if (minutes <= 30) return 'rgba(0, 229, 160, 0.2)';
    if (minutes <= 60) return 'rgba(0, 229, 160, 0.4)';
    if (minutes <= 120) return 'rgba(0, 229, 160, 0.7)';
    return 'var(--accent)';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const organizeHeatmapByWeeks = () => {
    const weeks: HeatmapEntry[][] = [];
    const today = new Date();
    const startDate = new Date(today.getTime() - 364 * 24 * 60 * 60 * 1000);

    const heatmapMap = new Map(heatmap.map(h => [h.date, h.focusMinutes]));

    let currentWeek: HeatmapEntry[] = [];
    const startDay = startDate.getDay();

    for (let i = 0; i < startDay; i++) {
      currentWeek.push({ date: '', focusMinutes: 0 });
    }

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      currentWeek.push({
        date: dateStr,
        focusMinutes: heatmapMap.get(dateStr) || 0,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-serif text-3xl text-[var(--text-primary)] mb-6">Community</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Activity Heatmap</h2>
              <div className="overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  <div className="flex flex-col gap-1 mr-2 text-xs text-[var(--text-muted)] justify-around pr-2">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>
                  {organizeHeatmapByWeeks().map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className="w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-pointer"
                          style={{ backgroundColor: day.date ? getIntensityColor(day.focusMinutes) : 'transparent' }}
                          title={day.date ? `${day.date}: ${day.focusMinutes}m` : ''}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-[var(--text-muted)]">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--border)' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 229, 160, 0.2)' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 229, 160, 0.4)' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 229, 160, 0.7)' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--accent)' }} />
                <span>More</span>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[var(--border)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Leaderboard</h2>
                <p className="text-sm text-[var(--text-muted)]">Last 30 days</p>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-4 ${
                      entry.isCurrentUser ? 'bg-[var(--accent-dim)] border-l-4 border-[var(--accent)]' : ''
                    }`}
                  >
                    <span className="w-8 text-center text-xl">
                      {getRankEmoji(entry.rank) || `#${entry.rank}`}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">
                          {entry.displayName}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="text-xs text-[var(--accent)]">(you)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                        <span>Score: {entry.score}</span>
                        {entry.streak > 0 && (
                          <span className="text-[var(--warn)]">🔥 {entry.streak} day streak</span>
                        )}
                        <span>Avg: {entry.avgEfficiency}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
