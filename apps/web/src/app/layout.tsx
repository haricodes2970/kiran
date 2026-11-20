import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { ThemeProvider } from '@/context/theme-context';
import { PublicShell } from '@/components/layout/public-shell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Kiran's Infotech — Laptops, Computer Hardware & IT Services",
    template: "%s | Kiran's Infotech",
  },
  description:
    "Discover quality laptops, computer hardware, certified refurbished devices, and professional repair and upgrade services at Kiran's Infotech.",
  icons: {
    icon: '/brand/kirans-mark.png',
    apple: '/brand/kirans-mark.png',
  },
};

const THEME_INIT_SCRIPT = `(function(){try{if(location.pathname.startsWith('/admin')){document.documentElement.classList.remove('dark');return;}var t=localStorage.getItem('ki_theme_v1');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <AppProvider>
          <ThemeProvider>
            <PublicShell>{children}</PublicShell>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
