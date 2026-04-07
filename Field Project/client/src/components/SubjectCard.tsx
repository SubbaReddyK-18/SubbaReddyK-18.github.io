import { getSubjectEmoji } from '../lib/utils';

interface SubjectCardProps {
  subject: string;
  selected: boolean;
  onClick: () => void;
}

export default function SubjectCard({ subject, selected, onClick }: SubjectCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        selected
          ? 'bg-[var(--accent-dim)] border-2 border-[var(--accent)] shadow-lg shadow-[var(--accent)]/10'
          : 'bg-[var(--bg-card)] border-2 border-transparent hover:border-[var(--border)] hover:-translate-y-0.5'
      }`}
    >
      <span className="text-2xl">{getSubjectEmoji(subject)}</span>
      <span className="font-medium text-[var(--text-primary)]">{subject}</span>
    </button>
  );
}
