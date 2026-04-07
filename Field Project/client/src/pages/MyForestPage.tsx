import { useState, useEffect } from 'react';
import api from '../lib/api';
import TreeSVG from '../components/TreeSVG';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatMinutes } from '../lib/utils';

interface ForestDay {
  date: string;
  treeStage: number;
  focusMinutes: number;
  efficiency: number;
  subject: string | null;
}

interface ForestData {
  view: string;
  days?: ForestDay[];
  data?: { month: string; totalFocusMinutes: number }[];
}

export default function MyForestPage() {
  const [view, setView] = useState<'week' | 'month' | 'year'>('week');
  const [data, setData] = useState<ForestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/forest?view=${view}`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch forest data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [view]);

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getIntensityColor = (minutes: number) => {
    if (minutes === 0) return 'var(--border)';
    if (minutes <= 30) return 'rgba(0, 229, 160, 0.2)';
    if (minutes <= 60) return 'rgba(0, 229, 160, 0.4)';
    if (minutes <= 120) return 'rgba(0, 229, 160, 0.7)';
    return 'var(--accent)';
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-serif text-3xl text-[var(--text-primary)] mb-6">My Forest</h1>

        <div className="flex gap-2 mb-8">
          {(['week', 'month', 'year'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                view === v
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {v === 'week' ? 'This Week' : v === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            {view === 'week' && data.days && (
              <div className="grid grid-cols-7 gap-4">
                {data.days.map((day) => (
                  <div
                    key={day.date}
                    className="bg-[var(--bg-card)] rounded-2xl p-4 text-center"
                  >
                    <p className="text-sm text-[var(--text-muted)] mb-2">{getDayName(day.date)}</p>
                    <div className="flex justify-center mb-2" style={{ minHeight: '140px' }}>
                      {day.treeStage > 0 ? (
                        <TreeSVG efficiency={day.efficiency} isVisible={true} />
                      ) : (
                        <div className="w-20 h-24 flex items-center justify-center text-4xl opacity-30">
                          🪴
                        </div>
                      )}
                    </div>
                    <p className="font-mono text-sm text-[var(--accent)]">
                      {day.focusMinutes > 0 ? formatMinutes(day.focusMinutes) : '-'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {view === 'month' && data.days && (
              <div className="bg-[var(--bg-card)] rounded-2xl p-6">
                <div className="grid grid-cols-7 gap-1">
                  {data.days.map((day) => (
                    <div
                      key={day.date}
                      className="aspect-square rounded-md transition-all hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: getIntensityColor(day.focusMinutes) }}
                      title={`${day.date}: ${formatMinutes(day.focusMinutes)}`}
                    />
                  ))}
                </div>
                <div className="flex justify-end items-center gap-2 mt-4 text-xs text-[var(--text-muted)]">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--border)' }} />
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 229, 160, 0.2)' }} />
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 229, 160, 0.4)' }} />
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 229, 160, 0.7)' }} />
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--accent)' }} />
                  <span>More</span>
                </div>
              </div>
            )}

            {view === 'year' && data.data && (
              <div className="bg-[var(--bg-card)] rounded-2xl p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.data}>
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                        tickFormatter={(value) => `${value}m`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [formatMinutes(value), 'Focus Time']}
                      />
                      <Bar dataKey="totalFocusMinutes" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
