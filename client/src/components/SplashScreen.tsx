import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 700),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => {
        setPhase(3);
        setTimeout(onComplete, 400);
      }, 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--bg-primary)] transition-opacity duration-400"
      style={{ opacity: phase === 3 ? 0 : 1 }}
    >
      <p
        className="text-[var(--text-muted)] mb-2 transition-all duration-1000"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        hello world.
      </p>
      <h1
        className="text-6xl md:text-8xl font-serif text-[var(--accent)] mb-4 transition-all duration-800"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'scale(1)' : 'scale(0.9)',
        }}
      >
        MINDORA
      </h1>
      <p
        className="text-[var(--text-muted)] text-sm tracking-widest uppercase transition-all duration-600"
        style={{
          opacity: phase >= 2 ? 1 : 0,
        }}
      >
        Digital Distraction Analysis System
      </p>
    </div>
  );
}
