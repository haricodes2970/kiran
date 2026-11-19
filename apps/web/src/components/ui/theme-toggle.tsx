'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

/**
 * Liquid-glass animated Dark / Light theme switch with spring-glide thumb,
 * specular rim lighting, day/night atmospheric track, and reduced-motion support.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
      data-testid="theme-toggle"
      className={`group relative inline-flex h-9 w-[66px] shrink-0 cursor-pointer items-center rounded-full p-1 transition-all duration-500 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none ${
        isDark
          ? 'bg-gradient-to-r from-[#071122] via-[#0F2347] to-[#1A3564] border border-blue-400/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14),0_6px_18px_-6px_rgba(37,99,235,0.45)]'
          : 'bg-gradient-to-r from-[#FEF3C7]/85 via-[#E0EEFF] to-[#DBEAFE] border border-blue-300/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_4px_14px_-6px_rgba(20,35,59,0.22)]'
      } ${className}`}
    >
      {/* Subtle atmospheric stars (night) / horizon shimmer (day) */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500 motion-reduce:transition-none ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="absolute left-2.5 top-2 h-1 w-1 rounded-full bg-blue-200/85" />
        <span className="absolute left-5 top-5 h-0.5 w-0.5 rounded-full bg-white/75" />
        <span className="absolute left-3.5 bottom-2 h-0.5 w-0.5 rounded-full bg-electric/90" />
      </span>

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500 motion-reduce:transition-none ${
          isDark ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="absolute right-2.5 top-2.5 h-1 w-2.5 rounded-full bg-white/75 blur-[0.5px]" />
        <span className="absolute right-4 bottom-2 h-1 w-1.5 rounded-full bg-white/60" />
      </span>

      {/* Ambient state glow under the active thumb */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1 h-7 w-7 rounded-full blur-md transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
          isDark
            ? 'translate-x-[30px] bg-blue-400/45'
            : 'translate-x-0 bg-amber-400/55'
        }`}
      />

      {/* Glossy Liquid-Glass Sliding Knob */}
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.04] motion-reduce:transition-none ${
          isDark
            ? 'translate-x-[30px] bg-gradient-to-b from-[#1E3A6E]/95 to-[#0B1930]/95 border border-blue-300/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_4px_12px_rgba(2,8,20,0.65)]'
            : 'translate-x-0 bg-gradient-to-b from-white to-[#F4F8FF]/95 border border-white shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_3px_10px_rgba(20,35,59,0.2)]'
        }`}
      >
        <Sun
          className={`h-3.5 w-3.5 text-amber-500 transition-all duration-500 motion-reduce:transition-none ${
            isDark
              ? 'rotate-90 scale-0 opacity-0 absolute'
              : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon
          className={`h-3.5 w-3.5 text-blue-200 transition-all duration-500 motion-reduce:transition-none ${
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0 absolute'
          }`}
        />
      </span>
    </button>
  );
}
