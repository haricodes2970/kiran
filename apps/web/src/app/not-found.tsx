import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="font-display text-3xl font-bold text-fg">404 — Page Not Found</h1>
      <p className="text-xs text-muted">
        The hardware listing or page you requested could not be found.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white"
        >
          Return to Homepage
        </Link>
        <Link
          href="/products"
          className="glass-pill rounded-full px-5 py-2 text-xs font-semibold text-fg"
        >
          Browse Catalogue
        </Link>
      </div>
    </div>
  );
}
