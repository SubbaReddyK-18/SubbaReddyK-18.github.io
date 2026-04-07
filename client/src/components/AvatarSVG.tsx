interface AvatarSVGProps {
  gender: 'male' | 'female' | 'neutral';
}

export default function AvatarSVG({ gender }: AvatarSVGProps) {
  if (gender === 'male') {
    return (
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <defs>
          <linearGradient id="maleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A90D9" />
            <stop offset="100%" stopColor="#2E5A8B" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#maleGradient)" />
        <circle cx="50" cy="38" r="16" fill="#fff" />
        <circle cx="45" cy="35" r="2" fill="#2E5A8B" />
        <circle cx="55" cy="35" r="2" fill="#2E5A8B" />
        <path d="M 44 42 Q 50 46 56 42" stroke="#2E5A8B" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 30 30 Q 35 22 42 28" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 70 30 Q 65 22 58 28" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (gender === 'female') {
    return (
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <defs>
          <linearGradient id="femaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E91E8C" />
            <stop offset="100%" stopColor="#B8157A" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#femaleGradient)" />
        <path d="M 25 40 Q 30 15 50 12 Q 70 15 75 40 Q 70 35 50 32 Q 30 35 25 40" fill="#fff" />
        <circle cx="50" cy="48" r="14" fill="#fff" />
        <circle cx="45" cy="46" r="2" fill="#B8157A" />
        <circle cx="55" cy="46" r="2" fill="#B8157A" />
        <path d="M 44 52 Q 50 55 56 52" stroke="#B8157A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="65" r="4" fill="#fff" opacity="0.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      <defs>
        <linearGradient id="neutralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9E9E9E" />
          <stop offset="100%" stopColor="#616161" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#neutralGradient)" />
      <circle cx="50" cy="45" r="15" fill="#fff" />
      <circle cx="45" cy="43" r="2" fill="#616161" />
      <circle cx="55" cy="43" r="2" fill="#616161" />
      <line x1="45" y1="50" x2="55" y2="50" stroke="#616161" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
