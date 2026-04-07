export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export const getSubjectEmoji = (subject: string): string => {
  const emojiMap: Record<string, string> = {
    'DSA': '💻',
    'Web Dev': '🌐',
    'DBMS': '🗄️',
    'Operating Systems': '💿',
    'Computer Networks': '🌍',
    'Machine Learning': '🤖',
    'Python': '🐍',
    'Java': '☕',
    'C/C++': '⚙️',
    'Mathematics': '📐',
    'Physics': '⚡',
    'Chemistry': '🧪',
    'Biology': '🧬',
    'History': '📜',
    'Economics': '📊',
    'English': '📖',
  };
  return emojiMap[subject] || '📚';
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
