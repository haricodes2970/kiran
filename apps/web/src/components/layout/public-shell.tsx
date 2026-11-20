'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { IntroExperience } from '@/components/intro/intro-experience';
import { useTheme } from '@/context/theme-context';

/**
 * Isolates customer-facing storefront navigation, theme class, intro video, and footer from `/admin/*`.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isAdminRoute) {
      document.documentElement.classList.remove('dark');
      return;
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, isAdminRoute]);

  if (isAdminRoute) {
    return <main className="min-h-screen bg-slate-50 text-slate-900">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#EAF3FF] text-ink dark:bg-[#0B1930] dark:text-slate-100 overflow-x-clip transition-colors duration-300">
      <IntroExperience />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
