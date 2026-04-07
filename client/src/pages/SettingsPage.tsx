import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import AvatarSVG from '../components/AvatarSVG';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const [name, setName] = useState(user?.name || '');
  const [avatarGender, setAvatarGender] = useState(user?.avatarGender || 'neutral');
  const [subjects, setSubjects] = useState<string[]>(user?.subjects || []);
  const [presenceInterval, setPresenceInterval] = useState(user?.presenceIntervalMinutes || 10);
  const [sensitivity, setSensitivity] = useState(user?.sensitivityLevel || 'medium');
  const [newSubject, setNewSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/user/profile', {
        name,
        avatarGender,
      });
      updateUser({ name, avatarGender });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveSubjects = async () => {
    setSaving(true);
    try {
      await api.patch('/user/profile', { subjects });
      updateUser({ subjects });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await api.patch('/user/profile', {
        presenceIntervalMinutes: presenceInterval,
        sensitivityLevel: sensitivity,
      });
      updateUser({ presenceIntervalMinutes: presenceInterval, sensitivityLevel: sensitivity });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'preferences', label: 'Preferences', icon: '🔔' },
  ];

  if (user?.role === 'admin') {
    tabs.push({ id: 'admin', label: 'Admin', icon: '🛡️' });
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl text-[var(--text-primary)] mb-6">Settings</h1>

        <div className="flex gap-6">
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-[var(--bg-card)] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Profile Settings</h2>

                <div className="mb-6">
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-muted)] opacity-60"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-[var(--text-muted)] mb-3">Avatar</label>
                  <div className="flex gap-4">
                    {(['male', 'female', 'neutral'] as const).map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setAvatarGender(gender)}
                        className={`p-4 rounded-xl transition-all ${
                          avatarGender === gender
                            ? 'bg-[var(--accent-dim)] border-2 border-[var(--accent)]'
                            : 'bg-[var(--bg-surface)] border-2 border-transparent hover:border-[var(--border)]'
                        }`}
                      >
                        <AvatarSVG gender={gender} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'subjects' && (
              <div className="bg-[var(--bg-card)] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Manage Subjects</h2>

                <div className="flex flex-wrap gap-2 mb-6">
                  {subjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    >
                      {subject}
                      <button
                        onClick={() => removeSubject(subject)}
                        className="text-[var(--text-muted)] hover:text-[var(--danger)]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Add new subject..."
                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                    onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                  />
                  <button
                    onClick={addSubject}
                    className="px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold"
                  >
                    Add
                  </button>
                </div>

                <button
                  onClick={saveSubjects}
                  disabled={saving}
                  className="w-full mt-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-[var(--bg-card)] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Preferences</h2>

                <div className="mb-6">
                  <label className="block text-sm text-[var(--text-muted)] mb-3">
                    Presence Check Interval
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

                <div className="mb-6">
                  <label className="block text-sm text-[var(--text-muted)] mb-3">Sensitivity</label>
                  <div className="space-y-2">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <label
                        key={level}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          sensitivity === level
                            ? 'bg-[var(--accent-dim)] border border-[var(--accent)]'
                            : 'bg-[var(--bg-surface)] border border-transparent'
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
                          <p className="text-xs text-[var(--text-muted)]">
                            {level === 'low' && 'Only count tab switches longer than 30 seconds'}
                            {level === 'medium' && 'Count all tab switches'}
                            {level === 'high' && 'Count all switches + highlight long pauses'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'admin' && user?.role === 'admin' && (
              <AdminPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
      } catch (error) {
        console.error('Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Failed to toggle role');
    }
  };

  const downloadCsv = () => {
    window.open('/api/admin/export', '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[var(--accent)]">{stats.totalUsers}</p>
            <p className="text-xs text-[var(--text-muted)]">Total Users</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[var(--accent)]">{stats.totalSessions}</p>
            <p className="text-xs text-[var(--text-muted)]">Total Sessions</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[var(--accent)]">{stats.totalFocusHours}h</p>
            <p className="text-xs text-[var(--text-muted)]">Focus Hours</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[var(--accent)]">{stats.avgEfficiency}%</p>
            <p className="text-xs text-[var(--text-muted)]">Avg Efficiency</p>
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
          <h3 className="font-semibold text-[var(--text-primary)]">User Management</h3>
          <button
            onClick={downloadCsv}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold"
          >
            📥 Download CSV
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Name</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Email</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Role</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Sessions</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Focus</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-[var(--border)] last:border-0">
                <td className="p-4 text-sm text-[var(--text-primary)]">{u.name}</td>
                <td className="p-4 text-sm text-[var(--text-muted)]">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    u.role === 'admin' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-[var(--text-muted)]">{u.totalSessions}</td>
                <td className="p-4 text-sm text-[var(--text-muted)]">{Math.round(u.totalFocusMinutes / 60)}h</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleRole(u._id, u.role)}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    Make {u.role === 'admin' ? 'User' : 'Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
