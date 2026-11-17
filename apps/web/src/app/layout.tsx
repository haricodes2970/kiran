import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: {
    default: "Kiran's Infotech — Computer Hardware, Certified Refurbished Laptops & IT Service Lab",
    template: "%s | Kiran's Infotech",
  },
  description:
    "Shop new laptops, desktops, NVMe SSDs, RAM modules, monitors, 40-point certified refurbished laptops, and book chip-level hardware repairs at Kiran's Infotech.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
