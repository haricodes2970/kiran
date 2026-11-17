import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">404 — Page Not Found</h1>
      <p className="text-xs text-slate-500">
        The hardware listing or page you requested could not be found.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Homepage
        </Link>
        <Link
          href="/products"
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
        >
          Browse Catalogue
        </Link>
      </div>
    </div>
  );
}
