import React from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className="rounded-full border px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
};





