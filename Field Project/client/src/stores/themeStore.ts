import { create } from 'zustand';

type Theme = 'midnight-ink' | 'warm-ivory';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('mindora-theme') as Theme;
  if (saved) return saved;
  return 'midnight-ink';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'midnight-ink' ? 'warm-ivory' : 'midnight-ink';
      localStorage.setItem('mindora-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { theme: newTheme };
    });
  },
}));
