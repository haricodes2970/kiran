'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`glass-pill group relative inline-flex h-9 w-9 items-center justify-center rounded-control text-fg transition-colors duration-200 hover:border-accent ${className}`}
    >
      <Sun
        className={`h-4 w-4 text-amber-400 transition-all duration-300 motion-reduce:transition-none ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0 absolute'
        }`}
        aria-hidden="true"
      />
      <Moon
        className={`h-4 w-4 text-brand-600 transition-all duration-300 motion-reduce:transition-none ${
          !isDark
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0 absolute'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
